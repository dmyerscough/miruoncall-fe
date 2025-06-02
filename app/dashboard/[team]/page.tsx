'use client'

import { useState } from 'react'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { DataTable } from '@/components/data-table'
import { SiteHeader } from '@/components/site-header'

import { z } from 'zod'

import { incidentSchema, incidentsSchema } from '@/lib/schemas/incidents'
import rawData from './incidents.json'

function Dashboard({ params }: { params: { team: string } }) {
    // Validate and parse the data to ensure it matches the expected schema
    const data = incidentsSchema.parse(rawData)
    const [urgencyFilter, setUrgencyFilter] = useState<'high' | 'low' | null>(null)

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
                        <DataTable data={data.incidents as z.infer<typeof incidentSchema>[]} urgencyFilter={urgencyFilter} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard
