import { prisma } from "@/lib/prisma";
import { Package, Tag } from "lucide-react";
import ProductManager, { StockOutButton } from "@/components/ProductManager";

export const dynamic = "force-dynamic";

export default async function ProductPage() {
  const products = await prisma.product.findMany({
    include: { supplier: true },
    orderBy: { name: "asc" },
  });

  const suppliers = await prisma.supplier.findMany({
    select: { id: true, name: true },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Package className="text-blue-600" /> Master Data Produk
        </h1>

        {/* Component Input (Client Side) */}
        {/* Kita oper data supplier ke sini agar bisa dipilih di dropdown */}
        <ProductManager suppliers={suppliers} />

        {/* Tabel List Produk */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
              <tr>
                <th className="p-4">Info Produk</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Harga</th>
                <th className="p-4 text-center">Stok Fisik</th>
                <th className="p-4 text-right">Aksi Barang Keluar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 group">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Tag size={12} /> {p.sku}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {p.supplier.name}
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    Rp {Number(p.price).toLocaleString("id-ID")}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        p.currentStock > p.reorderPoint
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {p.currentStock} Unit
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {/* Tombol Input Barang Keluar per Baris */}
                    <StockOutButton
                      productId={p.id}
                      maxStock={p.currentStock}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="p-10 text-center text-gray-400">
              Belum ada data produk.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
