"use client";

import { useState, useTransition, useEffect } from "react";
import { updateProduct } from "@/app/actions";
import { Pencil, Loader2, X, Save } from "lucide-react";
import { createPortal } from "react-dom";
import { ProductData } from "@/app/types/ProductData";
import { Supplier } from "@/app/types/Supplier";

export default function EditProductModal({
  product,
  suppliers,
}: {
  product: ProductData;
  suppliers: Supplier[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  });

  async function handleUpdate(formData: FormData) {
    startTransition(async () => {
      const res = await updateProduct(formData);
      if (res.success) {
        setIsOpen(false);
        // Optional: Toast success
        alert(res.message);
      } else {
        alert(res.message);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-blue-600 p-2 transition-colors"
        title="Edit Produk"
      >
        <Pencil size={16} />
      </button>

      {isOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center text-black justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 text-lg">
                  Edit Produk: {product.name}
                </h3>
                <button onClick={() => setIsOpen(false)}>
                  <X size={20} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <form action={handleUpdate} className="space-y-4">
                <input type="hidden" name="id" value={product.id} />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Nama Produk
                    </label>
                    <input
                      required
                      name="name"
                      defaultValue={product.name}
                      className="w-full border p-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      SKU
                    </label>
                    <input
                      required
                      name="sku"
                      defaultValue={product.sku}
                      className="w-full border p-2 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Harga
                    </label>
                    <input
                      required
                      type="number"
                      name="price"
                      defaultValue={Number(product.price)}
                      className="w-full border p-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Supplier
                    </label>
                    <select
                      name="supplierId"
                      defaultValue={product.supplierId}
                      className="w-full border p-2 rounded-lg bg-white"
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    disabled={isPending}
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700"
                  >
                    {isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}{" "}
                    Simpan Perubahan
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
