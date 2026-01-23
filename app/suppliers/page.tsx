import { prisma } from "@/lib/prisma";
import { Truck } from "lucide-react";
import SupplierRow from "@/components/SupplierRow";
import SupplierModal from "@/components/SupplierModal";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    include: { _count: { select: { product: true } } }, // Hitung jumlah produk per supplier
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Truck className="text-blue-600" /> Manajemen Supplier
        </h1>

        <SupplierModal />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
              <tr>
                <th className="p-4">Nama Perusahaan</th>
                <th className="p-4">Lead Time (Hari)</th>
                <th className="p-4 text-center">Jml Produk</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {suppliers.map((s) => (
                <SupplierRow key={s.id} supplier={s} />
              ))}
            </tbody>
          </table>

          {suppliers.length === 0 && (
            <div className="p-10 text-center text-gray-400">
              Belum ada supplier terdaftar.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
