import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
    site: "https://bwc9876.dev",
    compressHTML: true,
    integrations: [mdx(), icon(), sitemap()]
});
