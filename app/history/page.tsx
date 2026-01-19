// app/history/page.tsx
import { prisma } from "@/lib/prisma";
import {
  ArrowDownRight,
  ArrowUpRight,
  History,
  PackageSearch,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  // 1. Ambil 50 transaksi terakhir (untuk performa)
  // Include product untuk menampilkan nama barang
  const logs = await prisma.transaction.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-purple-100 p-3 rounded-xl text-purple-700">
            <History size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Inventory Audit Log
            </h1>
            <p className="text-gray-500 text-sm">
              Melacak setiap pergerakan stok (Masuk/Keluar)
            </p>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-medium">Waktu</th>
                <th className="p-4 font-medium">Perubahan</th>
                <th className="p-4 font-medium">Produk</th>
                <th className="p-4 font-medium text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => {
                const isInbound = log.type === "INBOUND";

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Kolom Waktu */}
                    <td className="p-4 text-sm text-gray-500">
                      {log.createdAt.toLocaleDateString()}
                      <span className="text-gray-300 mx-2">|</span>
                      {log.createdAt.toLocaleTimeString()}
                    </td>

                    {/* Kolom Tipe (Indikator Visual) */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isInbound
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isInbound ? (
                          <ArrowDownRight size={14} />
                        ) : (
                          <ArrowUpRight size={14} />
                        )}
                        {log.type}
                      </span>
                    </td>

                    {/* Kolom Produk */}
                    <td className="p-4 font-medium text-gray-900">
                      {log.product.name}
                      <div className="text-xs text-gray-400 font-mono mt-0.5">
                        SKU: {log.product.sku}
                      </div>
                    </td>

                    {/* Kolom Quantity */}
                    <td
                      className={`p-4 text-right font-bold font-mono ${
                        isInbound ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isInbound ? "+" : "-"}
                      {log.quantity}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {logs.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
              <PackageSearch size={48} className="mb-4 opacity-20" />
              <p>Belum ada riwayat transaksi.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
