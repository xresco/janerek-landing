import { pickLang, langCookie, dirFor } from "./_lang";

// Global middleware: runs for every Pages request.
// - Detects the visitor's language (?lang= → cookie → Accept-Language → ar).
// - On HTML responses: rewrites <html lang>, <html dir>, and <body class>
//   on the fly so the first paint is in the correct direction and the right
//   webfont. The page's `data-i18n` text swap is still done by main.js /
//   subpage.js.
// - On HTML responses: sets the language cookie so subsequent visits and
//   client JS see the same value without re-running detection.
//
// The /user/<id> route does its own full server-side localization (labels,
// OG tags, dictionary lookups), so we skip the rewrite for it.

export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context;
  const url = new URL(request.url);

  if (url.pathname.startsWith("/user/")) {
    return next();
  }

  const response = await next();
  const ct = response.headers.get("content-type") ?? "";
  if (!ct.includes("text/html")) return response;

  const lang = pickLang(request);
  const dir = dirFor(lang);
  const otherClass = lang === "ar" ? "lang-en" : "lang-ar";
  const newClass = `lang-${lang}`;

  const rewriter = new HTMLRewriter()
    .on("html", {
      element(el) {
        el.setAttribute("lang", lang);
        el.setAttribute("dir", dir);
      },
    })
    .on("body", {
      element(el) {
        const cls = el.getAttribute("class") ?? "";
        const next = cls
          .split(/\s+/)
          .filter((c) => c && c !== otherClass && c !== newClass);
        next.push(newClass);
        el.setAttribute("class", next.join(" "));
      },
    });

  const transformed = rewriter.transform(response);
  const out = new Response(transformed.body, transformed);
  out.headers.append("Set-Cookie", langCookie(lang));
  return out;
};
