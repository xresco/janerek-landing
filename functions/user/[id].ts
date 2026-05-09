// Cloudflare Pages Function — renders the public profile page at
// https://janerek.com/user/<uuid>. Visual structure mirrors the in-app
// UserProfileFragment: photo pager (Instagram-story progress pills) →
// name + flag + verified badge → "X years old" → light-pink highlight
// chips (looking-for, profession, education, zodiac) → dark-wine tag chips
// (religion, nationality with flag+demonym, "Speaks <language>") → Story.
//
// Localized to Arabic + English. Visitor language is picked by the shared
// pickLang() helper (?lang= → cookie → Accept-Language → ar) and the entire
// page including <html lang dir>, label dictionaries, and Open Graph tags
// is rendered in that language.

import { zodiacSvg } from "./_zodiac";
import { pickLang, langCookie, dirFor, type Lang } from "../_lang";

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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

// ---------- Localized label dictionaries ----------
// Mirrors of com.aboutyou.productinfra.data.user.* enums + the corresponding
// strings.xml entries (en + ar) from the Janerek Android module.

const DEMONYMS: Record<Lang, Record<string, string>> = {
  en: {
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
  },
  ar: {
    AE: "إماراتي", AF: "أفغاني", AL: "ألباني", AM: "أرمني",
    AR: "أرجنتيني", AT: "نمساوي", AU: "أسترالي", AZ: "أذربيجاني",
    BA: "بوسني", BD: "بنغلاديشي", BE: "بلجيكي", BG: "بلغاري",
    BH: "بحريني", BR: "برازيلي", CA: "كندي", CH: "سويسري",
    CL: "تشيلي", CN: "صيني", CO: "كولومبي", CZ: "تشيكي",
    DE: "ألماني", DK: "دنماركي", DZ: "جزائري", EC: "إكوادوري",
    EE: "إستوني", EG: "مصري", ES: "إسباني", ET: "إثيوبي",
    FI: "فنلندي", FR: "فرنسي", GB: "بريطاني", GE: "جورجي",
    GR: "يوناني", HR: "كرواتي", HU: "مجري", ID: "إندونيسي",
    IE: "أيرلندي", IL: "إسرائيلي", IN: "هندي", IQ: "عراقي",
    IR: "إيراني", IS: "آيسلندي", IT: "إيطالي", JO: "أردني",
    JP: "ياباني", KE: "كيني", KR: "كوري جنوبي", KW: "كويتي",
    KZ: "كازاخستاني", LB: "لبناني", LK: "سريلانكي", LT: "ليتواني",
    LV: "لاتفي", LY: "ليبي", MA: "مغربي", MX: "مكسيكي",
    MY: "ماليزي", NG: "نيجيري", NL: "هولندي", NO: "نرويجي",
    NZ: "نيوزيلندي", OM: "عماني", PE: "بيروفي", PH: "فلبيني",
    PK: "باكستاني", PL: "بولندي", PS: "فلسطيني", PT: "برتغالي",
    QA: "قطري", RO: "روماني", RS: "صربي", RU: "روسي",
    SA: "سعودي", SD: "سوداني", SE: "سويدي", SG: "سنغافوري",
    SI: "سلوفيني", SK: "سلوفاكي", SO: "صومالي", SY: "سوري",
    TH: "تايلاندي", TN: "تونسي", TR: "تركي", UA: "أوكراني",
    US: "أمريكي", UZ: "أوزبكي", VE: "فنزويلي", VN: "فيتنامي",
    YE: "يمني", ZA: "جنوب أفريقي",
  },
};

// LookingFor enum → label.
const LOOKING_FOR_LABELS: Record<Lang, Record<number, string>> = {
  en: {
    0: "Finding a life partner",
    1: "Still figuring out",
    2: "Meeting friends",
  },
  ar: {
    0: "العثور على شريك حياة",
    1: "لا زلت أكتشف",
    2: "مقابلة أصدقاء",
  },
};

// Profession enum id → label.
const PROFESSION_LABELS: Record<Lang, Record<number, string>> = {
  en: {
    0: "Student", 1: "Doctor", 2: "Pharmacist", 3: "Engineer",
    4: "Teacher", 5: "Nurse", 6: "Accountant", 7: "Marketing Manager",
    8: "Sales Representative", 9: "Artist", 10: "Chef", 11: "Economist",
    12: "Business Owner", 13: "Other",
  },
  ar: {
    0: "طالب", 1: "طبيب", 2: "صيدلي", 3: "مهندس",
    4: "مدرس", 5: "ممرض", 6: "محاسب", 7: "مدير تسويق",
    8: "مندوب مبيعات", 9: "فنان", 10: "شيف", 11: "خبير اقتصادي",
    12: "صاحب عمل", 13: "أخرى",
  },
};
const PROFESSION_OTHER_ID = 13;

const EDUCATION_LABELS: Record<Lang, Record<number, string>> = {
  en: {
    0: "High school or less", 1: "Diploma", 2: "Bachelor",
    3: "Master", 4: "Doctorate",
  },
  ar: {
    0: "ثانوية عامة أو أقل", 1: "دبلوم", 2: "بكالوريوس",
    3: "ماجستير", 4: "دكتوراه",
  },
};
const EDUCATION_HIGH_SCHOOL_ID = 0;

