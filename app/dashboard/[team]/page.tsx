'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { DateRange } from 'react-day-picker'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { DataTable } from '@/components/data-table'
import { SiteHeader } from '@/components/site-header'

import { z } from 'zod'

import { incidentsSchema } from '@/lib/schemas/incidents'
import { toast } from 'sonner'

const fetchIncidents = async (teamId: string, since: Date, until: Date) => {
    try {
        const sinceDate = new Date(since)
        sinceDate.setHours(0, 0, 0, 0)

        const untilDate = new Date(until)
        untilDate.setHours(23, 59, 59, 999)

        // Use the Next.js API route instead of direct backend call
        const req = await fetch(`/api/incidents/${teamId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                since: sinceDate.toISOString(),
                until: untilDate.toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }),
        })

        const resp = await req.json()

        if (!req.ok) {
            throw new Error(`API request failed with status ${req.status}`)
        }

        return incidentsSchema.parse(resp)
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Zod validation error:', error.errors)
            toast.error('Server returned invalid data format.', { position: 'top-center', duration: 3000 })
        } else {
            console.error('Error fetching incidents:', error)
            toast.error('Failed to load incidents. Please try again later.', { position: 'top-center', duration: 3000 })
        }

        return undefined
    }
}

function Dashboard({ params }: { params: Promise<{ team: string }> }) {
    const { team } = use(params)

    // State for fetched data and urgency filter
    const [data, setData] = useState<z.infer<typeof incidentsSchema> | undefined>()
    const [urgencyFilter, setUrgencyFilter] = useState<'high' | 'low' | null>(null)
    // const [isLoading, setIsLoading] = useState(true)

    const loadIncidents = useCallback(
        async (since: Date, until: Date) => {
            // setIsLoading(true)
            try {
                const fetchedData = await fetchIncidents(team, since, until)
                if (fetchedData && fetchedData.incidents && fetchedData.summary && fetchedData.team) {
                    setData(fetchedData)
                } else {
                    console.warn('Incomplete data received from API:', fetchedData)
                    toast.error('Received incomplete data from server. Please try again.', { position: 'top-center', duration: 3000 })
                }
            } catch (error) {
                console.error('Failed to load incidents:', error)
                toast.error('Failed to load incidents. Please check your connection and try again.', { position: 'top-center', duration: 3000 })
            } finally {
                // setIsLoading(false)
            }
        },
        [team]
    )

    const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
        if (newDateRange?.from && newDateRange?.to) {
            // Set since date to beginning of day in local timezone
            const sinceDate = new Date(newDateRange.from)
            sinceDate.setHours(0, 0, 0, 0)

            // Set until date to end of day in local timezone
            const untilDate = new Date(newDateRange.to)
            untilDate.setHours(23, 59, 59, 999)

            loadIncidents(sinceDate, untilDate)
        }
    }

    useEffect(() => {
        // Load data with default date range (last 7 days)
        const today = new Date()
        const lastWeek = new Date()
        lastWeek.setDate(today.getDate() - 7)

        // Set since date to beginning of day in local timezone
        const sinceDate = new Date(lastWeek)
        sinceDate.setHours(0, 0, 0, 0)

        // Set until date to end of day in local timezone
        const untilDate = new Date(today)
        untilDate.setHours(23, 59, 59, 999)

        loadIncidents(sinceDate, untilDate)
    }, [loadIncidents])

    const handleLegendClick = (dataKey: string) => {
        if (dataKey === 'high' || dataKey === 'low') {
            setUrgencyFilter((prev) => (prev === dataKey ? null : dataKey))
        }
    }

    return (
        <>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-4 lg:px-6">
                            <ChartAreaInteractive
                                onLegendClick={handleLegendClick}
                                activeUrgencyFilter={urgencyFilter}
                                chartData={data}
                                onDateRangeChange={handleDateRangeChange}
                            />
                        </div>
                        <DataTable data={data?.incidents || []} urgencyFilter={urgencyFilter} teamId={data?.team?.team_id || ''} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard
