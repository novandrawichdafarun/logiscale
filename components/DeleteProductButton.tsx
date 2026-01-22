"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/app/actions";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !confirm(
        `Yakin ingin menghapus produk "${productName}" secara permanen? `,
      )
    )
      return;

    startTransition(async () => {
      const res = await deleteProduct(productId);
      if (res.success) {
        alert(res.message);
      } else {
        alert(res.message);
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-gray-400 hover:text-red-600 transition-colors p-2"
      title="Hapus Produk"
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin text-red-600" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}
