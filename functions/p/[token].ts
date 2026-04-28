// Cloudflare Pages Function — renders the public profile page at
// https://janerek.com/p/<token>. Visual structure mirrors the in-app
// UserProfileFragment: vertical photo stack → name + verified badge →
// age line → highlight chips (city + profession + education + religion) →
// "Story" section with pink-circle icon header → flat pink tag flexbox
// (gender, nationality, languages).

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  APP_NAME?: string;
  APP_HOST?: string;
  PLAY_STORE_URL?: string;
  APP_STORE_URL?: string;
}

interface PublicProfile {
  user_id: string;
  name: string;
  age: number;
  bio: string | null;
  gender: string | null;
  city: string | null;
  country_code: string | null;
  nationality: string | null;
  languages: unknown;
  religion: string | null;
  profession: string | null;
  education_specialization: string | null;
  is_verified: boolean;
  profile_photos: unknown;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Defensively turn an unknown JSONB value into a string array. Handles
// real arrays, JSON-encoded strings, and single-string values (Janerek
// `nationality` is a plain text column, for example).
function asStringArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  if (typeof v === "string") {
    const t = v.trim();
    if (t.startsWith("[")) {
      try {
        const j = JSON.parse(t);
        if (Array.isArray(j)) return j.map(String).filter(Boolean);
      } catch { /* fall through */ }
    }
    return t ? [t] : [];
  }
  return [];
}

// Pulls photo IDs out of `users.profile_photos`, which is a JSONB array of
// raw photo-id strings (e.g. ["abc123…", "def456…"]). Tolerates the column
// arriving as a string-encoded array or as an array of objects with `.id`.
function extractPhotoIds(v: unknown): string[] {
  let arr: unknown[] = [];
  if (Array.isArray(v)) arr = v;
  else if (typeof v === "string") {
    try {
      const j = JSON.parse(v);
      if (Array.isArray(j)) arr = j;
    } catch { /* ignore */ }
  }
  return arr
    .map((x) => {
      if (typeof x === "string") return x;
      if (x && typeof x === "object") {
        const o = x as Record<string, unknown>;
        const candidate = o.id ?? o.photoId ?? o.photo_id ?? o.path ?? o.name;
        return typeof candidate === "string" ? candidate : null;
      }
      return null;
    })
    .filter((x): x is string => Boolean(x));
}

// Blue verified seal — same visual language as the in-app
// ic_verified_checkmark.xml drawable. Filled circle with a white check.
const VERIFIED_SVG = `<svg class="verified-badge" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Verified"><path d="M12 1l2.39 2.06 3.13-.4.91 3.04 2.96 1.31-.94 3 1 3-3 1.3-.91 3.04-3.13-.4L12 19.7l-2.4-2.06-3.13.4-.91-3.04-3-1.3 1-3-1-3 3-1.3.91-3.04 3.13.4L12 1z" fill="#1C64F2"/><path d="M8.4 12.2l2.5 2.5 4.9-5" stroke="#fff" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Document/story icon for the "Story" section header pink circle.
const STORY_SVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 4a2 2 0 012-2h7l5 5v13a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2v5h5M9 13h6M9 17h6M9 9h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function notFound(host: string, appName: string): Response {
  const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Profile not available — ${escapeHtml(appName)}</title>
<link rel="stylesheet" href="/css/profile.css">
</head><body>
<div class="shell"><div class="notfound">
  <h1>This profile isn't available</h1>
  <p>The link may have expired or been removed by its owner.</p>
  <a href="https://${host}">Back to ${escapeHtml(appName)}</a>
</div></div>
</body></html>`;
  return new Response(html, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, env } = context;
  const token = String(params.token ?? "");
  const host = env.APP_HOST ?? "janerek.com";
  const appName = env.APP_NAME ?? "Janerek";

  if (!/^[A-Za-z0-9]{8,32}$/.test(token)) {
    return notFound(host, appName);
  }

  const rpcRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/rpc/get_public_profile`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "apikey": env.SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ p_token: token }),
    },
  );

  if (!rpcRes.ok) return notFound(host, appName);
  const rows = (await rpcRes.json()) as PublicProfile[];
  if (!Array.isArray(rows) || rows.length === 0) {
    return notFound(host, appName);
  }
  const p = rows[0];

  context.waitUntil(
    fetch(`${env.SUPABASE_URL}/rest/v1/rpc/increment_share_view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": env.SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${env.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ p_token: token }),
    }).catch(() => undefined),
  );

  const photoIds = extractPhotoIds(p.profile_photos);
  const photoCount = photoIds.length;
  const ogImageUrl = photoCount > 0
    ? `https://${host}/p/${token}/img/0.jpg`
    : `https://${host}/assets/og-default.jpg`;

  const bio = (p.bio ?? "").trim();
  const ogDescription = bio.length > 0
    ? bio.length > 160 ? bio.slice(0, 157) + "…" : bio
    : `I'm using ${appName} to find meaningful connections.`;

  const cityLine = [p.city, p.country_code].filter(Boolean).join(", ");

  const playStoreUrl = env.PLAY_STORE_URL ??
    `https://play.google.com/store/apps/details?id=com.janerek`;
  const appStoreUrl = env.APP_STORE_URL ??
    `https://apps.apple.com/app/janerek`;
  const shareUrl = `https://${host}/p/${token}`;

  // Vertical photo stack — every photo shown 1:1 full-width, scrolled
  // through naturally instead of horizontally swiped.
  const photoStack = photoCount > 0
    ? photoIds
        .map((_, i) =>
          `<div class="photo"><img src="/p/${token}/img/${i}.jpg" alt="${escapeHtml(p.name)}" loading="${i === 0 ? "eager" : "lazy"}"></div>`
        )
        .join("")
    : `<div class="photo photo--empty"></div>`;

  // Highlight row: city, profession, education, religion. Each is a chip
  // with an emoji icon — mirrors the in-app highlights row.
  const highlights: string[] = [];
  if (cityLine) highlights.push(`<span class="chip"><span class="icon">📍</span>${escapeHtml(cityLine)}</span>`);
  if (p.profession) highlights.push(`<span class="chip"><span class="icon">💼</span>${escapeHtml(p.profession)}</span>`);
  if (p.education_specialization) highlights.push(`<span class="chip"><span class="icon">🎓</span>${escapeHtml(p.education_specialization)}</span>`);
  if (p.religion) highlights.push(`<span class="chip"><span class="icon">☪︎</span>${escapeHtml(p.religion)}</span>`);

  // Flat tags below the story: gender, nationality, languages.
  const languages = asStringArray(p.languages);
  const flatTags: string[] = [];
  if (p.gender) flatTags.push(p.gender);
  if (p.nationality) flatTags.push(p.nationality);
  flatTags.push(...languages);
  const flatTagsHtml = flatTags
    .map((t) => `<span class="chip">${escapeHtml(t)}</span>`)
    .join("");

  // Pronoun-aware story title — Android shows "Her Story" / "His Story".
  const storyTitle = (() => {
    const g = (p.gender ?? "").toLowerCase();
    if (g.includes("female") || g === "woman" || g === "her") return "Her Story";
    if (g.includes("male") || g === "man" || g === "him") return "His Story";
    return "Story";
  })();

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#FFFFFF">
<title>${escapeHtml(p.name)} — ${escapeHtml(appName)}</title>

