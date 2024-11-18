import { z, defineCollection } from "astro:content";

const projectsCollection = defineCollection({
    schema: ({ image }) =>
        z.object({
            name: z.string(),
            summary: z.string(),
            tags: z.array(z.string()),
            timespan: z.object({
                from: z.number(),
                to: z.number().or(z.string()).optional()
            }),
            internalSort: z.number().optional(),
            image: image(),
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

const blogPostsCollection = defineCollection({
    schema: z.object({
        title: z.string(),
        date: z.date(),
        summary: z.string(),
        cowsay: z.string()
    })
});

export const collections = {
    projects: projectsCollection,
    posts: blogPostsCollection
};
