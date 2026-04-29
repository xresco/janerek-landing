// Shared language detection for the public site.
// Resolution order: ?lang= → cookie → Accept-Language → default ('ar').
// The same helper is used by the global middleware (for static pages) and by
// the share-profile route (server-rendered HTML), so the visitor sees one
// consistent language across the site.

export type Lang = "ar" | "en";
export const SUPPORTED_LANGS: readonly Lang[] = ["ar", "en"] as const;
export const DEFAULT_LANG: Lang = "ar";
export const LANG_COOKIE = "janerek-lang";

function isLang(v: string): v is Lang {
  return (SUPPORTED_LANGS as readonly string[]).includes(v);
}

function fromCookie(cookieHeader: string | null): Lang | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === LANG_COOKIE) {
      const v = decodeURIComponent(rest.join("="));
      if (isLang(v)) return v;
    }
  }
  return null;
}

function fromAcceptLanguage(header: string | null): Lang | null {
  if (!header) return null;
  // Parse "en-US,en;q=0.9,ar;q=0.8" — pick the highest-q tag whose primary
  // subtag is one of our supported languages.
  const entries = header.split(",").map((raw) => {
    const [tagPart, ...params] = raw.trim().split(";");
    const tag = tagPart.toLowerCase().split("-")[0];
    let q = 1;
    for (const p of params) {
      const m = p.trim().match(/^q=(.+)$/);
      if (m) {
        const parsed = parseFloat(m[1]);
        if (!Number.isNaN(parsed)) q = parsed;
      }
    }
    return { tag, q };
  });
  entries.sort((a, b) => b.q - a.q);
  for (const { tag } of entries) {
    if (isLang(tag)) return tag;
  }
  return null;
}

export function pickLang(request: Request): Lang {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("lang");
  if (fromQuery && isLang(fromQuery)) return fromQuery;
  const cookieLang = fromCookie(request.headers.get("cookie"));
  if (cookieLang) return cookieLang;
  const headerLang = fromAcceptLanguage(request.headers.get("accept-language"));
  if (headerLang) return headerLang;
  return DEFAULT_LANG;
}

// Set-Cookie header value for persisting the picked language. 1 year, root
// path, lax (covers same-site link clicks).
export function langCookie(lang: Lang): string {
  return `${LANG_COOKIE}=${lang}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function dirFor(lang: Lang): "rtl" | "ltr" {
  return lang === "ar" ? "rtl" : "ltr";
}
