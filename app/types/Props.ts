export interface Props {
  initialData: {
    productId: string;
    avgDailySales: number;
    stdDev: number; // Kita butuh standar deviasi dikirim dari server
    leadTimeDays: number;
    currentStock: number;
  };
  chartData: { date: string; sales: number }[];
}
