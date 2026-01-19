import { prisma } from "@/lib/prisma";

async function main() {
  // 1. Buat Organisasi Demo
  const org = await prisma.organization.create({
    data: {
      id: crypto.randomUUID(),
      name: "Demo Corp Ltd.",
    },
  });

  // 2. Buat Supplier
  const supplier = await prisma.supplier.create({
    data: {
      id: crypto.randomUUID(),
      organizationId: org.id,
      name: "Global Imports Inc.",
      leadTimeDays: 14, // Butuh 2 minggu kirim barang
    },
  });

  // 3. Buat Produk: "Gaming Laptop"
  const product = await prisma.product.create({
    data: {
      id: crypto.randomUUID(),
      organizationId: org.id,
      supplierId: supplier.id,
      name: "Gaming Laptop X1",
      sku: "LPT-001",
      price: 15000000,
      currentStock: 50, // Stok awal pura-pura
    },
  });

  console.log(`Generating history for ${product.name}...`);

  // 4. GENERATE 90 HARI TRANSAKSI
  // Kita mundur 90 hari ke belakang, lalu maju hari demi hari
  const today = new Date();
  const daysHistory = 90;

  for (let i = daysHistory; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    // LOGIKA RANDOMISASI YANG REALISTIS:
    // Base penjualan: 5 unit/hari.
    // Volatilitas: +/- 0 sampai 5 unit.
    // Trend: Penjualan sedikit meningkat di akhir bulan (payday).

    let dailySales = 5 + Math.floor(Math.random() * 5);

    // Simulasikan lonjakan di akhir pekan
    if (date.getDay() === 0 || date.getDay() === 6) {
      dailySales += 3;
    }

    // Masukkan ke DB
    await prisma.transaction.create({
      data: {
        id: crypto.randomUUID(),
        organizationId: org.id,
        productId: product.id,
        type: "OUTBOUND",
        quantity: dailySales,
        createdAt: date,
      },
    });
  }

  console.log("Seeding completed. We have data to analyze!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
