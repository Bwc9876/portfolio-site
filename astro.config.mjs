import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

import playformInline from "@playform/inline";

// https://astro.build/config
export default defineConfig({
  site: "https://bwc9876.dev",
  compressHTML: true,
  integrations: [mdx(), icon(), sitemap(), playformInline()],
  vite: {
    css: {
      transformer: "lightningcss",
      lightningcss: { drafts: { customMedia: true } }
    },
    build: {
      cssMinify: "lightningcss"
    }
  }
});