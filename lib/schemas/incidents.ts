import { z } from 'zod'

const annotationSchema = z.object({
    created_at: z.string().refine(
        (val) => {
            try {
                new Date(val)
                return /^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(val)
            } catch {
                return false
            }
        },
        { message: "Invalid RFC 1123 date string for annotation.created_at. Expected format: 'Day, DD Mon YYYY HH:MM:SS GMT'" }
    ),
    summary: z.string(),
})

export const incidentSchema = z.object({
    actionable: z.boolean().nullable(),
    annotation: annotationSchema.nullable(),
    created_at: z.string().refine(
        (val) => {
            try {
                new Date(val) // Check if it can be parsed by Date constructor
                return /^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(val)
            } catch {
                return false
            }
        },
        { message: "Invalid RFC 1123 date string for incident.created_at. Expected format: 'Day, DD Mon YYYY HH:MM:SS GMT'" }
    ),
    description: z.string(),
    id: z.number().int({ message: 'ID must be an integer' }),
    incident_id: z.string(),
    status: z.enum(['triggered', 'resolved', 'acknowledged'], { message: "Status must be either 'triggered', 'resolved', 'acknowledged'" }),
    summary: z.string(),
    team: z.number().int({ message: 'Team ID must be an integer' }),
    title: z.string(),
    urgency: z.enum(['low', 'high'], { message: "Urgency must be either 'low' or 'high'" }),
})

const dailySummarySchema = z.object({
    high: z.number().int({ message: 'High count must be an integer' }),
    low: z.number().int({ message: 'Low count must be an integer' }),
})

const blogSummarySchema = z.record(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date key must be in YYYY-MM-DD format'), dailySummarySchema)

const teamSchema = z.object({
    alias: z.string().nullable(),
    created_at: z.string().datetime({ message: 'Invalid ISO 8601 date-time string for team.created_at' }),
    id: z.number().int({ message: 'Team ID must be an integer' }),
    last_checked: z.string().datetime({ message: 'Invalid ISO 8601 date-time string for team.last_checked' }),
    name: z.string(),
    summary: z.string(),
    team_id: z.string(),
})

export const incidentsSchema = z.object({
    incidents: z.array(incidentSchema),
    summary: blogSummarySchema,
    team: teamSchema,
})
