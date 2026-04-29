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
  if (religion) tags.push(`<span class="chip chip--dark">${escapeHtml(religion)}</span>`);
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
      "Set-Cookie": langCookie(lang),
    },
  });
};
