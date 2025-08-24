"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChartData } from "@/lib/data-analysis"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface VisualizationChartsProps {
  charts: ChartData[]
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

export function VisualizationCharts({ charts }: VisualizationChartsProps) {
  const renderChart = (chart: ChartData) => {
    switch (chart.type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={chart.yAxis} fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={chart.yAxis}
                stroke={COLORS[0]}
                strokeWidth={2}
                dot={{ fill: COLORS[0] }}
              />
              {chart.data[0]?.trend && (
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke={COLORS[1]}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: COLORS[1] }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis} />
              <YAxis dataKey={chart.yAxis} />
              <Tooltip />
              <Legend />
              <Scatter dataKey={chart.yAxis} fill={COLORS[0]}>
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )

      default:
        return (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Chart type not supported
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {charts.map((chart) => (
        <Card key={chart.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {chart.title}
              <span className="text-sm font-normal text-muted-foreground capitalize">{chart.type} chart</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderChart(chart)}
            <p className="text-sm text-muted-foreground mt-4">{chart.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
