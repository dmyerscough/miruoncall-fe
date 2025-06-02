'use client'

import { useState, useEffect } from 'react'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { DataTable } from '@/components/data-table'
import { SiteHeader } from '@/components/site-header'

import { z } from 'zod'

import nextConfig from '@/next.config'

import { incidentSchema, incidentsSchema } from '@/lib/schemas/incidents'
// import rawData from './incidents.json'

const { publicRuntimeConfig } = nextConfig

const fetchIncidents = async () => {
    // if (!dateRange?.to || !dateRange?.from) {
    //     return
    // }

    // get the data from the api
    try {
        const req = await fetch(`${publicRuntimeConfig?.apiBackend}/${publicRuntimeConfig?.allIncidentsEndpoint}/98`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ since: '2025-05-26', until: '2025-06-02' }),
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

//   useEffect(() => {
//     fetchIncidents();
//   }, [dateRange]);

function Dashboard({ params }: { params: { team: string } }) {
    // State for fetched data and urgency filter
    const [data, setData] = useState<z.infer<typeof incidentsSchema> | undefined>()
    const [urgencyFilter, setUrgencyFilter] = useState<'high' | 'low' | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadIncidents = async () => {
            setIsLoading(true)
            try {
                const fetchedData = await fetchIncidents()
                if (fetchedData) {
                    setData(incidentsSchema.parse(fetchedData))
                }
            } catch (error) {
                console.error('Failed to load incidents:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadIncidents()
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
                            <ChartAreaInteractive onLegendClick={handleLegendClick} activeUrgencyFilter={urgencyFilter} chartData={data} />
                        </div>
                        <DataTable data={data?.incidents || []} urgencyFilter={urgencyFilter} teamId={data?.team.team_id} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard
