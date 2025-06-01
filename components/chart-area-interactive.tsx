"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"

const chartData = [
  { date: "2025-05-25", high: 0, low: 0 },
  { date: "2025-05-26", high: 0, low: 0 },
  { date: "2025-05-27", high: 2, low: 6 },
  { date: "2025-05-28", high: 6, low: 10 },
  { date: "2025-05-29", high: 1, low: 4 },
  { date: "2025-05-30", high: 0, low: 4 },
  { date: "2025-05-31", high: 0, low: 0 },
]

const chartConfig = {
  alerts: {
    label: "Alert Priority",
  },
  high: {
    label: "High Priority",
    color: "#dc2626",
  },
  low: {
    label: "Low Priority",
    color: "#fbbf24",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const [hiddenSeries, setHiddenSeries] = React.useState<string[]>([])
  const [selectedSeries, setSelectedSeries] = React.useState<string | null>(null)
  const [chartDimensions, setChartDimensions] = React.useState({ width: 0, height: 400 })
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        setChartDimensions({
          width: width > 0 ? width : 0,
          height: 400
        })
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const handleLegendClick = (dataKey: string) => {
    // Get all available data keys from the chart data
    const allDataKeys = Object.keys(chartData[0] || {}).filter(key => key !== 'date')

    if (selectedSeries === dataKey) {
      // If clicking the already selected series, show all series
      setSelectedSeries(null)
      setHiddenSeries([])
    } else {
      // Show only the selected series, hide all others
      setSelectedSeries(dataKey)
      setHiddenSeries(allDataKeys.filter(key => key !== dataKey))
    }
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Alerts</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent ref={containerRef} className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} style={{ height: chartDimensions.height, width: '100%' }}>
          <BarChart
            accessibilityLayer
            data={chartData}
            width={chartDimensions.width}
            height={chartDimensions.height}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend
              content={(props) => (
                <ChartLegendContent
                  payload={props.payload}
                  onDataKeyClick={handleLegendClick}
                  hiddenSeries={hiddenSeries}
                  showOnlySelected={true}
                />
              )}
            />
            <Bar
              dataKey="high"
              stackId="a"
              fill="var(--color-high)"
              radius={[0, 0, 4, 4]}
              hide={hiddenSeries.includes("high")}
            />
            <Bar
              dataKey="low"
              stackId="a"
              fill="var(--color-low)"
              radius={[4, 4, 0, 0]}
              hide={hiddenSeries.includes("low")}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
