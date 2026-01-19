import { prisma } from "@/lib/prisma";
import { Truck } from "lucide-react";
import ReceiveButton from "@/components/ReceiveButton";

export const dynamic = "force-dynamic";

export default async function OredersPage() {
  //? Query PO, urut dari terbaru
  const orders = await prisma.purchaseOrder.findMany({
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2x font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Truck className="text-blue-600" /> Inbound Purchase Orders
        </h1>

        {/* Tabel PO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
              <tr>
                <th className="p-4">PO ID</th>
                <th className="p-4">Product</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs text-gray-400">
                    #{po.id.slice(0, 8)}
                  </td>
                  <td className="p-4 font-medium">{po.product.name}</td>
                  <td className="p-4">{po.quantity} Unit</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        po.status === "RECEIVED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {po.createdAt.toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    {/* Tombol Action hanya muncul jika barang belum diterima */}
                    {po.status !== "RECEIVED" && <ReceiveButton poId={po.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="p-10 text-center text-gray-400">
              Belum ada pesanan pembelian
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
