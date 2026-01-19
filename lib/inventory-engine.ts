// lib/inventory-engine.ts
import { prisma } from "./prisma";

// Type Definition untuk Output Prediksi
export interface ForecastResult {
  productId: string;
  productName: string;
  metrics: {
    avgDailySales: number;
    stdDev: number;
    leadTimeDemand: number;
    safetyStock: number;
    reorderPoint: number;
  };
  status: "SAFE" | "WARNING" | "CRITICAL";
  chartData: { date: string; sales: number }[];
}

export async function generateForecast(
  productId: string,
): Promise<ForecastResult> {
  // 1. Fetch Data Produk & Lead Time
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: { supplier: true },
  });

  // 2. Fetch Data Transaksi 90 Hari Terakhir
  const historyWindow = 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - historyWindow);

  const sales = await prisma.transaction.findMany({
    where: {
      productId: productId,
      type: "OUTBOUND",
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: "asc" },
  });

  // --- MATH ENGINE START ---

  // A. Average Daily Sales (ADS)
  const totalSales = sales.reduce((acc, curr) => acc + curr.quantity, 0);
  const avgDailySales = totalSales / historyWindow;

  // B. Standard Deviation (Mengukur ketidakpastian pasar)
  const variance =
    sales.reduce((acc, curr) => {
      return acc + Math.pow(curr.quantity - avgDailySales, 2);
    }, 0) / historyWindow;
  const stdDev = Math.sqrt(variance);

  // C. Safety Stock Calculation
  // Service Level 95% = Z-Score 1.65
  const Z_SCORE = 1.65;
  const safetyStock = Math.ceil(
    Z_SCORE * stdDev * Math.sqrt(product.supplier.leadTimeDays),
  );

  // D. Reorder Point Formula (Titik Pemesanan Ulang)
  // ROP = (Average Sales * Lead Time) + Safety Stock
  const leadTimeDemand = avgDailySales * product.supplier.leadTimeDays;
  const reorderPoint = Math.ceil(leadTimeDemand + safetyStock);

  // --- MATH ENGINE END ---

  // Tentukan Status Stok
  let status: "SAFE" | "WARNING" | "CRITICAL" = "SAFE";
  if (product.currentStock <= 0) status = "CRITICAL";
  else if (product.currentStock <= reorderPoint) status = "WARNING";

  return {
    productId,
    productName: product.name,
    metrics: {
      avgDailySales: parseFloat(avgDailySales.toFixed(2)),
      stdDev: parseFloat(stdDev.toFixed(4)),
      leadTimeDemand: parseFloat(leadTimeDemand.toFixed(2)),
      safetyStock,
      reorderPoint,
    },
    status,
    // Format data untuk Recharts di Frontend
    chartData: sales.map((s) => ({
      date: s.createdAt.toISOString().split("T")[0],
      sales: s.quantity,
    })),
  };
}
