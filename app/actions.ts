"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { transaction_type } from "@/prisma/generated/prisma/enums";

export async function createPurchaseOrder(productId: string, quantity: number) {
  try {
    if (quantity <= 0) throw new Error("Quantity must be positive");

    const po = await prisma.purchaseOrder.create({
      data: {
        productId,
        quantity,
        status: "SENT_TO_SUPPLIER",
      },
    });

    console.log(`✅ PO Created: ${po.id} for ${quantity} items`);

    revalidatePath("/");

    return { success: true, message: "Order sent to supplier!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to create order" };
  }
}

export async function receivePurchaseOrder(poId: string) {
  try {
    //? Atomic Transaction
    await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUniqueOrThrow({
        where: { id: poId },
      });

      if (po.status === "RECEIVED") throw new Error("PO already received!");

      await tx.purchaseOrder.update({
        where: { id: poId },
        data: { status: "RECEIVED" },
      });

      const updateProduct = await tx.product.update({
        where: { id: po.productId },
        data: {
          currentStock: { increment: po.quantity }, //! Atomic Increment
        },
      });

      await tx.transaction.create({
        data: {
          id: crypto.randomUUID(),
          organizationId: updateProduct.organizationId,
          productId: po.productId,
          type: transaction_type.INBOUND, //! Barang Masuk
          quantity: po.quantity,
        },
      });

      revalidatePath("/orders");
      revalidatePath("/");

      return { success: true, message: "Goods received & Stock updated!" };
    });
  } catch (error) {
    console.error("Receiving Error:", error);
    return { success: false, message: "Failed to receive goods" };
  }
}

export async function addNewProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const price = Number(formData.get("price"));
  const supplierId = formData.get("supplierId") as string;

  if (!name || !sku || !price || !supplierId) {
    return { success: false, message: "Mohon lengkapi semua input field" };
  }

  try {
    const supplier = await prisma.supplier.findUniqueOrThrow({
      where: { id: supplierId },
    });

    await prisma.product.create({
      data: {
        id: crypto.randomUUID(),
        organizationId: supplier.organizationId,
        supplierId: supplierId,
        name: name,
        sku: sku,
        price: price,
        currentStock: 0,
      },
    });

    revalidatePath("/products");
    return { success: true, message: "Produk berhasil ditambahkan!" };
  } catch (error) {
    console.error("Add Product Error:", error);
    return {
      success: false,
      message: "Gagal menambahkan product. Pastikan SKU unik.",
    };
  }
}

export async function updateProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const price = Number(formData.get("price"));
  const supplierId = formData.get("supplierId") as string;

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        price,
        supplierId,
      },
    });

    revalidatePath("/products");
    return { success: true, message: "Data produk berhasil diperbarui!" };
  } catch (error) {
    console.error("Update Product Error:", error);
    return { success: false, message: "Gagal update Product" };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const hasTransactions = await prisma.transaction.count({
      where: { productId },
    });

    const hasPo = await prisma.purchaseOrder.count({
      where: { productId },
    });

    if (hasTransactions > 0 || hasPo > 0) {
      return {
        success: false,
        message:
          "Gagal Menghapus: Produk ini memiliki riwayat transaksi atau terdaftar dalam PO",
      };
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/products");
    return { success: true, message: "Produk berhasil dihapus" };
  } catch (error) {
    console.error("Delete Error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus produk.",
    };
  }
}

export async function recordStockOut(productId: string, quantity: number) {
  if (quantity <= 0) return { success: false, message: "Jumlah harus positif" };

  try {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUniqueOrThrow({
        where: { id: productId },
      });

      if (product.currentStock < quantity)
        throw new Error(`Stok tidak cukup! Sisa stok: ${product.currentStock}`);

      const updateProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: { decrement: quantity } },
      });

      await tx.transaction.create({
        data: {
          id: crypto.randomUUID(),
          organizationId: updateProduct.organizationId,
          productId: productId,
          type: transaction_type.OUTBOUND,
          quantity: quantity,
        },
      });
      return { success: true, message: " Stok berhasil dikurangi." };
    });

    revalidatePath("/products");
    revalidatePath("/");
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Gagal mencatat transaksi keluar.",
    };
  }
}

export async function addNewSupplier(formData: FormData) {
  const name = formData.get("name") as string;
  const leadTime = Number(formData.get("leadTime"));

  if (!name || !leadTime)
    return { success: false, message: "Nama dan Lead Time wajib diisi." };

  try {
    const org = await prisma.organization.findFirstOrThrow();

    await prisma.supplier.create({
      data: {
        id: crypto.randomUUID(),
        organizationId: org.id,
        name: name,
        leadTimeDays: leadTime,
      },
    });

    revalidatePath("/suppliers");
    revalidatePath("/products");
    return { success: true, message: "Supplier berhasil ditambahkan!" };
  } catch (error) {
    console.error("Add Supplier Error:", error);
    return { success: false, message: "Gagal menambahkan supplier." };
  }
}

export async function updateSupplier(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const leadTime = Number(formData.get("leadTime"));

  try {
    await prisma.supplier.update({
      where: { id },
      data: {
        name,
        leadTimeDays: leadTime,
      },
    });

    revalidatePath("/suppliers");
    revalidatePath("/products");
    return { success: true, message: "Supplier Berhasil diperbarui" };
  } catch (error) {
    console.error("Update Supplier Error:", error);
    return { success: false, message: "Gagal Update Supplier" };
  }
}

export async function deleteSupplier(id: string) {
  try {
    const productCount = await prisma.product.count({
      where: { supplierId: id },
    });

    if (productCount > 0) {
      return {
        success: false,
        message: `Gagal: Supplier ini menyuplai ${productCount} produk. Hapus produknya dulu.`,
      };
    }

    await prisma.supplier.delete({ where: { id } });

    revalidatePath("/suppliers");
    return { success: true, message: "Supplier berhasil dihapus" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menghapus supplier" };
  }
}
