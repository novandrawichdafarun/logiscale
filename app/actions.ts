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
