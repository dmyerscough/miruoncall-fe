"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"

import { z } from "zod"

import { incidentSchema } from "@/lib/schemas/incidents"
import data from "./incidents.json"

function Dashboard({ params }: { params: { team: string } }) {
  return (
    <>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data.incidents as z.infer<typeof incidentSchema>[]} />
            </div>
          </div>
        </div>
    </>
  )
}

export default Dashboard
