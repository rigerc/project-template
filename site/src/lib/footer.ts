/**
 * The columns footer's default link groups.
 *
 * This site has one page and a nav, so the footer is derived from those and
 * from any groups declared in `nav.config.ts`. The theme's blog and project
 * columns are gone with those sections: a footer that lists pages which do not
 * exist is worse than a short one.
 */
import { getFooterNavItems, footerLinkGroups, resolveNavItem } from '@/config/nav.config';
import { defaultLocale, t } from '@/i18n';
import type { FooterLinkGroup } from '@/components/layout/Footer.astro';

export async function getDerivedFooterGroups(
  locale: string = defaultLocale
): Promise<FooterLinkGroup[]> {
  const groups: FooterLinkGroup[] = [];

  const navLinks = getFooterNavItems(locale).map((item) => ({
    label: item.label,
    href: item.href,
    external: item.external,
  }));
  if (navLinks.length) {
    groups.push({ title: t('footer.groups.site', locale), links: navLinks });
  }

  for (const group of footerLinkGroups) {
    const links = group.links.map((item) => {
      const resolved = resolveNavItem(item, locale);
      return { label: resolved.label, href: resolved.href, external: resolved.external };
    });
    if (links.length) {
      groups.push({ title: group.title, links });
    }
  }

  return groups;
}
