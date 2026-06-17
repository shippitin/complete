// src/hooks/useSeo.ts
//
// Lightweight per-page SEO. The app is a client-side SPA with a single index.html,
// so every route otherwise shares the homepage's static <title>/description. This
// hook updates the document title, meta description, Open Graph / Twitter tags and
// the canonical link per page. Googlebot renders JS, so it indexes these correctly.
// (For JS-free scrapers, prerendering is the next step — the homepage static tags
// in index.html still cover the most-shared URL.)
import { useEffect } from 'react';

const SITE = 'https://www.shippitin.co';

const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertCanonical = (href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

interface SeoOptions {
  title: string;        // page title (a " · Shippitin" suffix is added if absent)
  description?: string;
  path?: string;        // defaults to the current pathname
}

export function useSeo({ title, description, path }: SeoOptions) {
  useEffect(() => {
    const fullTitle = /shippitin/i.test(title) ? title : `${title} · Shippitin`;
    document.title = fullTitle;
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('name', 'twitter:title', fullTitle);

    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
      upsertMeta('name', 'twitter:description', description);
    }

    const url = SITE + (path ?? window.location.pathname);
    upsertMeta('property', 'og:url', url);
    upsertCanonical(url);
  }, [title, description, path]);
}
