export interface ChartProps {
  data: { date: string; sales: number }[];
  reorderPoint: number;
  safetyStock: number;
}