const RELIGION_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    SUNNI_ISLAM: "Sunni Islam", SHIA_ISLAM: "Shia Islam",
    ALAWISM: "Alawi Islam", CHRISTIANITY: "Christianity",
    DRUZE: "Druze", ISMAILI: "Ismaili", JUDAISM: "Judaism",
    YAZIDISM: "Yazidism", HINDUISM: "Hinduism", BUDDHISM: "Buddhism",
    SIKHISM: "Sikhism", BAHAI: "Baha'i", NON_RELIGIOUS: "Non-religious",
    OTHER: "Other",
  },
  ar: {
    SUNNI_ISLAM: "الإسلام . سنة", SHIA_ISLAM: "الإسلام . شيعة",
    ALAWISM: "الإسلام . العلوية", CHRISTIANITY: "المسيحية",
    DRUZE: "الدرزية", ISMAILI: "الإسماعيلية", JUDAISM: "اليهودية",
    YAZIDISM: "اليزيدية", HINDUISM: "الهندوسية", BUDDHISM: "البوذية",
    SIKHISM: "السيخية", BAHAI: "البهائية", NON_RELIGIOUS: "غير متدين",
    OTHER: "أخرى",
  },
};

// Janerek Language enum (uppercase) + ISO-639 fallback.
const LANGUAGE_NAMES: Record<Lang, Record<string, string>> = {
  en: {
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
  },
  ar: {
    ARABIC: "العربية", ENGLISH: "الإنجليزية", FRENCH: "الفرنسية", SPANISH: "الإسبانية",
    RUSSIAN: "الروسية", KURDISH: "الكردية", ARMENIAN: "الأرمنية",
    SYRIAC: "السريانية", TURKISH: "التركية", MALAY: "الماليزية", HEBREW: "العبرية",
    PERSIAN: "الفارسية", BERBER: "البربرية", URDU: "الأردية", PORTUGUESE: "البرتغالية",
    GERMAN: "الألمانية", ITALIAN: "الإيطالية", DUTCH: "الهولندية", POLISH: "البولندية",
    ROMANIAN: "الرومانية", GREEK: "اليونانية", CZECH: "التشيكية", SWEDISH: "السويدية",
    HUNGARIAN: "المجرية", DANISH: "الدنماركية", FINNISH: "الفنلندية",
    BULGARIAN: "البلغارية", CROATIAN: "الكرواتية", SLOVAK: "السلوفاكية",
    LITHUANIAN: "الليتوانية", LATVIAN: "اللاتفية", SLOVENE: "السلوفينية",
    ESTONIAN: "الإستونية", OTHER: "أخرى",
    ar: "العربية", en: "الإنجليزية", fr: "الفرنسية", de: "الألمانية", es: "الإسبانية",
    it: "الإيطالية", pt: "البرتغالية", ru: "الروسية", tr: "التركية", fa: "الفارسية",
    ur: "الأردية", hi: "الهندية", bn: "البنغالية", id: "الإندونيسية", ms: "الماليزية",
    nl: "الهولندية", pl: "البولندية", ro: "الرومانية", sv: "السويدية", no: "النرويجية",
    da: "الدنماركية", fi: "الفنلندية", el: "اليونانية", he: "العبرية", ja: "اليابانية",
    ko: "الكورية", zh: "الصينية", th: "التايلاندية", vi: "الفيتنامية", uk: "الأوكرانية",
    cs: "التشيكية", hu: "المجرية", bg: "البلغارية", sr: "الصربية", hr: "الكرواتية",
    sk: "السلوفاكية", sl: "السلوفينية", lt: "الليتوانية", lv: "اللاتفية",
    et: "الإستونية", ku: "الكردية", az: "الأذربيجانية", hy: "الأرمنية",
    ka: "الجورجية", am: "الأمهرية", sw: "السواحلية", so: "الصومالية", ps: "الباشتو",
    tl: "التاغالوغية", uz: "الأوزبكية", kk: "الكازاخية",
  },
};

// Static UI strings + a couple of formatters. Keeps every visible string
// localizable from one table.
type StringKey =
  | "yearsOldFmt"
  | "speaksFmt"
  | "educationFmt"
  | "storyHis"
  | "storyHer"
  | "storyNeutral"
  | "openInApp"
  | "notFoundTitle"
  | "notFoundBody"
  | "backTo"
  | "metaProfileTitle"
  | "metaDefaultDescription"
  | "ariaPrev"
  | "ariaNext"
  | "ariaVerified";

type Formatter = string | ((...args: string[]) => string);

