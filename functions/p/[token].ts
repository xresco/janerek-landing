// Cloudflare Pages Function — renders the public profile page at
// https://janerek.com/p/<token>. Server-side fetches profile from
// Supabase via the `get_public_profile` RPC and renders HTML with
// OpenGraph + Twitter Card meta tags so social-media link unfurls
// (WhatsApp / Telegram / Slack / Twitter / iMessage) get a real preview.
//
// Env vars (set in Cloudflare Pages → Settings → Environment Variables):
//   SUPABASE_URL                — e.g. https://orpkbbiieovtbigdshon.supabase.co
//   SUPABASE_ANON_KEY           — anon key (PostgREST RPC call uses this)
//   APP_NAME                    — "Janerek" (defaults to "Janerek")
//   APP_HOST                    — apex domain (defaults to janerek.com)
//   PLAY_STORE_URL              — fallback for Android users without app
//   APP_STORE_URL               — fallback for iOS users without app

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
  nationality: unknown;
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

function asArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (typeof v === "string") return [v];
  return [];
}

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

  // Fire-and-forget view increment. waitUntil keeps the request alive past
  // response so the count gets recorded even if the user closes the tab.
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

  const photos = Array.isArray(p.profile_photos) ? p.profile_photos : [];
  const photoCount = photos.length;
  const ogImageUrl = photoCount > 0
    ? `https://${host}/p/${token}/img/0.jpg`
    : `https://${host}/assets/og-default.jpg`;

  const bio = (p.bio ?? "").trim();
  const ogDescription = bio.length > 0
    ? bio.length > 160 ? bio.slice(0, 157) + "…" : bio
    : `I'm using ${appName} to find meaningful connections.`;

  const cityLine = [p.city, p.country_code].filter(Boolean).join(", ");
  const nationalities = asArray(p.nationality);
  const languages = asArray(p.languages);

  const playStoreUrl = env.PLAY_STORE_URL ??
    `https://play.google.com/store/apps/details?id=com.janerek`;
  const appStoreUrl = env.APP_STORE_URL ??
    `https://apps.apple.com/app/janerek`;
  const shareUrl = `https://${host}/p/${token}`;

  const heroImg = photoCount > 0
    ? `<img src="/p/${token}/img/0.jpg" alt="${escapeHtml(p.name)}" loading="eager">`
    : "";

  const carousel = photoCount > 1
    ? `<div class="photos">${
      photos
        .slice(1)
        .map((_, i) =>
          `<div class="thumb"><img src="/p/${token}/img/${i + 1}.jpg" alt="" loading="lazy"></div>`
        )
        .join("")
    }</div>`
    : "";

  const tags: string[] = [];
  if (p.gender) tags.push(escapeHtml(p.gender));
  if (typeof p.age === "number") tags.push(`${p.age}`);
  if (cityLine) tags.push(escapeHtml(cityLine));

  const meta: string[] = [];
  if (nationalities.length) {
    meta.push(`<dt>Nationality</dt><dd>${nationalities.map(escapeHtml).join(", ")}</dd>`);
  }
  if (languages.length) {
    meta.push(`<dt>Languages</dt><dd>${languages.map(escapeHtml).join(", ")}</dd>`);
  }
  if (p.religion) meta.push(`<dt>Religion</dt><dd>${escapeHtml(p.religion)}</dd>`);
  if (p.profession) meta.push(`<dt>Profession</dt><dd>${escapeHtml(p.profession)}</dd>`);
  if (p.education_specialization) {
    meta.push(`<dt>Education</dt><dd>${escapeHtml(p.education_specialization)}</dd>`);
  }

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#6542AD">
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
  <header class="topbar">
    <a class="brand" href="https://${host}">${escapeHtml(appName)}</a>
    <a class="open-app" href="#open-app">Open in app</a>
  </header>

  <section class="hero">
    ${heroImg}
    <div class="gradient"></div>
    ${p.is_verified ? '<span class="verified">✓ Verified</span>' : ""}
    <div class="name-block">
      <div class="name">${escapeHtml(p.name)}${typeof p.age === "number" ? `, ${p.age}` : ""}</div>
      ${cityLine ? `<div class="city">${escapeHtml(cityLine)}</div>` : ""}
    </div>
  </section>

  ${carousel}

  ${
    bio
      ? `<section class="section"><h2>About</h2><div class="body">${escapeHtml(bio)}</div></section>`
      : ""
  }

  ${
    meta.length
      ? `<section class="section"><h2>Details</h2><dl class="meta">${meta.join("")}</dl></section>`
      : ""
  }

  <footer class="foot">
    <a href="mailto:report@${host}?subject=Report%20profile%20${encodeURIComponent(token)}">Report this profile</a>
    <span>·</span>
    <a href="https://${host}/privacy.html">Privacy</a>
  </footer>
</div>

<div class="cta-bar">
  <a class="cta" id="open-app"
     href="${shareUrl}"
     data-android="${playStoreUrl}"
     data-ios="${appStoreUrl}">
    Open in ${escapeHtml(appName)}
  </a>
</div>

<script>
  // If the app isn't installed, the OS won't intercept the Universal Link
  // / App Link, so the CTA stays on this page. Tapping it then routes by
  // platform to the right store.
  (function () {
    var btn = document.getElementById('open-app');
    if (!btn) return;
    var ua = navigator.userAgent || '';
    var isAndroid = /Android/i.test(ua);
    var isIOS = /iPhone|iPad|iPod/i.test(ua);
    btn.addEventListener('click', function (e) {
      // We can't reliably know if the app opened. Strategy: let the
      // browser handle the universal link first; if the user is still
      // here after a delay, send them to the store.
      var storeUrl = isAndroid
        ? btn.dataset.android
        : isIOS
          ? btn.dataset.ios
          : null;
      if (!storeUrl) return; // desktop — let the link open in browser
      e.preventDefault();
      var t = Date.now();
      window.location.href = btn.href;
      setTimeout(function () {
        if (Date.now() - t < 1800) window.location.href = storeUrl;
      }, 1500);
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
