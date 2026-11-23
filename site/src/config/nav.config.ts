/**
 * Navigation.
 *
 * Three destinations: the project page, the changelog, and the docs. The docs
 * are a separate build published under `/docs/`, so their links are absolute
 * (or same-origin, resolved by `docsUrl()`), and `external` keeps the nav
 * resolver from prefixing them again.
 *
 * Write a link once. Labels are literal strings; there is one locale.
 */
import { docsChangelogLink, docsLink } from '@/lib/links';
import { withBase } from '@/lib/base';

export interface NavItem {
  label: string;
  href: string;
  order: number;
  external?: boolean;
}

/** A footer column declared in config. */
export interface FooterLinkGroupConfig {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}

export type LegalLink = Omit<NavItem, 'order'>;

export interface ResolvedNavItem {
  label: string;
  href: string;
  external?: boolean;
}

export const navItems: NavItem[] = [
  { label: 'Overview', href: '/', order: 0 },
  { label: 'Changelog', href: '/changelog', order: 1 },
  { label: 'Docs', href: docsLink, order: 2, external: true },
];

export const footerNavItems: NavItem[] = [
  { label: 'Overview', href: '/', order: 0 },
  { label: 'Changelog', href: '/changelog', order: 1 },
  { label: 'Docs', href: docsLink, order: 2, external: true },
  { label: 'Full changelog', href: docsChangelogLink, order: 3, external: true },
];

export const legalLinks: LegalLink[] = [];

/** Extra footer columns. The site column is derived from `footerNavItems`. */
export const footerLinkGroups: FooterLinkGroupConfig[] = [];

export function resolveNavItem(item: NavItem | LegalLink, _locale?: string): ResolvedNavItem {
  // A path this site owns carries the base; the docs URL is already absolute or
  // base-prefixed by `docsUrl()`, and `withBase()` leaves it alone.
  const external = item.external === true || /^(https?:)?\/\//.test(item.href);
  return {
    label: item.label,
    href: external ? item.href : withBase(item.href),
    external,
  };
}

export function getNavItems(_locale?: string): ResolvedNavItem[] {
  return [...navItems].sort((a, b) => a.order - b.order).map((item) => resolveNavItem(item));
}

export function getFooterNavItems(_locale?: string): ResolvedNavItem[] {
  return [...footerNavItems].sort((a, b) => a.order - b.order).map((item) => resolveNavItem(item));
}

export function getLegalLinks(_locale?: string): ResolvedNavItem[] {
  return legalLinks.map((item) => resolveNavItem(item));
}

export function getLogoHref(_locale?: string): string {
  return withBase('/');
}
