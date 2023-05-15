import { z, defineCollection } from "astro:content";

const projectsCollection = defineCollection({
    schema: z.object({
        name: z.string(),
        summary: z.string(),
        tags: z.array(z.string()),
        timespan: z.object({
            from: z.number(),
            to: z.number().or(z.string()).optional()
        }),
        image: z.string().optional(),
        links: z.object({
            github: z.string().optional(),
            other: z.record(z.string()).optional()
        }).optional()
    }),
});

export const collections = {
    "projects": projectsCollection
}
