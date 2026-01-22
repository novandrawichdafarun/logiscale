"use client";

import { useState, useTransition } from "react";
import { addNewProduct, recordStockOut } from "@/app/actions";
import { Plus, MinusCircle, Loader2, Save, Truck } from "lucide-react";
import { Supplier } from "@/app/types/Supplier";
import Link from "next/link";

export default function ProductManager({
  suppliers,
}: {
  suppliers: Supplier[];
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  //? Form Submit (Server Action via Form)
  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await addNewProduct(formData);
      if (res.success) {
        setIsAdding(false);
        alert(res.message);
      } else {
        alert(res.message);
      }
    });
  }

  return (
    <div className="mb-6">
      {/* Tombol Buka Form */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Tambah Produk Baru
        </button>
      )}

      {/* Form Tambah Produk (Inline) */}
      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm mt-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-gray-800 mb-4">
            Input Master Data Produk
          </h3>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Nama Produk
                </label>
                <input
                  required
                  name="name"
                  type="text"
                  className="w-full border p-2 rounded-lg"
                  placeholder="Contoh: Wireless Mouse"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  SKU (Kode Unik)
                </label>
                <input
                  required
                  name="sku"
                  type="text"
                  className="w-full border p-2 rounded-lg"
                  placeholder="Contoh: ACC-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Harga (IDR)
                </label>
                <input
                  required
                  name="price"
                  type="number"
                  className="w-full border p-2 rounded-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Supplier Utama
                </label>
                <select
                  required
                  name="supplierId"
                  className="w-full border p-2 rounded-lg bg-white"
                >
                  <option value="">-- Pilih Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                {/* Component Supplier Modal */}
                {/* <Link
                  href="/products"
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 mt-1"
                >
                  <Truck size={12} /> + Supplier Baru
                </Link> */}
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                Batal
              </button>
              <button
                disabled={isPending}
                type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}{" "}
                Simpan Produk
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

//? Sub-Componenet Tombol "Barang Keluar" di tabel
export function StockOutButton({
  productId,
  maxStock,
}: {
  productId: string;
  maxStock: number;
}) {
  const [qty, setQty] = useState(1);
  const [isPending, startTransition] = useTransition();

  const handleOut = () => {
    if (!confirm(`Konfirmasi mengeluarkan ${qty} item dari stok?`)) return;

    startTransition(async () => {
      const res = await recordStockOut(productId, qty);
      if (res.success) {
        setQty(1); //! Reset input
      } else {
        alert(res.message);
      }
    });
  };

  return (
    <div className="flex items-center gap-2 justify-center">
      <input
        type="number"
        min="1"
        max={maxStock}
        value={qty}
        onChange={(e) => setQty(parseInt(e.target.value))}
        className="w-16 border rounded px-2 py-1 text-sm text-black"
      />
      <button
        onClick={handleOut}
        disabled={isPending || maxStock === 0}
        className="flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md text-xs font-bold disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <MinusCircle size={14} />
        )}
        Keluar
      </button>
    </div>
  );
}
