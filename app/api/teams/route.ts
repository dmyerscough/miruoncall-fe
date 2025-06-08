import { NextResponse } from 'next/server'

import nextConfig from '@/next.config'

const { publicRuntimeConfig } = nextConfig

export async function GET() {
    try {
        const backendUrl = `${publicRuntimeConfig?.apiBackend}/${publicRuntimeConfig?.teamsEndpoint}`

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json({ error: `Backend API request failed with status ${response.status}` }, { status: response.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error in teams API route:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
