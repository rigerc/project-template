import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { readFileSync } from "node:fs";

const project = JSON.parse(readFileSync(new URL("../project.json", import.meta.url)));
const configuredUrl = process.env.PUBLIC_SITE_URL || project.siteUrl;
const site = configuredUrl ? new URL(configuredUrl) : undefined;
const repository = process.env.PUBLIC_REPOSITORY || project.repo;

export default defineConfig({
  site: site?.origin,
  base: site?.pathname ?? "/",
  trailingSlash: "always",
  devToolbar: { enabled: false },
  integrations: [
    starlight({
      title: project.name,
      description: project.description,
      components: { PageTitle: "./src/components/PageTitle.astro" },
      social: [{ icon: "github", label: "GitHub", href: `https://github.com/${repository}` }],
      editLink: { baseUrl: `https://github.com/${repository}/edit/main/website/` },
      sidebar: [
        { label: "Guides", items: [{ autogenerate: { directory: "guides" } }] },
        { label: "Project", items: ["changelog", "support", "privacy"] },
      ],
    }),
  ],
});
