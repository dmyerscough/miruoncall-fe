'use client'

import { useState, useEffect, use } from 'react'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { DataTable } from '@/components/data-table'
import { SiteHeader } from '@/components/site-header'

import { z } from 'zod'

import nextConfig from '@/next.config'

import { incidentsSchema } from '@/lib/schemas/incidents'

const { publicRuntimeConfig } = nextConfig

const fetchIncidents = async (teamId: string, since?: string, until?: string) => {
    try {
        const today = new Date()
        const lastWeek = new Date()
        lastWeek.setDate(today.getDate() - 7)

        const defaultSince = format(lastWeek, 'yyyy-MM-dd')
        const defaultUntil = format(today, 'yyyy-MM-dd')

        const req = await fetch(`${publicRuntimeConfig?.apiBackend}/${publicRuntimeConfig?.allIncidentsEndpoint}/${teamId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                since: since || defaultSince,
                until: until || defaultUntil,
            }),
        })

        const resp = await req.json()

        return incidentsSchema.parse(resp)
    } catch (error) {
        console.error('Error fetching incidents:', error)
        // Fallback to rawData if API fails
        // return incidentsSchema.parse(rawData)
        //   toast({
        //     variant: 'destructive',
        //     title: 'Uh oh! Something went wrong.',
        //     description: `${error.message}`,
        //   });
    }
}

function Dashboard({ params }: { params: Promise<{ team: string }> }) {
    const { team } = use(params)

    // State for fetched data and urgency filter
    const [data, setData] = useState<z.infer<typeof incidentsSchema> | undefined>()
    const [urgencyFilter, setUrgencyFilter] = useState<'high' | 'low' | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const loadIncidents = async (since?: string, until?: string) => {
        setIsLoading(true)
        try {
            const fetchedData = await fetchIncidents(team, since, until)
            if (fetchedData) {
                setData(incidentsSchema.parse(fetchedData))
            }
        } catch (error) {
            console.error('Failed to load incidents:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
        if (newDateRange?.from && newDateRange?.to) {
            const since = format(newDateRange.from, 'yyyy-MM-dd')
            const until = format(newDateRange.to, 'yyyy-MM-dd')
            loadIncidents(since, until)
        }
    }

    useEffect(() => {
        // Load data with default date range (last 7 days)
        const today = new Date()
        const lastWeek = new Date().setDate(today.getDate() - 7)

        const since = format(lastWeek, 'yyyy-MM-dd')
        const until = format(today, 'yyyy-MM-dd')

        loadIncidents(since, until)
    }, [])

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
