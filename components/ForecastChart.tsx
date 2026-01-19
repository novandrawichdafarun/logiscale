"use client";

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

interface ChartProps {
  data: { date: string; sales: number }[];
  reorderPoint: number;
  safetyStock: number;
}

export default function ForecastChart({
  data,
  reorderPoint,
  safetyStock,
}: ChartProps) {
  return (
    <div className="h-[400px] w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">
        Analisis Tren Penjualan (90 Hari)
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(str) => {
              const date = new Date(str);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Legend />

          {/* Garis Penjualan Real */}
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#2563eb"
            strokeWidth={2}
            name="Penjualan Harian"
            dot={false}
          />

          {/* Garis Batas ROP (Reorder Point) - Visualisasi Kunci */}
          <ReferenceLine
            y={reorderPoint}
            label="Reorder Point"
            stroke="red"
            strokeDasharray="3 3"
          />

          {/* Garis Safety Stock */}
          <ReferenceLine
            y={safetyStock}
            label="Safety Stock"
            stroke="green"
            strokeDasharray="3 3"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
