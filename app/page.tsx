import { prisma } from "@/lib/prisma";
import { generateForecast } from "@/lib/inventory-engine";
import ForecastChart from "@/components/ForecastChart";
import { AlertTriangle, CheckCircle, Package } from "lucide-react";
import InventorySimulator from "@/components/InventorySimulator";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const product = await prisma.product.findFirst();

  if (!product) {
    return <div className="p-10">Data kosong. Jalankan seed dulu.</div>;
  }

  const analysis = await generateForecast(product.id);

  const statusColor = {
    SAFE: "bg-green-100 text-green-800",
    WARNING: "bg-yellow-100 text-yellow-800",
    CRITICAL: "bg-red-100 text-red-800",
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">LogiScale AI</h1>
            <p className="text-gray-500">
              Intelligent Inventory Forecasting System
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${statusColor[analysis.status]}`}
          >
            {analysis.status === "SAFE" ? (
              <CheckCircle size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}
            Status: {analysis.status}
          </div>
        </header>

        {/* Kartu Metrik Utama (KPI) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            label="Stok Saat Ini"
            value={product.currentStock.toString()}
            sub="Unit Fisik"
          />
          <MetricCard
            label="Rata-rata Jual/Hari"
            value={analysis.metrics.avgDailySales.toString()}
            sub="Unit (90 Hari Terakhir)"
          />
          <MetricCard
            label="Safety Stock"
            value={analysis.metrics.safetyStock.toString()}
            sub="Buffer Aman (95% SL)"
            highlight
          />
          <MetricCard
            label="Reorder Point"
            value={analysis.metrics.reorderPoint.toString()}
            sub="Titik Pesan Ulang"
            highlight
          />
        </div>

        {/* Visualisasi Grafik */}
        <section>
          <ForecastChart
            data={analysis.chartData}
            reorderPoint={analysis.metrics.reorderPoint}
            safetyStock={analysis.metrics.safetyStock}
          />
        </section>

        <section className="p-6">
          <InventorySimulator
            initialData={{
              avgDailySales: analysis.metrics.avgDailySales,
              stdDev: analysis.metrics.stdDev, // Ini data baru dari backend
              leadTimeDays: analysis.metrics.leadTimeDemand,
              currentStock: product.currentStock,
            }}
            chartData={analysis.chartData}
          />
        </section>

        {/* Penjelasan Insight (Educational Value) */}
        <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Package size={18} />
            AI Insight
          </h4>
          <p className="text-blue-800 text-sm leading-relaxed">
            Berdasarkan volatilitas pasar selama 90 hari terakhir, sistem
            merekomendasikan Anda menyimpan minimal{" "}
            <strong>{analysis.metrics.safetyStock} unit</strong> sebagai
            cadangan (Safety Stock). Segera lakukan pemesanan ulang (Restock)
            ketika stok fisik menyentuh angka{" "}
            <strong>{analysis.metrics.reorderPoint} unit</strong>
            untuk menghindari kehabisan stok selama lead time supplier (
            {product.supplierId ? "14 Hari" : "-"}).
          </p>
        </section>
      </div>
    </main>
  );
}

// Komponen Kecil untuk Card (Langsung di file yang sama agar ringkas)
function MetricCard({ label, value, sub, highlight = false }: any) {
  return (
    <div
      className={`p-6 rounded-xl border shadow-sm ${highlight ? "bg-white border-blue-200" : "bg-white border-gray-100"}`}
    >
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 my-1">{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}
