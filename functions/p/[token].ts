// Cloudflare Pages Function — renders the public profile page at
// https://janerek.com/p/<token>. Visual structure mirrors the in-app
// UserProfileFragment: photo pager (Instagram-story progress bars + dot
// pagination + tap zones) → name + flag + verified badge → "X years old"
// → light-pink highlight chips (looking-for, profession, education,
// zodiac) → Story section → dark-wine tag chips (religion, nationality
// with flag+demonym, "Speaks <language>").

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
  looking_for: number | null;
  zodiac_sign: string | null;
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

// ISO-3166 alpha-2 → regional indicator emoji flag.
function countryCodeToFlag(cc: string | null | undefined): string {
  if (!cc) return "";
  const code = cc.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  const A = 0x1f1e6;
  return String.fromCodePoint(A + (code.charCodeAt(0) - 65), A + (code.charCodeAt(1) - 65));
}

// Country code → demonym for the nationality chip (e.g. "SY" → "Syrian").
// We don't need every country in the world — just enough that the chip
// reads naturally. Falls back to the raw nationality string the RPC
// returned (which itself falls back to the country code).
const DEMONYMS: Record<string, string> = {
  AE: "Emirati", AF: "Afghan", AL: "Albanian", AM: "Armenian",
  AR: "Argentinian", AT: "Austrian", AU: "Australian", AZ: "Azerbaijani",
  BA: "Bosnian", BD: "Bangladeshi", BE: "Belgian", BG: "Bulgarian",
  BH: "Bahraini", BR: "Brazilian", CA: "Canadian", CH: "Swiss",
  CL: "Chilean", CN: "Chinese", CO: "Colombian", CZ: "Czech",
  DE: "German", DK: "Danish", DZ: "Algerian", EC: "Ecuadorian",
  EE: "Estonian", EG: "Egyptian", ES: "Spanish", ET: "Ethiopian",
  FI: "Finnish", FR: "French", GB: "British", GE: "Georgian",
  GR: "Greek", HR: "Croatian", HU: "Hungarian", ID: "Indonesian",
  IE: "Irish", IL: "Israeli", IN: "Indian", IQ: "Iraqi",
  IR: "Iranian", IS: "Icelandic", IT: "Italian", JO: "Jordanian",
  JP: "Japanese", KE: "Kenyan", KR: "South Korean", KW: "Kuwaiti",
  KZ: "Kazakh", LB: "Lebanese", LK: "Sri Lankan", LT: "Lithuanian",
  LV: "Latvian", LY: "Libyan", MA: "Moroccan", MX: "Mexican",
  MY: "Malaysian", NG: "Nigerian", NL: "Dutch", NO: "Norwegian",
  NZ: "New Zealander", OM: "Omani", PE: "Peruvian", PH: "Filipino",
  PK: "Pakistani", PL: "Polish", PS: "Palestinian", PT: "Portuguese",
  QA: "Qatari", RO: "Romanian", RS: "Serbian", RU: "Russian",
  SA: "Saudi", SD: "Sudanese", SE: "Swedish", SG: "Singaporean",
  SI: "Slovenian", SK: "Slovak", SO: "Somali", SY: "Syrian",
  TH: "Thai", TN: "Tunisian", TR: "Turkish", UA: "Ukrainian",
  US: "American", UZ: "Uzbek", VE: "Venezuelan", VN: "Vietnamese",
  YE: "Yemeni", ZA: "South African",
};

function nationalityLabel(nat: string | null, cc: string | null): string {
  if (nat) {
    const code = nat.trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(code) && DEMONYMS[code]) return DEMONYMS[code];
    return nat;
  }
  if (cc) {
    const code = cc.trim().toUpperCase();
    if (DEMONYMS[code]) return DEMONYMS[code];
    return code;
  }
  return "";
}

// LookingFor enum mirrors com.aboutyou.productinfra.data.user.LookingFor.
function lookingForLabel(id: number | null): string | null {
  if (id == null) return null;
  switch (id) {
    case 0: return "Finding a life partner";
    case 1: return "Still figuring out";
    case 2: return "Meeting friends";
    default: return null;
  }
}