const STRINGS: Record<Lang, Record<StringKey, Formatter>> = {
  en: {
    yearsOldFmt: (n) => `${n} years old`,
    speaksFmt: (lang) => `Speaks ${lang}`,
    educationFmt: (level, spec) => `${level} in ${spec}`,
    storyHis: "His Story",
    storyHer: "Her Story",
    storyNeutral: "Story",
    openInApp: (app) => `Open in ${app}`,
    notFoundTitle: "This profile isn't available",
    notFoundBody: "The link may have expired or been removed by its owner.",
    backTo: (app) => `Back to ${app}`,
    metaProfileTitle: (name, app) => `Meet ${name} on ${app}`,
    metaDefaultDescription: (app) => `I'm using ${app} to find meaningful connections.`,
    ariaPrev: "Previous photo",
    ariaNext: "Next photo",
    ariaVerified: "Verified",
  },
  ar: {
    yearsOldFmt: (n) => `${n} سنة`,
    speaksFmt: (lang) => `يتحدث ${lang}`,
    educationFmt: (level, spec) => `${level} في ${spec}`,
    storyHis: "قصته",
    storyHer: "قصتها",
    storyNeutral: "قصة",
    openInApp: (app) => `فتح في ${app}`,
    notFoundTitle: "هذا الملف الشخصي غير متوفر",
    notFoundBody: "ربما انتهت صلاحية الرابط أو قام صاحبه بإزالته.",
    backTo: (app) => `العودة إلى ${app}`,
    metaProfileTitle: (name, app) => `تعرّف على ${name} على ${app}`,
    metaDefaultDescription: (app) => `أستخدم ${app} للعثور على تواصل ذي معنى.`,
    ariaPrev: "الصورة السابقة",
    ariaNext: "الصورة التالية",
    ariaVerified: "موثّق",
  },
};

function s(lang: Lang, key: StringKey, ...args: string[]): string {
  const entry = STRINGS[lang][key];
  return typeof entry === "function" ? entry(...args) : entry;
}

const APP_NAME_LOCALIZED: Record<Lang, string> = {
  en: "Janerek",
  ar: "جانرك",
};

// ---------- Label resolvers ----------

function nationalityLabel(nat: string | null, lang: Lang): string | null {
  if (!nat) return null;
  const code = nat.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(code) && DEMONYMS[lang][code]) return DEMONYMS[lang][code];
  return nat;
}

// Mirror of getFormattedProfession(): if id is OTHER/null, the freeform text
// is what the user wrote (and we display it as-is regardless of locale —
// the user typed it themselves); otherwise the localized enum label wins.
function professionLabel(id: number | null, freeform: string | null, lang: Lang): string | null {
  if (id == null || id === PROFESSION_OTHER_ID) {
    const t = (freeform ?? "").trim();
    return t.length ? t : null;
  }
  return PROFESSION_LABELS[lang][id] ?? null;
}

// Mirror of getFormattedEducation(): high-school has no specialization,
// other levels combine "<level> in <specialization>" if available.
function educationLabel(id: number | null, specialization: string | null, lang: Lang): string | null {
  if (id == null) return null;
  const level = EDUCATION_LABELS[lang][id];
  if (!level) return null;
  if (id === EDUCATION_HIGH_SCHOOL_ID) return level;
  const spec = (specialization ?? "").trim();
  return spec.length ? s(lang, "educationFmt", level, spec) : level;
}

function religionLabel(raw: string | null, lang: Lang): string | null {
  if (!raw) return null;
  const key = raw.trim().toUpperCase();
  return RELIGION_LABELS[lang][key] ?? raw;
}

function zodiacLabel(z: string | null, lang: Lang): string | null {
  if (!z) return null;
  const lower = z.toLowerCase();
  if (lang === "en") return lower.charAt(0).toUpperCase() + lower.slice(1);
  // Arabic zodiac names mirror the in-app enum strings (zodiac_sign_*).
  const ar: Record<string, string> = {
    aries: "الحمل", taurus: "الثور", gemini: "الجوزاء", cancer: "السرطان",
    leo: "الأسد", virgo: "العذراء", libra: "الميزان", scorpio: "العقرب",
    sagittarius: "القوس", capricorn: "الجدي", aquarius: "الدلو", pisces: "الحوت",
  };
  return ar[lower] ?? z;
}

