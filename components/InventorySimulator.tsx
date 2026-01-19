"use client";

import { useState, useMemo, useTransition } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { Settings2, RefreshCcw, ShoppingCart, Loader2 } from "lucide-react";
import { createPurchaseOrder } from "@/app/actions";

interface Props {
  initialData: {
    productId: string;
    avgDailySales: number;
    stdDev: number; // Kita butuh standar deviasi dikirim dari server
    leadTimeDays: number;
    currentStock: number;
  };
  chartData: { date: string; sales: number }[];
}

export default function InventorySimulator({ initialData, chartData }: Props) {
  const [leadTime, setLeadTime] = useState(initialData.leadTimeDays);
  const [serviceLevel, setServiceLevel] = useState(95); //! Default 95% (Z=1.65)
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  const simulation = useMemo(() => {
    //? Konversi Service Level (%) ke Z-Score statistik
    //! 90%->1.28, 95%->1.65, 99%->2.33
    let zScore = 1.65;
    if (serviceLevel >= 99) zScore = 2.33;
    else if (serviceLevel >= 95) zScore = 1.65;
    else if (serviceLevel >= 90) zScore = 1.28;
    else zScore = 1.0; // 85%

    const newSafetyStock = Math.ceil(
      zScore * initialData.stdDev * Math.sqrt(leadTime),
    );

    //? Rumus Reorder Point Dinamis
    const leadTimeDemand = initialData.avgDailySales * leadTime;
    const newReorderPoint = Math.ceil(leadTimeDemand + newSafetyStock);

    return {
      safetyStock: newSafetyStock,
      reorderPoint: newReorderPoint,
      zScore,
    };
  }, [leadTime, serviceLevel, initialData]);

  //? Handle Click
  const handleRestock = () => {
    const orderQty = simulation.reorderPoint * 2 - initialData.currentStock;

    startTransition(async () => {
      const result = await createPurchaseOrder(initialData.productId, orderQty);
      if (result.success) setMsg(`✅ PO Created: ${orderQty} units`);
    });
  };

  const isDanger = initialData.currentStock <= simulation.reorderPoint;

  return (
    <div className="space-y-6">
      {/* CONTROL PANEL (Simulator) */}
      <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          <Settings2 className="text-blue-600" />
          <h3 className="font-bold text-gray-800">What-If Simulation Panel</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Slider 1: Lead Time */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-600">
                Lead Time Supplier
              </label>
              <span className="font-bold text-blue-600 bg-blue-50 px-2 rounded">
                {leadTime} Hari
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="60"
              value={leadTime}
              onChange={(e) => setLeadTime(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-xs text-gray-400">
              Geser jika supplier mengalami keterlambatan.
            </p>
          </div>

          {/* Slider 2: Service Level */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-gray-600">
                Target Service Level
              </label>
              <span className="font-bold text-purple-600 bg-purple-50 px-2 rounded">
                {serviceLevel}% (Z={simulation.zScore})
              </span>
            </div>
            <input
              type="range"
              min="85"
              max="99"
              step="1"
              value={serviceLevel}
              onChange={(e) => setServiceLevel(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <p className="text-xs text-gray-400">
              Meningkatkan % akan memperbesar Safety Stock.
            </p>
          </div>
        </div>
      </div>

      {/* HASIL SIMULASI (Metrik) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <p className="text-gray-500 text-sm">Simulated Safety Stock</p>
          <p className="text-2xl font-bold text-gray-800">
            {simulation.safetyStock} Unit
          </p>
        </div>

        <div
          className={`p-5 rounded-xl border-2 ${
            isDanger
              ? "border-red-400 bg-red-50"
              : "border-green-400 bg-green-50"
          }`}
        >
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm font-semibold">
              Simulated Reorder Point (ROP)
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {simulation.reorderPoint} Unit
            </p>
          </div>

          {/* Tombol Restock */}
          {isDanger && (
            <button
              onClick={handleRestock}
              disabled={isPending}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg fount-bold shadow-lg active:sclae-95 transition-all"
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <ShoppingCart size={18} />
              )}
              {isPending ? "Ordering..." : "Auto-Restock"}
            </button>
          )}

          <p className="text-xs mt-2 font-medium text-black">
            {isDanger
              ? "⚠️ STOK KRITIS! Segera lakukan pemesanan."
              : "✅ Stok saat ini masih aman."}
          </p>

          {/* Pesan */}
          {msg && (
            <p className="text-green-700 font-bold text-sm mt-2 bg-green-200 p-2 rounded">
              {msg}
            </p>
          )}
        </div>
      </div>

      {/* GRAFIK REAKTIF */}
      <div className="h-[400px] w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#94a3b8"
              strokeWidth={1}
              dot={false}
              name="History Penjualan"
            />
            {/* Garis Dinamis Hasil Simulasi */}
            <ReferenceLine
              y={simulation.reorderPoint}
              label={{
                position: "top",
                value: `ROP: ${simulation.reorderPoint}`,
                fill: "red",
                fontSize: 12,
              }}
              stroke="red"
              strokeDasharray="3 3"
            />
            <ReferenceLine
              y={simulation.safetyStock}
              label={{
                position: "top",
                value: `Safety: ${simulation.safetyStock}`,
                fill: "green",
                fontSize: 12,
              }}
              stroke="green"
              strokeDasharray="3 3"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
