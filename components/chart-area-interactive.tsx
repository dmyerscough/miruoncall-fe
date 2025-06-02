'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { useIsMobile } from '@/hooks/use-mobile'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { z } from 'zod'

import { incidentsSchema } from '@/lib/schemas/incidents'

const chartConfig = {
    alerts: {
        label: 'Alert Priority',
    },
    high: {
        label: 'High Priority',
        color: '#dc2626',
    },
    low: {
        label: 'Low Priority',
        color: '#fbbf24',
    },
} satisfies ChartConfig

interface ChartAreaInteractiveProps {
    onLegendClick?: (dataKey: string) => void
    activeUrgencyFilter?: 'high' | 'low' | null
    chartData: z.infer<typeof incidentsSchema> | undefined
}

export function ChartAreaInteractive({ onLegendClick, activeUrgencyFilter, chartData }: ChartAreaInteractiveProps) {
    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = useState('90d')
    const [hiddenSeries, setHiddenSeries] = useState<string[]>([])
    const [selectedSeries, setSelectedSeries] = useState<string | null>(null)
    const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 400 })
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isMobile) {
            setTimeRange('7d')
        }
    }, [isMobile])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width } = entry.contentRect
                setChartDimensions({
                    width: width > 0 ? width : 0,
                    height: 400,
                })
            }
        })

        resizeObserver.observe(container)

        return () => {
            resizeObserver.disconnect()
        }
    }, [])

    useEffect(() => {
        if (activeUrgencyFilter) {
            const allDataKeys = ['high', 'low']
            setHiddenSeries(allDataKeys.filter((key) => key !== activeUrgencyFilter))
            setSelectedSeries(activeUrgencyFilter)
        } else {
            setHiddenSeries([])
            setSelectedSeries(null)
        }
    }, [activeUrgencyFilter])

    // Transform the summary data into chart format
    const incidentSummaryFormatted = useMemo(() => {
        if (!chartData?.summary) {
            return []
        }
        return Object.entries(chartData.summary).map(([date, values]) => ({
            date,
            high: values.high,
            low: values.low,
        }))
    }, [chartData])

    const handleLegendClick = (dataKey: string) => {
        if (onLegendClick) {
            onLegendClick(dataKey)
            return
        }

        const allDataKeys = Object.keys(incidentSummaryFormatted[0] || {}).filter((key) => key !== 'date')

        if (selectedSeries === dataKey) {
            setSelectedSeries(null)
            setHiddenSeries([])
        } else {
            setSelectedSeries(dataKey)
            setHiddenSeries(allDataKeys.filter((key) => key !== dataKey))
        }
    }

    // Show loading state when no data is available - moved after all hooks
    if (!chartData) {
        return (
            <Card className="@container/card">
                <CardHeader>
                    <CardTitle>Total Alerts</CardTitle>
                    <CardDescription>Loading chart data...</CardDescription>
                </CardHeader>
                <CardContent ref={containerRef} className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <div className="flex h-96 items-center justify-center">
                        <div className="text-muted-foreground">Loading...</div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>Total Alerts</CardTitle>
                <CardDescription>
                    <span className="hidden @[540px]/card:block">
                        A total of <span className=" font-semibold">{chartData?.incidents?.length || 0}</span>{' '}
                        {(chartData?.incidents?.length || 0) > 1 ? `alerts` : `alert`} were triggered during this time period.
                    </span>
                    <span className="@[540px]/card:hidden">Last 3 months</span>
                </CardDescription>
                {/* <CardAction>
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
                </CardAction> */}
            </CardHeader>
            <CardContent ref={containerRef} className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} style={{ height: chartDimensions.height, width: '100%' }}>
                    <BarChart accessibilityLayer data={incidentSummaryFormatted} width={chartDimensions.width} height={chartDimensions.height}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10} />
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
                        <Bar dataKey="high" stackId="a" fill="var(--color-high)" radius={[0, 0, 4, 4]} hide={hiddenSeries.includes('high')} />
                        <Bar dataKey="low" stackId="a" fill="var(--color-low)" radius={[4, 4, 0, 0]} hide={hiddenSeries.includes('low')} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
