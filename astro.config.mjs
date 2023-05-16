import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import image from "@astrojs/image";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
    site: "https://bwc9876.dev",
    integrations: [
        mdx(),
        image({
            serviceEntryPoint: "@astrojs/image/sharp"
        }),
        sitemap()
    ]
});