function languageLabel(rawLang: string, lang: Lang): string {
  if (!rawLang) return "";
  const trimmed = rawLang.trim();
  if (LANGUAGE_NAMES[lang][trimmed]) return LANGUAGE_NAMES[lang][trimmed];
  const upper = trimmed.toUpperCase();
  if (LANGUAGE_NAMES[lang][upper]) return LANGUAGE_NAMES[lang][upper];
  // Fall back to title-case English so we don't render raw "ARABIC" or
  // anything weird when the value isn't in the table.
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

// ---------- SVG assets (locale-independent) ----------

const VERIFIED_SVG = (lang: Lang) =>
  `<svg class="verified-badge" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="${escapeHtml(s(lang, "ariaVerified"))}"><path d="M12 1l2.39 2.06 3.13-.4.91 3.04 2.96 1.31-.94 3 1 3-3 1.3-.91 3.04-3.13-.4L12 19.7l-2.4-2.06-3.13.4-.91-3.04-3-1.3 1-3-1-3 3-1.3.91-3.04 3.13.4L12 1z" fill="#1C64F2"/><path d="M8.4 12.2l2.5 2.5 4.9-5" stroke="#fff" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Story icon — direct path port of res/drawable/ic_story.xml so the public
// page header matches the in-app pink-circle "His Story" icon byte-for-byte.
const STORY_SVG = `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10.625,18.125L5,23.75L6.875,25.625L11.25,21.25H13.75L10.625,18.125ZM18.75,1.25C17.375,1.25 16.25,2.375 16.25,3.75C16.25,5.125 17.375,6.25 18.75,6.25C20.125,6.25 21.25,5.125 21.25,3.75C21.25,2.375 20.125,1.25 18.75,1.25ZM26.25,26.263L22.5,30L18.763,26.237V24.375L9.887,15.512C9.5,15.575 9.125,15.6 8.75,15.6V12.9C10.825,12.938 13.262,11.813 14.587,10.35L16.337,8.413C16.575,8.15 16.875,7.938 17.2,7.787C17.563,7.613 17.975,7.5 18.4,7.5H18.438C19.987,7.512 21.25,8.775 21.25,10.325V17.513C21.25,18.563 20.813,19.525 20.1,20.212L15.625,15.738V12.9C14.837,13.55 13.837,14.175 12.762,14.637L20.625,22.5H22.5L26.25,26.263Z" fill="currentColor"/></svg>`;

// Highlight icons — match the Material drawables Android uses.
const ICON_LOOKING_FOR = `<svg viewBox="0 0 960 960" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M784,840 L532,588q-30,24 -69,38t-83,14q-109,0 -184.5,-75.5T120,380q0,-109 75.5,-184.5T380,120q109,0 184.5,75.5T640,380q0,44 -14,83t-38,69l252,252 -56,56ZM380,560q75,0 127.5,-52.5T560,380q0,-75 -52.5,-127.5T380,200q-75,0 -127.5,52.5T200,380q0,75 52.5,127.5T380,560Z" fill="currentColor"/></svg>`;
const ICON_WORK = `<svg viewBox="0 0 960 960" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M160,840q-33,0 -56.5,-23.5T80,760v-440q0,-33 23.5,-56.5T160,240h160v-80q0,-33 23.5,-56.5T400,80h160q33,0 56.5,23.5T640,160v80h160q33,0 56.5,23.5T880,320v440q0,33 -23.5,56.5T800,840L160,840ZM160,760h640v-440L160,320v440ZM400,240h160v-80L400,160v80ZM160,760v-440,440Z" fill="currentColor"/></svg>`;
const ICON_SCHOOL = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5,13.18v4L12,21l7,-3.82v-4L12,17l-7,-3.82zM12,3L1,9l11,6 9,-4.91V17h2V9L12,3z" fill="currentColor"/></svg>`;

const ARROW_LEFT = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
const ARROW_RIGHT = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

// Religion chip icons — direct ports of the Android drawables in
// productinfra/data/src/main/res/drawable/religion_*.xml. Mapping mirrors
// Religion.kt exactly: Sunni/Shia/Alawism/Ismaili share the islam icon,
// Yazidism + Non-religious + Other use the generic "other" icon. Fill is
// currentColor so the chip's foreground colour drives the icon.
const RELIGION_ISLAM_SVG = `<svg viewBox="0 0 71 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15.88,35.93C15.88,19.29 29.37,5.8 46.01,5.8C50.92,5.8 55.55,6.98 59.65,9.07C53.39,3.62 45.21,0.3 36.26,0.3C16.58,0.3 0.63,16.25 0.63,35.93C0.63,55.61 16.58,71.56 36.26,71.56C45.22,71.56 53.39,68.25 59.65,62.79C55.55,64.87 50.92,66.06 46.01,66.06C29.37,66.06 15.88,52.57 15.88,35.93Z" fill="currentColor"/><path d="M70.65,32.81L62.06,32.63L59.24,24.52L56.41,32.63L47.82,32.81L54.67,38L52.18,46.22L59.24,41.31L66.29,46.22L63.8,38L70.65,32.81Z" fill="currentColor"/></svg>`;
const RELIGION_CHRISTIANITY_SVG = `<svg viewBox="0 0 14 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7.923,0H5.445V20H7.923V0Z" fill="currentColor"/><path d="M13.06,7.559V5.082L0.305,5.082V7.559L13.06,7.559Z" fill="currentColor"/></svg>`;
const RELIGION_JUDAISM_SVG = `<svg viewBox="0 0 71 81" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M35.67,80.81L0.77,20.36H70.57L35.67,80.81ZM11.16,26.36L35.67,68.81L60.18,26.36H11.16Z" fill="currentColor"/><path d="M70.57,60.58H0.76L35.66,0.13L70.56,60.58H70.57ZM11.16,54.58H60.18L35.67,12.13L11.16,54.58Z" fill="currentColor"/></svg>`;
const RELIGION_DRUZE_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12,17.27L18.18,21l-1.64,-7.03L22,9.24l-7.19,-0.61L12,2 9.19,8.63 2,9.24l5.46,4.73L5.82,21z" fill="currentColor"/></svg>`;
const RELIGION_HINDUISM_SVG = `<svg viewBox="0 0 75 76" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M46.315,0.171L40.05,6.436L46.315,12.701L52.58,6.436L46.315,0.171Z" fill="currentColor"/><path d="M46.32,22.19C59.26,25.46 68.93,15.48 68.93,15.48L61.95,8.5C61.95,8.5 55.19,15.79 46.32,15.79C37.45,15.79 32.35,4.77 32.35,4.77C32.35,4.77 29.77,18.01 46.32,22.19Z" fill="currentColor"/><path d="M74.35,45.03C73.82,25.9 59.95,22.23 51.88,27.1C44.26,31.7 43.24,43.42 34.78,44.71C32.29,42.51 30.04,41.56 30.04,41.56C30.04,41.56 39.73,35.25 36.97,25.38C34.21,15.51 21.15,10.8 6.22,20.36L12.49,30.89C12.49,30.89 18.76,23.89 25.76,24.09C32.76,24.29 37.36,38.76 17.96,37.16L22.29,47.83C22.29,47.83 32.89,46.21 34.49,54.81C36.29,64.48 21.27,71.56 10.94,63.57C0.61,55.57 1.7,44.57 1.7,44.57C1.7,44.57 -2.75,63.08 10.23,72.15C23.21,81.22 40.81,73.13 41.25,59.79C41.44,54.21 39.5,50.12 37.2,47.24H44.96C44.96,47.24 51.69,42.97 55.43,35.91C59.16,28.84 67.9,29.58 69.7,37.31C71.5,45.04 66.83,58.91 58.43,59.24C50.03,59.57 47.1,51.24 47.1,51.24V62.44C47.1,62.44 50.77,70.17 58.23,70.17C65.69,70.17 74.9,64.17 74.36,45.04L74.35,45.03Z" fill="currentColor"/></svg>`;
const RELIGION_BUDDHISM_SVG = `<svg viewBox="0 0 86 85" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M43.67,74.68C26.03,74.68 11.68,60.33 11.68,42.69C11.68,25.05 26.03,10.7 43.67,10.7C61.31,10.7 75.66,25.05 75.66,42.69C75.66,60.33 61.31,74.68 43.67,74.68ZM43.67,16.69C29.34,16.69 17.68,28.35 17.68,42.68C17.68,57.01 29.34,68.67 43.67,68.67C58,68.67 69.66,57.01 69.66,42.68C69.66,28.35 58,16.69 43.67,16.69Z" fill="currentColor"/><path d="M43.67,56.73C35.92,56.73 29.62,50.43 29.62,42.68C29.62,34.93 35.92,28.63 43.67,28.63C51.42,28.63 57.72,34.93 57.72,42.68C57.72,50.43 51.42,56.73 43.67,56.73ZM43.67,34.64C39.23,34.64 35.62,38.25 35.62,42.69C35.62,47.13 39.23,50.74 43.67,50.74C48.11,50.74 51.72,47.13 51.72,42.69C51.72,38.25 48.11,34.64 43.67,34.64Z" fill="currentColor"/><path d="M46.67,6.01H40.67V31.64H46.67V6.01Z" fill="currentColor"/><path d="M43.67,11.1C46.58,11.1 48.94,8.741 48.94,5.83C48.94,2.92 46.58,0.56 43.67,0.56C40.759,0.56 38.4,2.92 38.4,5.83C38.4,8.741 40.759,11.1 43.67,11.1Z" fill="currentColor"/><path d="M46.67,53.73H40.67V79.36H46.67V53.73Z" fill="currentColor"/><path d="M43.67,84.81C46.58,84.81 48.94,82.451 48.94,79.54C48.94,76.63 46.58,74.27 43.67,74.27C40.759,74.27 38.4,76.63 38.4,79.54C38.4,82.451 40.759,84.81 43.67,84.81Z" fill="currentColor"/><path d="M80.35,39.68H54.72V45.68H80.35V39.68Z" fill="currentColor"/><path d="M80.53,47.95C83.44,47.95 85.8,45.591 85.8,42.68C85.8,39.77 83.44,37.41 80.53,37.41C77.619,37.41 75.26,39.77 75.26,42.68C75.26,45.591 77.619,47.95 80.53,47.95Z" fill="currentColor"/><path d="M32.63,39.68H7V45.68H32.63V39.68Z" fill="currentColor"/><path d="M12.024,43.548C12.49,40.675 10.539,37.968 7.666,37.502C4.793,37.036 2.086,38.987 1.62,41.86C1.154,44.732 3.105,47.44 5.978,47.906C8.85,48.372 11.557,46.421 12.024,43.548Z" fill="currentColor"/><path d="M67.483,14.628L49.36,32.751L53.603,36.993L71.726,18.87L67.483,14.628Z" fill="currentColor"/><path d="M73.46,20.35C71.4,22.41 68.07,22.41 66.01,20.35C63.95,18.29 63.95,14.96 66.01,12.9C68.07,10.84 71.4,10.84 73.46,12.9C75.52,14.96 75.52,18.29 73.46,20.35Z" fill="currentColor"/><path d="M33.75,48.38L15.627,66.504L19.87,70.746L37.993,52.623L33.75,48.38Z" fill="currentColor"/><path d="M22.881,69.127C23.077,66.223 20.882,63.71 17.978,63.514C15.074,63.318 12.561,65.513 12.365,68.418C12.169,71.321 14.365,73.834 17.268,74.03C20.173,74.226 22.685,72.031 22.881,69.127Z" fill="currentColor"/><path d="M53.607,48.355L49.365,52.598L67.488,70.721L71.73,66.479L53.607,48.355Z" fill="currentColor"/><path d="M66.01,72.47C63.95,70.41 63.95,67.08 66.01,65.02C68.07,62.96 71.4,62.96 73.46,65.02C75.52,67.08 75.52,70.41 73.46,72.47C71.4,74.53 68.07,74.53 66.01,72.47Z" fill="currentColor"/><path d="M19.865,14.633L15.622,18.875L33.745,36.998L37.988,32.756L19.865,14.633Z" fill="currentColor"/><path d="M22.872,16.732C22.94,13.823 20.635,11.409 17.725,11.342C14.816,11.275 12.402,13.58 12.335,16.49C12.268,19.399 14.573,21.813 17.483,21.88C20.392,21.947 22.805,19.642 22.872,16.732Z" fill="currentColor"/></svg>`;
const RELIGION_SIKHISM_SVG = `<svg viewBox="0 0 71 84" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M55.25,14.91C55.25,14.91 61.98,22.61 63.34,32.37C64.71,42.12 60.32,50.41 45.49,59.67C42.99,61.23 40.69,62.67 38.57,64V58.98L44.71,52.84V51.92C52.1,48.49 57.24,41.02 57.24,32.36C57.24,23.01 51.25,15.05 42.91,12.06C43.87,9.63 44.71,8.46 44.71,8.46L35.67,0.68V0.66H35.66H35.65V0.68L26.61,8.46C26.61,8.46 27.45,9.62 28.41,12.06C20.09,15.05 14.1,23 14.1,32.35C14.1,41 19.23,48.46 26.61,51.9V52.83L32.75,58.97V63.99C30.63,62.66 28.33,61.22 25.83,59.66C11.01,50.4 6.62,42.11 7.98,32.36C9.35,22.61 16.07,14.9 16.07,14.9C-6.02,26.02 -0.7,45.62 8.95,57.12C18.6,68.63 18.12,70.09 18.12,70.09C23.58,62.87 28.34,64.24 28.34,64.24L32.75,67.09V67.65C28.15,70.54 24.98,72.55 23.45,73.51C22.79,73.93 22.39,74.66 22.39,75.44V77.06C22.39,78.33 23.42,79.35 24.68,79.35C25.94,79.35 26.97,78.32 26.97,77.06V74.57L32.75,70.84V77.69H31.77V79.66C31.77,81.8 33.51,83.54 35.65,83.54H35.67C37.81,83.54 39.55,81.8 39.55,79.66V77.69H38.57V70.84L44.35,74.57V77.06C44.35,78.33 45.38,79.35 46.64,79.35C47.9,79.35 48.93,78.32 48.93,77.06V75.44C48.93,74.65 48.53,73.93 47.87,73.51C46.34,72.54 43.18,70.54 38.57,67.65V67.09L42.98,64.24C42.98,64.24 47.74,62.87 53.2,70.09C53.2,70.09 52.71,68.63 62.37,57.12C72.02,45.61 77.34,26.01 55.25,14.9V14.91ZM53.3,32.36C53.3,38.77 49.85,44.37 44.72,47.46V47.09C44.72,47.09 40.19,42.8 40.19,28.76C40.19,23.29 40.88,19.02 41.72,15.83C48.47,18.3 53.31,24.77 53.31,32.37L53.3,32.36ZM18.05,32.36C18.05,24.77 22.88,18.31 29.62,15.83C30.46,19.02 31.15,23.29 31.15,28.75C31.15,42.79 26.62,47.08 26.62,47.08V47.44C21.5,44.35 18.06,38.75 18.06,32.36H18.05Z" fill="currentColor"/></svg>`;
const RELIGION_BAHAI_SVG = `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M13.476,20L10.002,17.117L6.529,20L5.693,15.525L1.207,15.467L3.4,11.494L0,8.521L4.196,6.909L3.473,2.414L7.709,3.916L10,0L12.291,3.916L16.527,2.414L15.804,6.909L20,8.521L16.6,11.494L18.793,15.467L14.307,15.525L13.471,20H13.476ZM10.002,15.18L12.488,17.244L13.085,14.042L16.295,14L14.725,11.157L17.158,9.03L14.157,7.877L14.673,4.66L11.642,5.736L10.002,2.933L8.363,5.736L5.332,4.66L5.848,7.877L2.847,9.03L5.28,11.157L3.709,14L6.92,14.042L7.517,17.244L10.002,15.18Z" fill="currentColor"/></svg>`;
const RELIGION_OTHER_SVG = `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1.022,10.623C0.938,9.417 1.098,8.208 1.492,7.066C1.886,5.923 2.506,4.872 3.314,3.975C4.123,3.077 5.104,2.352 6.199,1.842C7.294,1.332 8.481,1.047 9.689,1.005C10.896,0.964 12.099,1.165 13.227,1.598C14.355,2.032 15.384,2.687 16.253,3.527C17.122,4.366 17.813,5.372 18.285,6.484C18.757,7.596 19,8.792 19,10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="10" cy="10" r="2.727" fill="currentColor"/></svg>`;

const RELIGION_ICON_BY_KEY: Record<string, string> = {
  SUNNI_ISLAM: RELIGION_ISLAM_SVG,
  SHIA_ISLAM: RELIGION_ISLAM_SVG,
  ALAWISM: RELIGION_ISLAM_SVG,
  ISMAILI: RELIGION_ISLAM_SVG,
  CHRISTIANITY: RELIGION_CHRISTIANITY_SVG,
  DRUZE: RELIGION_DRUZE_SVG,
  JUDAISM: RELIGION_JUDAISM_SVG,
  YAZIDISM: RELIGION_OTHER_SVG,
  HINDUISM: RELIGION_HINDUISM_SVG,
  BUDDHISM: RELIGION_BUDDHISM_SVG,
  SIKHISM: RELIGION_SIKHISM_SVG,
  BAHAI: RELIGION_BAHAI_SVG,
  NON_RELIGIOUS: RELIGION_OTHER_SVG,
  OTHER: RELIGION_OTHER_SVG,
};

function religionIconSvg(raw: string | null): string | null {
  if (!raw) return null;
  return RELIGION_ICON_BY_KEY[raw.trim().toUpperCase()] ?? null;
}

function notFound(host: string, lang: Lang): Response {
  const dir = dirFor(lang);
  const appName = APP_NAME_LOCALIZED[lang];
  const html = `<!doctype html><html lang="${lang}" dir="${dir}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${escapeHtml(s(lang, "notFoundTitle"))} — ${escapeHtml(appName)}</title>
<link rel="stylesheet" href="/css/profile.css">
</head><body class="lang-${lang}">
<div class="shell"><div class="notfound">
  <h1>${escapeHtml(s(lang, "notFoundTitle"))}</h1>
  <p>${escapeHtml(s(lang, "notFoundBody"))}</p>
  <a href="https://${host}">${escapeHtml(s(lang, "backTo", appName))}</a>
</div></div>
</body></html>`;
  return new Response(html, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
      "Set-Cookie": langCookie(lang),
    },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, env, request } = context;
  const userId = String(params.id ?? "").toLowerCase();
  const host = env.APP_HOST ?? "janerek.com";
  const envAppName = env.APP_NAME;
  const lang = pickLang(request);
  const dir = dirFor(lang);
  const appName = envAppName ?? APP_NAME_LOCALIZED[lang];

  if (!UUID_RE.test(userId)) {
    return notFound(host, lang);
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
      body: JSON.stringify({ p_user_id: userId }),
    },
  );

  if (!rpcRes.ok) return notFound(host, lang);
  const rows = (await rpcRes.json()) as PublicProfile[];
  if (!Array.isArray(rows) || rows.length === 0) {
    return notFound(host, lang);
  }
  const p = rows[0];

  const photoIds = extractPhotoIds(p.profile_photos);
  const photoCount = photoIds.length;
  const ogImageUrl = photoCount > 0
    ? `https://${host}/user/${userId}/img/0.jpg`
    : `https://${host}/assets/og-default.jpg`;

  const bio = (p.bio ?? "").trim();
  const ogDescription = bio.length > 0
    ? bio.length > 160 ? bio.slice(0, 157) + "…" : bio
    : s(lang, "metaDefaultDescription", appName);

  const playStoreUrl = env.PLAY_STORE_URL ??
    `https://play.google.com/store/apps/details?id=com.janerek`;
  const appStoreUrl = env.APP_STORE_URL ??
    `https://apps.apple.com/app/janerek`;
  const shareUrl = `https://${host}/user/${userId}`;

  // ---- Photo pager ----
  const slides = photoCount > 0
    ? photoIds
        .map((_, i) =>
          `<div class="pager__slide"><img src="/user/${userId}/img/${i}.jpg" alt="${escapeHtml(p.name)}" loading="${i === 0 ? "eager" : "lazy"}"></div>`
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
  <button type="button" class="pager__zone pager__zone--prev" id="pagerPrev" aria-label="${escapeHtml(s(lang, "ariaPrev"))}"></button>
  <button type="button" class="pager__zone pager__zone--next" id="pagerNext" aria-label="${escapeHtml(s(lang, "ariaNext"))}"></button>
  <div class="pager__arrow pager__arrow--prev" id="pagerArrowPrev">${ARROW_LEFT}</div>
  <div class="pager__arrow pager__arrow--next" id="pagerArrowNext">${ARROW_RIGHT}</div>
</div>`;

  // ---- Highlights (light pink chips) — order matches Android getHighlights():
  // looking_for, profession, education, zodiac. ----
  const highlights: string[] = [];
  const lookingFor = p.looking_for != null ? LOOKING_FOR_LABELS[lang][p.looking_for] : null;
  if (lookingFor) {
    highlights.push(`<span class="chip chip--light"><span class="icon">${ICON_LOOKING_FOR}</span>${escapeHtml(lookingFor)}</span>`);
  }
  const profession = professionLabel(p.profession_id, p.profession, lang);
  if (profession) {
    highlights.push(`<span class="chip chip--light"><span class="icon">${ICON_WORK}</span>${escapeHtml(profession)}</span>`);
  }
  const education = educationLabel(p.education_id, p.education_specialization, lang);
  if (education) {
    highlights.push(`<span class="chip chip--light"><span class="icon">${ICON_SCHOOL}</span>${escapeHtml(education)}</span>`);
  }
  const zodiac = zodiacLabel(p.zodiac_sign, lang);
  if (zodiac) {
    const zSvg = zodiacSvg(p.zodiac_sign ?? "");
    const zIcon = zSvg ? `<span class="icon icon--zodiac">${zSvg}</span>` : "";
    highlights.push(`<span class="chip chip--light">${zIcon}${escapeHtml(zodiac)}</span>`);
  }

  // ---- Tags (dark wine chips) — religion, nationality flag+demonym,
  // "Speaks <language>". Flag follows nationality (their country of origin),
  // not country_code (where they currently live). ----
  const tags: string[] = [];
  const religion = religionLabel(p.religion, lang);
  if (religion) {
    const rIcon = religionIconSvg(p.religion);
    const rIconHtml = rIcon ? `<span class="icon">${rIcon}</span>` : "";
    tags.push(`<span class="chip chip--dark">${rIconHtml}${escapeHtml(religion)}</span>`);
  }
  const natLabel = nationalityLabel(p.nationality, lang);
  if (natLabel) {
    const flag = countryCodeToFlag(p.nationality);
    tags.push(`<span class="chip chip--dark">${flag ? `<span class="icon flag-icon">${flag}</span>` : ""}${escapeHtml(natLabel)}</span>`);
  }
  for (const rawLang of asStringArray(p.languages)) {
    const label = languageLabel(rawLang, lang);
    if (label) tags.push(`<span class="chip chip--dark">${escapeHtml(s(lang, "speaksFmt", label))}</span>`);
  }
  const tagsHtml = tags.join("");

  // Name row flag follows nationality too, falling back to current location
  // if nationality is missing.
  const nameFlag = countryCodeToFlag(p.nationality) || countryCodeToFlag(p.country_code);

  const storyTitle = (() => {
    const g = (p.gender ?? "").toLowerCase();
    if (g.includes("female") || g === "woman" || g === "her") return s(lang, "storyHer");
    if (g.includes("male") || g === "man" || g === "him") return s(lang, "storyHis");
    return s(lang, "storyNeutral");
  })();

  const ogTitle = s(lang, "metaProfileTitle", p.name, appName);

  const html = `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#0F1115">
<title>${escapeHtml(p.name)} — ${escapeHtml(appName)}</title>

<meta property="og:type" content="profile">
<meta property="og:title" content="${escapeHtml(ogTitle)}">
<meta property="og:description" content="${escapeHtml(ogDescription)}">
<meta property="og:image" content="${ogImageUrl}">
<meta property="og:url" content="${shareUrl}">
<meta property="og:site_name" content="${escapeHtml(appName)}">
<meta property="og:locale" content="${lang === "ar" ? "ar_AR" : "en_US"}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(ogTitle)}">
<meta name="twitter:description" content="${escapeHtml(ogDescription)}">
<meta name="twitter:image" content="${ogImageUrl}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/css/profile.css">
</head>
<body class="lang-${lang}">
<div class="shell">
  ${pagerHtml}
  <div class="transition"></div>

  <div class="content">
    <div class="name-row">
      <h1 class="name">${escapeHtml(p.name)}</h1>
      ${nameFlag ? `<span class="flag" aria-hidden="true">${nameFlag}</span>` : ""}
      ${p.is_verified ? VERIFIED_SVG(lang) : ""}
    </div>
    ${typeof p.age === "number" ? `<div class="age-line">${escapeHtml(s(lang, "yearsOldFmt", String(p.age)))}</div>` : ""}

    ${highlights.length ? `<div class="chips">${highlights.join("")}</div>` : ""}

    ${tagsHtml ? `<div class="chips">${tagsHtml}</div>` : ""}

    ${
      bio
        ? `<section class="section">
            <div class="section-head">
              <div class="section-circle">${STORY_SVG}</div>
              <div class="section-title">${escapeHtml(storyTitle)}</div>
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
     data-id="${userId}"
     data-android-pkg="com.janerek"
     data-android-store="${playStoreUrl}"
     data-ios-store="${appStoreUrl}"
     data-ios-scheme="com.janerek://user/${userId}"
     data-universal-link="${shareUrl}">
    ${escapeHtml(s(lang, "openInApp", appName))}
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
        window.location.href = 'intent://' + btn.dataset.host + '/user/' + btn.dataset.id +
          '#Intent;scheme=https;package=' + btn.dataset.androidPkg +
          ';S.browser_fallback_url=' + fallback + ';end';
      } else if (isIOS) {
        e.preventDefault();
        var t = Date.now();
        // iOS blocks same-domain Universal Links (you can't tap a link
        // on janerek.com that opens janerek.com in the app). Use the
        // custom URL scheme (com.janerek://user/<id>) — registered in
        // the app's Info.plist and routed by SharedProfileRouter — and
        // fall through to the App Store after 1.5s if the app isn't
        // installed (no scheme handler intercepted the navigation).
        window.location.href = btn.dataset.iosScheme;
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
      "Set-Cookie": langCookie(lang),
    },
  });
};
