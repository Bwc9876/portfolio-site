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
        image: z
            .object({
                src: z.string(),
                width: z.number(),
                height: z.number()
            })
            .optional(),
        links: z
            .object({
                github: z.string().optional(),
                other: z
                    .array(
                        z.object({
                            label: z.string(),
                            url: z.string(),
                            icon: z.string().default("link-45deg"),
                            iconPackOverride: z.string().optional()
                        })
                    )
                    .optional()
            })
            .optional()
    })
});

export const collections = {
    projects: projectsCollection
};
