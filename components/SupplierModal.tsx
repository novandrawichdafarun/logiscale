"use client";

import { addNewSupplier } from "@/app/actions";
import { useState, useTransition } from "react";
import { Truck, Loader2, X } from "lucide-react";
import { createPortal } from "react-dom";

export default function SupplierModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await addNewSupplier(formData);
      if (res.message) {
        setIsOpen(false);
        alert(res.message);
      } else {
        alert(res.message);
      }
    });
  }

  return (
    <>
      {/* Tombol Trigger (Kecil, di samping dropdown nanti) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 mt-1"
      >
        <Truck size={12} /> + Supplier Baru
      </button>

      {/* Modal Overlay */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 text-black">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-lg">
                  Tambah Supplier Mitra
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form action={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nama Perusahaan
                  </label>
                  <input
                    required
                    name="name"
                    type="text"
                    placeholder="PT. Sumber Makmur"
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Estimasi Lead Time (Hari)
                  </label>
                  <input
                    required
                    name="leadTime"
                    type="number"
                    min="1"
                    placeholder="7"
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    *Waktu rata-rata pengiriman barang sampai gudang.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    disabled={isPending}
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg flex justify-center items-center gap-2 transition-colors"
                  >
                    {isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Simpan Supplier"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
