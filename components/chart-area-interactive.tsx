'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { DateRange } from 'react-day-picker'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { useIsMobile } from '@/hooks/use-mobile'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

import { z } from 'zod'

import { incidentsSchema } from '@/lib/schemas/incidents'
import { DatePickerWithRange } from './date-range-picker'

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
    onDateRangeChange?: (dateRange: DateRange | undefined) => void
}

export function ChartAreaInteractive({ onLegendClick, activeUrgencyFilter, chartData, onDateRangeChange }: ChartAreaInteractiveProps) {
    const [hiddenSeries, setHiddenSeries] = useState<string[]>([])
    const [selectedSeries, setSelectedSeries] = useState<string | null>(null)
    const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 400 })
    const containerRef = useRef<HTMLDivElement>(null)

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
                </CardDescription>
                <CardAction>
                    <DatePickerWithRange onDateChange={onDateRangeChange} />
                </CardAction>
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
