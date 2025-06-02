import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    /* config options here */
    publicRuntimeConfig: {
        // Will be available on both server and client
        apiBackend: 'http://127.0.0.1:5000',
        allIncidentsEndpoint: 'api/v1/incidents',
        teamsEndpoint: 'api/v1/teams',
    },
}

export default nextConfig
