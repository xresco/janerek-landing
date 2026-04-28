// Cloudflare Pages Function — renders the public profile page at
// https://janerek.com/p/<token>. Visual structure mirrors the in-app
// UserProfileFragment: photo pager (Instagram-story progress pills) →
// name + flag + verified badge → "X years old" → light-pink highlight
// chips (looking-for, profession, education, zodiac) → dark-wine tag chips
// (religion, nationality with flag+demonym, "Speaks <language>") → Story.

import { zodiacSvg } from "./_zodiac";

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
  profession_id: number | null;
  education_specialization: string | null;
  education_id: number | null;
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

function nationalityLabel(nat: string | null): string | null {
  if (!nat) return null;
  const code = nat.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(code) && DEMONYMS[code]) return DEMONYMS[code];
  return nat;
}

// LookingFor enum → label (matches strings/looking_for_*). Mirror of
// com.aboutyou.productinfra.data.user.LookingFor.
const LOOKING_FOR_LABELS: Record<number, string> = {
  0: "Finding a life partner",
  1: "Still figuring out",
  2: "Meeting friends",
};

// Profession enum id → label. Mirror of
// com.aboutyou.productinfra.data.user.Profession + values/strings.xml.
const PROFESSION_LABELS: Record<number, string> = {
  0: "Student",
  1: "Doctor",
  2: "Pharmacist",
  3: "Engineer",
  4: "Teacher",
  5: "Nurse",
  6: "Accountant",
  7: "Marketing Manager",
  8: "Sales Representative",
  9: "Artist",
  10: "Chef",
  11: "Economist",
  12: "Business Owner",
  13: "Other",
};
const PROFESSION_OTHER_ID = 13;

// Education enum id → label. Mirror of
// com.aboutyou.productinfra.data.user.Education + values/strings.xml.
const EDUCATION_LABELS: Record<number, string> = {
  0: "High school or less",
  1: "Diploma",
  2: "Bachelor",
  3: "Master",
  4: "Doctorate",
};
const EDUCATION_HIGH_SCHOOL_ID = 0;

// Religion enum value → label. Mirror of
// com.aboutyou.productinfra.data.user.Religion + values/strings.xml.
const RELIGION_LABELS: Record<string, string> = {
  SUNNI_ISLAM: "Sunni Islam",
  SHIA_ISLAM: "Shia Islam",
  ALAWISM: "Alawi Islam",
  CHRISTIANITY: "Christianity",
  DRUZE: "Druze",
  ISMAILI: "Ismaili",
  JUDAISM: "Judaism",
  YAZIDISM: "Yazidism",
  HINDUISM: "Hinduism",
  BUDDHISM: "Buddhism",
  SIKHISM: "Sikhism",
  BAHAI: "Baha'i",
  NON_RELIGIOUS: "Non-religious",
  OTHER: "Other",
};

// Mirror of getFormattedProfession(): if id is OTHER/null, the freeform
// text is what the user wrote; otherwise the localized enum label wins.
function professionLabel(id: number | null, freeform: string | null): string | null {
  if (id == null || id === PROFESSION_OTHER_ID) {
    const t = (freeform ?? "").trim();
    return t.length ? t : null;
  }
  return PROFESSION_LABELS[id] ?? null;
}

// Mirror of getFormattedEducation(): high-school has no specialization,
// other levels combine "<level> in <specialization>" if available.
function educationLabel(id: number | null, specialization: string | null): string | null {
  if (id == null) return null;
  const level = EDUCATION_LABELS[id];
  if (!level) return null;
  if (id === EDUCATION_HIGH_SCHOOL_ID) return level;
  const spec = (specialization ?? "").trim();
  return spec.length ? `${level} in ${spec}` : level;
}

function religionLabel(raw: string | null): string | null {
  if (!raw) return null;
  const key = raw.trim().toUpperCase();
  return RELIGION_LABELS[key] ?? raw;
}

