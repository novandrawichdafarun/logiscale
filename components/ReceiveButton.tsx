"use client";
import { useTransition } from "react";
import { receivePurchaseOrder } from "@/app/actions";
import { PackageCheck, Loader2 } from "lucide-react";

export default function ReceiveButton({ poId }: { poId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleReceive = () => {
    if (!confirm("Konfirmasi Penerimaan barang fisik di gudang?")) return;

    startTransition(async () => {
      await receivePurchaseOrder(poId);
    });
  };

  return (
    <button
      onClick={handleReceive}
      disabled={isPending}
      className="inline-flex items-center gap-1 bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <PackageCheck size={14} />
      )}
      {isPending ? "Processing..." : "Receive Items"}
    </button>
  );
}
