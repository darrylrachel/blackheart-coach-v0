"use client"
import { Card, CardContent } from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface WeightChartProps {
  data: {
    date: string
    weight: number | null
  }[]
  weightUnit: string
}

export function WeightChart({ data, weightUnit }: WeightChartProps) {
  // Filter out null weights and format the data for the chart
  const chartData = data
    .filter((entry) => entry.weight !== null)
    .map((entry) => ({
      date: entry.date,
      weight: entry.weight,
      formattedDate: format(parseISO(entry.date), "MMM d"),
    }))

  // Calculate min and max for the y-axis
  const weights = chartData.map((entry) => entry.weight as number)
  const minWeight = Math.min(...weights) * 0.95 // 5% buffer below min
  const maxWeight = Math.max(...weights) * 1.05 // 5% buffer above max

  if (chartData.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-60">
        <p className="text-muted-foreground text-center">
          {chartData.length === 0 ? "No weight data available yet" : "Need at least two data points to show a chart"}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <Line type="monotone" dataKey="weight" stroke="#BFA85D" strokeWidth={2} dot={{ r: 4 }} />
          <XAxis dataKey="formattedDate" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[minWeight, maxWeight]}
            tickFormatter={(value) => `${value} ${weightUnit}`}
          />
          <Tooltip
            formatter={(value: number) => [`${value} ${weightUnit}`, "Weight"]}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Starting Weight</div>
            <div className="text-2xl font-bold">
              {chartData[0]?.weight} {weightUnit}
            </div>
            <div className="text-xs text-muted-foreground">{chartData[0]?.formattedDate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Current Weight</div>
            <div className="text-2xl font-bold">
              {chartData[chartData.length - 1]?.weight} {weightUnit}
            </div>
            <div className="text-xs text-muted-foreground">{chartData[chartData.length - 1]?.formattedDate}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