<meta property="og:type" content="profile">
<meta property="og:title" content="Meet ${escapeHtml(p.name)} on ${escapeHtml(appName)}">
<meta property="og:description" content="${escapeHtml(ogDescription)}">
<meta property="og:image" content="${ogImageUrl}">
<meta property="og:url" content="${shareUrl}">
<meta property="og:site_name" content="${escapeHtml(appName)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Meet ${escapeHtml(p.name)} on ${escapeHtml(appName)}">
<meta name="twitter:description" content="${escapeHtml(ogDescription)}">
<meta name="twitter:image" content="${ogImageUrl}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/css/profile.css">
</head>
<body>
<div class="shell">
  <div class="photos">${photoStack}</div>
  <div class="transition"></div>

  <div class="content">
    <div class="name-row">
      <h1 class="name">${escapeHtml(p.name)}</h1>
      ${p.is_verified ? VERIFIED_SVG : ""}
    </div>
    ${typeof p.age === "number" ? `<div class="age-line">${p.age}</div>` : ""}

    ${highlights.length ? `<div class="chips">${highlights.join("")}</div>` : ""}

    ${
      bio
        ? `<section class="story">
            <div class="section-head">
              <div class="section-circle">${STORY_SVG}</div>
              <div class="section-title">${storyTitle}</div>
            </div>
            <div class="story-text">${escapeHtml(bio)}</div>
          </section>`
        : ""
    }

    ${flatTagsHtml ? `<div class="chips chips--flat">${flatTagsHtml}</div>` : ""}
  </div>
</div>

<div class="cta-bar">
  <a class="cta" id="open-app"
     href="${playStoreUrl}"
     data-host="${host}"
     data-token="${token}"
     data-android-pkg="com.janerek"
     data-android-store="${playStoreUrl}"
     data-ios-store="${appStoreUrl}"
     data-universal-link="${shareUrl}">
    Open in ${escapeHtml(appName)}
  </a>
</div>

<script>
  (function () {
    var btn = document.getElementById('open-app');
    if (!btn) return;
    var ua = navigator.userAgent || '';
    var isAndroid = /Android/i.test(ua);
    var isIOS = /iPhone|iPad|iPod/i.test(ua) && !window.MSStream;
    btn.addEventListener('click', function (e) {
      if (isAndroid) {
        e.preventDefault();
        var fallback = encodeURIComponent(btn.dataset.androidStore);
        window.location.href = 'intent://' + btn.dataset.host + '/p/' + btn.dataset.token +
          '#Intent;scheme=https;package=' + btn.dataset.androidPkg +
          ';S.browser_fallback_url=' + fallback + ';end';
      } else if (isIOS) {
        e.preventDefault();
        var t = Date.now();
        window.location.href = btn.dataset.universalLink;
        setTimeout(function () {
          if (Date.now() - t < 1800) window.location.href = btn.dataset.iosStore;
        }, 1500);
      }
    });
  })();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
};
