import { NextRequest, NextResponse } from 'next/server'

import nextConfig from '@/next.config'

const { publicRuntimeConfig } = nextConfig

export async function POST(request: NextRequest, { params }: { params: Promise<{ team: string }> }) {
    try {
        const { team } = await params
        const body = await request.json()

        // Forward the request to your backend API
        const backendUrl = `${publicRuntimeConfig?.apiBackend}/${publicRuntimeConfig?.allIncidentsEndpoint}/${team}`

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json({ error: `Backend API request failed with status ${response.status}` }, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error in incidents API route:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