function zodiacLabel(z: string | null): string | null {
  if (!z) return null;
  const lower = z.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const ZODIAC_EMOJI: Record<string, string> = {
  aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
  leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
  sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓",
};

// Common ISO-639 language codes the Janerek client emits → English label.
const LANGUAGE_NAMES: Record<string, string> = {
  ar: "Arabic", en: "English", fr: "French", de: "German",
  es: "Spanish", it: "Italian", pt: "Portuguese", ru: "Russian",
  tr: "Turkish", fa: "Persian", ur: "Urdu", hi: "Hindi",
  bn: "Bengali", id: "Indonesian", ms: "Malay", nl: "Dutch",
  pl: "Polish", ro: "Romanian", sv: "Swedish", no: "Norwegian",
  da: "Danish", fi: "Finnish", el: "Greek", he: "Hebrew",
  ja: "Japanese", ko: "Korean", zh: "Chinese", th: "Thai",
  vi: "Vietnamese", uk: "Ukrainian", cs: "Czech", hu: "Hungarian",
  bg: "Bulgarian", sr: "Serbian", hr: "Croatian", sk: "Slovak",
  sl: "Slovenian", lt: "Lithuanian", lv: "Latvian", et: "Estonian",
  ku: "Kurdish", az: "Azerbaijani", hy: "Armenian", ka: "Georgian",
  am: "Amharic", sw: "Swahili", so: "Somali", ps: "Pashto",
  tl: "Tagalog", uz: "Uzbek", kk: "Kazakh",
};

function languageLabel(lang: string): string {
  if (!lang) return "";
  const code = lang.trim().toLowerCase();
  if (code.length <= 3 && LANGUAGE_NAMES[code]) return LANGUAGE_NAMES[code];
  return lang;
}

const VERIFIED_SVG = `<svg class="verified-badge" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Verified"><path d="M12 1l2.39 2.06 3.13-.4.91 3.04 2.96 1.31-.94 3 1 3-3 1.3-.91 3.04-3.13-.4L12 19.7l-2.4-2.06-3.13.4-.91-3.04-3-1.3 1-3-1-3 3-1.3.91-3.04 3.13.4L12 1z" fill="#1C64F2"/><path d="M8.4 12.2l2.5 2.5 4.9-5" stroke="#fff" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Running-figure icon for the "Story" section header — matches the Android
// design's animated story circle.
const STORY_SVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="13" cy="4.5" r="2" fill="currentColor"/><path d="M7 13l3-3 3 1.5L17 9l2 2-4 3-2-1-2 4 3 3-1 2-4-3-1-4-3 1 1-3z" fill="currentColor"/></svg>`;

const ARROW_LEFT = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
const ARROW_RIGHT = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

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

  const playStoreUrl = env.PLAY_STORE_URL ??
    `https://play.google.com/store/apps/details?id=com.janerek`;
  const appStoreUrl = env.APP_STORE_URL ??
    `https://apps.apple.com/app/janerek`;
  const shareUrl = `https://${host}/p/${token}`;

  // ---- Photo pager ----
  const slides = photoCount > 0
    ? photoIds
        .map((_, i) =>
          `<div class="pager__slide"><img src="/p/${token}/img/${i}.jpg" alt="${escapeHtml(p.name)}" loading="${i === 0 ? "eager" : "lazy"}"></div>`
        )
        .join("")
    : `<div class="pager__slide"></div>`;

  const bars = photoCount > 0
    ? photoIds.map((_, i) => `<div class="pager__bar${i === 0 ? " is-active" : ""}"></div>`).join("")
    : "";
  const dots = photoCount > 0
    ? photoIds.map((_, i) => `<div class="pager__dot${i === 0 ? " is-active" : ""}"></div>`).join("")
    : "";

  const pagerSingle = photoCount <= 1 ? " pager--single" : "";
  const pagerHtml = `
<div class="pager${pagerSingle}" id="pager" data-count="${photoCount}">
  <div class="pager__bars">${bars}</div>
  <div class="pager__track" id="pagerTrack">${slides}</div>
  <button type="button" class="pager__zone pager__zone--prev" id="pagerPrev" aria-label="Previous photo"></button>
  <button type="button" class="pager__zone pager__zone--next" id="pagerNext" aria-label="Next photo"></button>
  <div class="pager__arrow pager__arrow--prev" id="pagerArrowPrev">${ARROW_LEFT}</div>
  <div class="pager__arrow pager__arrow--next" id="pagerArrowNext">${ARROW_RIGHT}</div>
  <div class="pager__dots">${dots}</div>
</div>`;

  // ---- Highlights (light pink chips) ----
  const highlights: string[] = [];
  const lookingFor = lookingForLabel(p.looking_for);
  if (lookingFor) highlights.push(`<span class="chip chip--light"><span class="icon">🔍</span>${escapeHtml(lookingFor)}</span>`);
  if (p.profession) highlights.push(`<span class="chip chip--light"><span class="icon">💼</span>${escapeHtml(p.profession)}</span>`);
  if (p.education_specialization) highlights.push(`<span class="chip chip--light"><span class="icon">🎓</span>${escapeHtml(p.education_specialization)}</span>`);
  const zodiac = zodiacLabel(p.zodiac_sign);
  if (zodiac) {
    const z = (p.zodiac_sign ?? "").toLowerCase();
    const emoji = ZODIAC_EMOJI[z] ?? "✨";
    highlights.push(`<span class="chip chip--light"><span class="icon">${emoji}</span>${escapeHtml(zodiac)}</span>`);
  }

  // ---- Tags (dark wine chips) — religion, nationality with flag, languages "Speaks X" ----
  const tags: string[] = [];
  if (p.religion) tags.push(`<span class="chip chip--dark"><span class="icon">☪︎</span>${escapeHtml(p.religion)}</span>`);
  const natLabel = nationalityLabel(p.nationality, p.country_code);
  if (natLabel) {
    const flag = countryCodeToFlag(p.country_code) || countryCodeToFlag(p.nationality);
    tags.push(`<span class="chip chip--dark">${flag ? `<span class="icon">${flag}</span>` : ""}${escapeHtml(natLabel)}</span>`);
  }
  for (const lang of asStringArray(p.languages)) {
    const label = languageLabel(lang);
    if (label) tags.push(`<span class="chip chip--dark">Speaks ${escapeHtml(label)}</span>`);
  }
  const tagsHtml = tags.join("");

  // ---- Name row: name + nationality flag + verified badge ----
  const nameFlag = countryCodeToFlag(p.country_code) || countryCodeToFlag(p.nationality);

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
<meta name="theme-color" content="#0F1115">
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
  ${pagerHtml}
  <div class="transition"></div>

  <div class="content">
    <div class="name-row">
      <h1 class="name">${escapeHtml(p.name)}</h1>
      ${nameFlag ? `<span class="flag" aria-hidden="true">${nameFlag}</span>` : ""}
      ${p.is_verified ? VERIFIED_SVG : ""}
    </div>
    ${typeof p.age === "number" ? `<div class="age-line">${p.age} years old</div>` : ""}

    ${highlights.length ? `<div class="chips">${highlights.join("")}</div>` : ""}

    ${tagsHtml ? `<div class="chips">${tagsHtml}</div>` : ""}

    ${
      bio
        ? `<section class="section">
            <div class="section-head">
              <div class="section-circle">${STORY_SVG}</div>
              <div class="section-title">${storyTitle}</div>
            </div>
            <div class="story-text">${escapeHtml(bio)}</div>
          </section>`
        : ""
    }
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
  // Photo pager — Instagram-story style. Click left/right zones, top
  // progress pill, or swipe horizontally on touch devices.
  (function () {
    var pager = document.getElementById('pager');
    if (!pager) return;
    var count = parseInt(pager.dataset.count || '0', 10);
    if (count <= 1) return;

    var track = document.getElementById('pagerTrack');
    var bars = pager.querySelectorAll('.pager__bar');
    var dots = pager.querySelectorAll('.pager__dot');
    var prevArrow = document.getElementById('pagerArrowPrev');
    var nextArrow = document.getElementById('pagerArrowNext');
    var index = 0;

    function render() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      for (var i = 0; i < bars.length; i++) {
        bars[i].classList.toggle('is-active', i === index);
      }
      for (var j = 0; j < dots.length; j++) {
        dots[j].classList.toggle('is-active', j === index);
      }
      prevArrow.classList.toggle('is-disabled', index === 0);
      nextArrow.classList.toggle('is-disabled', index === count - 1);
    }
    function go(delta) {
      var next = index + delta;
      if (next < 0 || next >= count) return;
      index = next;
      render();
    }
    document.getElementById('pagerPrev').addEventListener('click', function () { go(-1); });
    document.getElementById('pagerNext').addEventListener('click', function () { go(1); });

    // Touch swipe — show arrows briefly on touch.
    var touchX = null;
    pager.addEventListener('touchstart', function (e) {
      touchX = e.touches[0].clientX;
      pager.classList.add('is-touched');
    }, { passive: true });
    pager.addEventListener('touchend', function (e) {
      if (touchX == null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      setTimeout(function () { pager.classList.remove('is-touched'); }, 600);
    });

    render();
  })();

  // CTA — open the native app via deep link, fall back to the store.
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
