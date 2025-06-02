import { z } from 'zod'

const flexibleDatetime = z.string().transform((val, ctx) => {
    // Try to parse the date string
    const date = new Date(val)

    if (isNaN(date.getTime())) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid date format',
        })
        return z.NEVER
    }

    return date.toISOString()
})

const annotationSchema = z.object({
    created_at: flexibleDatetime,
    summary: z.string(),
})

export const incidentSchema = z.object({
    actionable: z.boolean().nullable(),
    annotation: annotationSchema.nullable(),
    created_at: flexibleDatetime,
    description: z.string(),
    id: z.number().int({ message: 'ID must be an integer' }),
    incident_id: z.string(),
    status: z.enum(['triggered', 'resolved', 'acknowledged'], { message: "Status must be either 'triggered', 'resolved', 'acknowledged'" }),
    summary: z.string(),
    team: z.number().int({ message: 'Team ID must be an integer' }),
    title: z.string(),
    urgency: z.enum(['low', 'high'], { message: "Urgency must be either 'low' or 'high'" }),
})

const summarySchema = z.record(
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date key must be in YYYY-MM-DD format'),
    z.object({
        high: z.number().int({ message: 'High count must be an integer' }),
        low: z.number().int({ message: 'Low count must be an integer' }),
    })
)

const teamSchema = z.object({
    alias: z.string().nullable(),
    created_at: flexibleDatetime,
    id: z.number().int({ message: 'Team ID must be an integer' }),
    last_checked: flexibleDatetime,
    name: z.string(),
    summary: z.string(),
    team_id: z.string(),
})

export const incidentsSchema = z.object({
    incidents: z.array(incidentSchema),
    summary: summarySchema,
    team: teamSchema,
})