function zodiacLabel(z: string | null): string | null {
  if (!z) return null;
  const lower = z.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// Janerek Language enum values (uppercase, e.g. "ARABIC") and ISO-639
// codes both supported. Mirrors com.aboutyou.productinfra.data.user.Language.
const LANGUAGE_NAMES: Record<string, string> = {
  ARABIC: "Arabic", ENGLISH: "English", FRENCH: "French", SPANISH: "Spanish",
  RUSSIAN: "Russian", KURDISH: "Kurdish", ARMENIAN: "Armenian",
  SYRIAC: "Syriac", TURKISH: "Turkish", MALAY: "Malay", HEBREW: "Hebrew",
  PERSIAN: "Persian", BERBER: "Berber", URDU: "Urdu", PORTUGUESE: "Portuguese",
  GERMAN: "German", ITALIAN: "Italian", DUTCH: "Dutch", POLISH: "Polish",
  ROMANIAN: "Romanian", GREEK: "Greek", CZECH: "Czech", SWEDISH: "Swedish",
  HUNGARIAN: "Hungarian", DANISH: "Danish", FINNISH: "Finnish",
  BULGARIAN: "Bulgarian", CROATIAN: "Croatian", SLOVAK: "Slovak",
  LITHUANIAN: "Lithuanian", LATVIAN: "Latvian", SLOVENE: "Slovene",
  ESTONIAN: "Estonian", OTHER: "Other",
  // ISO-639 fallback for any clients that send codes instead of enum values.
  ar: "Arabic", en: "English", fr: "French", de: "German", es: "Spanish",
  it: "Italian", pt: "Portuguese", ru: "Russian", tr: "Turkish", fa: "Persian",
  ur: "Urdu", hi: "Hindi", bn: "Bengali", id: "Indonesian", ms: "Malay",
  nl: "Dutch", pl: "Polish", ro: "Romanian", sv: "Swedish", no: "Norwegian",
  da: "Danish", fi: "Finnish", el: "Greek", he: "Hebrew", ja: "Japanese",
  ko: "Korean", zh: "Chinese", th: "Thai", vi: "Vietnamese", uk: "Ukrainian",
  cs: "Czech", hu: "Hungarian", bg: "Bulgarian", sr: "Serbian", hr: "Croatian",
  sk: "Slovak", sl: "Slovenian", lt: "Lithuanian", lv: "Latvian",
  et: "Estonian", ku: "Kurdish", az: "Azerbaijani", hy: "Armenian",
  ka: "Georgian", am: "Amharic", sw: "Swahili", so: "Somali", ps: "Pashto",
  tl: "Tagalog", uz: "Uzbek", kk: "Kazakh",
};

function languageLabel(lang: string): string {
  if (!lang) return "";
  const trimmed = lang.trim();
  // Try exact match (handles ISO codes like "ar"), then uppercase enum form.
  if (LANGUAGE_NAMES[trimmed]) return LANGUAGE_NAMES[trimmed];
  const upper = trimmed.toUpperCase();
  if (LANGUAGE_NAMES[upper]) return LANGUAGE_NAMES[upper];
  // Fall back to title-case so we don't render raw "ARABIC" if a value
  // shows up that isn't in the table.
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

const VERIFIED_SVG = `<svg class="verified-badge" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Verified"><path d="M12 1l2.39 2.06 3.13-.4.91 3.04 2.96 1.31-.94 3 1 3-3 1.3-.91 3.04-3.13-.4L12 19.7l-2.4-2.06-3.13.4-.91-3.04-3-1.3 1-3-1-3 3-1.3.91-3.04 3.13.4L12 1z" fill="#1C64F2"/><path d="M8.4 12.2l2.5 2.5 4.9-5" stroke="#fff" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Story icon — direct path port of res/drawable/ic_story.xml so the public
// page header matches the in-app pink-circle "His Story" icon byte-for-byte.
const STORY_SVG = `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10.625,18.125L5,23.75L6.875,25.625L11.25,21.25H13.75L10.625,18.125ZM18.75,1.25C17.375,1.25 16.25,2.375 16.25,3.75C16.25,5.125 17.375,6.25 18.75,6.25C20.125,6.25 21.25,5.125 21.25,3.75C21.25,2.375 20.125,1.25 18.75,1.25ZM26.25,26.263L22.5,30L18.763,26.237V24.375L9.887,15.512C9.5,15.575 9.125,15.6 8.75,15.6V12.9C10.825,12.938 13.262,11.813 14.587,10.35L16.337,8.413C16.575,8.15 16.875,7.938 17.2,7.787C17.563,7.613 17.975,7.5 18.4,7.5H18.438C19.987,7.512 21.25,8.775 21.25,10.325V17.513C21.25,18.563 20.813,19.525 20.1,20.212L15.625,15.738V12.9C14.837,13.55 13.837,14.175 12.762,14.637L20.625,22.5H22.5L26.25,26.263Z" fill="currentColor"/></svg>`;

// Highlight icons — match the Material drawables Android uses
// (ic_looking_for_figuring_out, ic_material_work, ic_school) so the chips
// look identical between native and web.
const ICON_LOOKING_FOR = `<svg viewBox="0 0 960 960" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M784,840 L532,588q-30,24 -69,38t-83,14q-109,0 -184.5,-75.5T120,380q0,-109 75.5,-184.5T380,120q109,0 184.5,75.5T640,380q0,44 -14,83t-38,69l252,252 -56,56ZM380,560q75,0 127.5,-52.5T560,380q0,-75 -52.5,-127.5T380,200q-75,0 -127.5,52.5T200,380q0,75 52.5,127.5T380,560Z" fill="currentColor"/></svg>`;
const ICON_WORK = `<svg viewBox="0 0 960 960" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M160,840q-33,0 -56.5,-23.5T80,760v-440q0,-33 23.5,-56.5T160,240h160v-80q0,-33 23.5,-56.5T400,80h160q33,0 56.5,23.5T640,160v80h160q33,0 56.5,23.5T880,320v440q0,33 -23.5,56.5T800,840L160,840ZM160,760h640v-440L160,320v440ZM400,240h160v-80L400,160v80ZM160,760v-440,440Z" fill="currentColor"/></svg>`;
const ICON_SCHOOL = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5,13.18v4L12,21l7,-3.82v-4L12,17l-7,-3.82zM12,3L1,9l11,6 9,-4.91V17h2V9L12,3z" fill="currentColor"/></svg>`;

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

  const pagerSingle = photoCount <= 1 ? " pager--single" : "";
  const pagerHtml = `
<div class="pager${pagerSingle}" id="pager" data-count="${photoCount}">
  <div class="pager__track" id="pagerTrack">${slides}</div>
  <div class="pager__bars">${bars}</div>
  <button type="button" class="pager__zone pager__zone--prev" id="pagerPrev" aria-label="Previous photo"></button>
  <button type="button" class="pager__zone pager__zone--next" id="pagerNext" aria-label="Next photo"></button>
  <div class="pager__arrow pager__arrow--prev" id="pagerArrowPrev">${ARROW_LEFT}</div>
  <div class="pager__arrow pager__arrow--next" id="pagerArrowNext">${ARROW_RIGHT}</div>
</div>`;

  // ---- Highlights (light pink chips) — order matches Android getHighlights():
  // looking_for, profession, education, zodiac. ----
  const highlights: string[] = [];
  const lookingFor = p.looking_for != null ? LOOKING_FOR_LABELS[p.looking_for] : null;
  if (lookingFor) {
    highlights.push(`<span class="chip chip--light"><span class="icon">${ICON_LOOKING_FOR}</span>${escapeHtml(lookingFor)}</span>`);
  }
  const profession = professionLabel(p.profession_id, p.profession);
  if (profession) {
    highlights.push(`<span class="chip chip--light"><span class="icon">${ICON_WORK}</span>${escapeHtml(profession)}</span>`);
  }
  const education = educationLabel(p.education_id, p.education_specialization);
  if (education) {
    highlights.push(`<span class="chip chip--light"><span class="icon">${ICON_SCHOOL}</span>${escapeHtml(education)}</span>`);
  }
  const zodiac = zodiacLabel(p.zodiac_sign);
  if (zodiac) {
    const zSvg = zodiacSvg(p.zodiac_sign ?? "");
    const zIcon = zSvg ? `<span class="icon icon--zodiac">${zSvg}</span>` : "";
    highlights.push(`<span class="chip chip--light">${zIcon}${escapeHtml(zodiac)}</span>`);
  }

  // ---- Tags (dark wine chips) — religion, nationality flag+demonym,
  // "Speaks <language>". Flag follows nationality (their country of origin),
  // not country_code (where they currently live). ----
  const tags: string[] = [];
  const religion = religionLabel(p.religion);
  if (religion) tags.push(`<span class="chip chip--dark">${escapeHtml(religion)}</span>`);
  const natLabel = nationalityLabel(p.nationality);
  if (natLabel) {
    const flag = countryCodeToFlag(p.nationality);
    tags.push(`<span class="chip chip--dark">${flag ? `<span class="icon flag-icon">${flag}</span>` : ""}${escapeHtml(natLabel)}</span>`);
  }
  for (const lang of asStringArray(p.languages)) {
    const label = languageLabel(lang);
    if (label) tags.push(`<span class="chip chip--dark">Speaks ${escapeHtml(label)}</span>`);
  }
  const tagsHtml = tags.join("");

  // Name row flag follows nationality too, falling back to current location
  // if nationality is missing.
  const nameFlag = countryCodeToFlag(p.nationality) || countryCodeToFlag(p.country_code);

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
  // Photo pager — Instagram-story style. Click left/right zones, tap top
  // progress pill, or swipe horizontally on touch devices.
  (function () {
    var pager = document.getElementById('pager');
    if (!pager) return;
    var count = parseInt(pager.dataset.count || '0', 10);
    if (count <= 1) return;

    var track = document.getElementById('pagerTrack');
    var bars = pager.querySelectorAll('.pager__bar');
    var prevArrow = document.getElementById('pagerArrowPrev');
    var nextArrow = document.getElementById('pagerArrowNext');
    var index = 0;

    function render() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      for (var i = 0; i < bars.length; i++) {
        bars[i].classList.toggle('is-active', i === index);
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
