"use client";

import { useState, useTransition } from "react";
import { updateSupplier, deleteSupplier } from "@/app/actions";
import { Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import { Supplier } from "@/app/types/Supplier";

export default function SupplierRow({ supplier }: { supplier: Supplier }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  // State lokal untuk form edit
  const [name, setName] = useState(supplier.name);
  const [leadTime, setLeadTime] = useState(supplier.leadTimeDays);

  const handleSave = () => {
    const formData = new FormData();
    formData.append("id", supplier.id);
    formData.append("name", name);
    formData.append("leadTime", leadTime.toString());

    startTransition(async () => {
      const res = await updateSupplier(formData);
      if (res.success) setIsEditing(false);
      else alert(res.message);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Hapus supplier "${supplier.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteSupplier(supplier.id);
      if (!res.success) alert(res.message);
    });
  };

  if (isEditing) {
    return (
      <tr className="bg-blue-50">
        <td className="p-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-1 rounded w-full"
          />
        </td>
        <td className="p-4">
          <input
            type="number"
            value={leadTime}
            onChange={(e) => setLeadTime(Number(e.target.value))}
            className="border p-1 rounded w-20"
          />
        </td>
        <td className="p-4 text-center text-gray-400">-</td>
        <td className="p-4 text-right flex justify-end gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={18} />
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="text-green-600 hover:text-green-800"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="p-4 font-medium text-gray-900">{supplier.name}</td>
      <td className="p-4 text-sm">{supplier.leadTimeDays} Hari</td>
      <td className="p-4 text-center">
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold">
          {/* Hitung jumlah produk per supplier */}
          {supplier._count?.product ?? 0} SKU
        </span>
      </td>
      <td className="p-4 text-right flex justify-end gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-400 hover:text-blue-600"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-red-400 hover:text-red-600"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </td>
    </tr>
  );
}
