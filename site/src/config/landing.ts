/**
 * Every sentence the landing site says, in one place.
 *
 * The template ships this site to other projects, so nothing here may name the
 * template itself. Copy reads from `project.json` through `project.ts`; a
 * downstream project that wants different words edits this file, and one that
 * only renames itself edits nothing.
 */
import { projectDescription, projectName, repoUrl } from './project';

export const landing = {
  /** Closing band under the project page. */
  cta: {
    heading: 'Read the documentation',
    lead: `Setup, guides and the complete release history for ${projectName}.`,
    primary: 'Open the docs',
    secondary: 'Full changelog',
  },
  /** The changelog page rendered from CHANGELOG.md. */
  changelog: {
    heading: 'Changelog',
    description: `What changed in each release of ${projectName}.`,
    fullHistory: 'Full history in the docs',
  },
  /** Repository link shown in the project hero. */
  repo: {
    label: 'Source',
    url: repoUrl,
  },
  /** The 404 page. */
  notFound: {
    badge: '404',
    title: 'This page does not exist',
    description:
      'The address may have moved. The project overview, the changelog and the documentation are all one click away.',
    home: 'Project overview',
    changelog: 'Changelog',
    docs: 'Documentation',
  },
  /** Fallbacks used when a project entry has no description of its own. */
  project: {
    description: projectDescription,
  },
} as const;
