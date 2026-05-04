// Onboarding-step data shared across the Janerek web onboarding pages.
// Mirrors the corresponding Android enums (Religion, Language, Country,
// LookingFor) so the web and mobile flows offer the same options. Labels
// are duplicated EN+AR; flag emojis come from the country code.

export const RELIGIONS = [
    "SUNNI_ISLAM", "SHIA_ISLAM", "ALAWISM", "CHRISTIANITY", "DRUZE",
    "ISMAILI", "JUDAISM", "YAZIDISM", "HINDUISM", "BUDDHISM",
    "SIKHISM", "BAHAI", "NON_RELIGIOUS", "OTHER",
];

export const RELIGION_LABELS = {
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

// Janerek Language enum (subset that's enabled on Android).
export const LANGUAGES = [
    "ARABIC", "ENGLISH", "FRENCH", "SPANISH", "RUSSIAN", "KURDISH",
    "ARMENIAN", "SYRIAC", "TURKISH", "MALAY", "HEBREW", "PERSIAN",
    "BERBER", "URDU", "PORTUGUESE", "GERMAN", "ITALIAN", "DUTCH",
    "POLISH", "ROMANIAN", "GREEK", "SWEDISH", "DANISH", "OTHER",
];

export const LANGUAGE_LABELS = {
    en: {
        ARABIC: "Arabic", ENGLISH: "English", FRENCH: "French", SPANISH: "Spanish",
        RUSSIAN: "Russian", KURDISH: "Kurdish", ARMENIAN: "Armenian",
        SYRIAC: "Syriac", TURKISH: "Turkish", MALAY: "Malay", HEBREW: "Hebrew",
        PERSIAN: "Persian", BERBER: "Berber", URDU: "Urdu", PORTUGUESE: "Portuguese",
        GERMAN: "German", ITALIAN: "Italian", DUTCH: "Dutch", POLISH: "Polish",
        ROMANIAN: "Romanian", GREEK: "Greek", SWEDISH: "Swedish", DANISH: "Danish",
        OTHER: "Other",
    },
    ar: {
        ARABIC: "العربية", ENGLISH: "الإنجليزية", FRENCH: "الفرنسية", SPANISH: "الإسبانية",
        RUSSIAN: "الروسية", KURDISH: "الكردية", ARMENIAN: "الأرمنية",
        SYRIAC: "السريانية", TURKISH: "التركية", MALAY: "الماليزية", HEBREW: "العبرية",
        PERSIAN: "الفارسية", BERBER: "البربرية", URDU: "الأردية", PORTUGUESE: "البرتغالية",
        GERMAN: "الألمانية", ITALIAN: "الإيطالية", DUTCH: "الهولندية", POLISH: "البولندية",
        ROMANIAN: "الرومانية", GREEK: "اليونانية", SWEDISH: "السويدية", DANISH: "الدنماركية",
        OTHER: "أخرى",
    },
};

// Country list — same set of demonyms used by the share-profile renderer.
// Selecting a country here writes its ISO-2 code into `users.nationality`
// (mirrors what the mobile app does).
export const COUNTRY_CODES = [
    "AE","AF","AL","AM","AR","AT","AU","AZ","BA","BD","BE","BG","BH","BR","CA",
    "CH","CL","CN","CO","CZ","DE","DK","DZ","EC","EE","EG","ES","ET","FI","FR",
    "GB","GE","GR","HR","HU","ID","IE","IL","IN","IQ","IR","IS","IT","JO","JP",
    "KE","KR","KW","KZ","LB","LK","LT","LV","LY","MA","MX","MY","NG","NL","NO",
    "NZ","OM","PE","PH","PK","PL","PS","PT","QA","RO","RS","RU","SA","SD","SE",
    "SG","SI","SK","SO","SY","TH","TN","TR","UA","US","UZ","VE","VN","YE","ZA",
];

export const COUNTRY_NAMES = {
    en: {
        AE:"United Arab Emirates", AF:"Afghanistan", AL:"Albania", AM:"Armenia",
        AR:"Argentina", AT:"Austria", AU:"Australia", AZ:"Azerbaijan",
        BA:"Bosnia & Herzegovina", BD:"Bangladesh", BE:"Belgium", BG:"Bulgaria",
        BH:"Bahrain", BR:"Brazil", CA:"Canada", CH:"Switzerland",
        CL:"Chile", CN:"China", CO:"Colombia", CZ:"Czech Republic",
        DE:"Germany", DK:"Denmark", DZ:"Algeria", EC:"Ecuador",
        EE:"Estonia", EG:"Egypt", ES:"Spain", ET:"Ethiopia",
        FI:"Finland", FR:"France", GB:"United Kingdom", GE:"Georgia",
        GR:"Greece", HR:"Croatia", HU:"Hungary", ID:"Indonesia",
        IE:"Ireland", IL:"Israel", IN:"India", IQ:"Iraq",
        IR:"Iran", IS:"Iceland", IT:"Italy", JO:"Jordan",
        JP:"Japan", KE:"Kenya", KR:"South Korea", KW:"Kuwait",
        KZ:"Kazakhstan", LB:"Lebanon", LK:"Sri Lanka", LT:"Lithuania",
        LV:"Latvia", LY:"Libya", MA:"Morocco", MX:"Mexico",
        MY:"Malaysia", NG:"Nigeria", NL:"Netherlands", NO:"Norway",
        NZ:"New Zealand", OM:"Oman", PE:"Peru", PH:"Philippines",
        PK:"Pakistan", PL:"Poland", PS:"Palestine", PT:"Portugal",
        QA:"Qatar", RO:"Romania", RS:"Serbia", RU:"Russia",
        SA:"Saudi Arabia", SD:"Sudan", SE:"Sweden", SG:"Singapore",
        SI:"Slovenia", SK:"Slovakia", SO:"Somalia", SY:"Syria",
        TH:"Thailand", TN:"Tunisia", TR:"Turkey", UA:"Ukraine",
        US:"United States", UZ:"Uzbekistan", VE:"Venezuela", VN:"Vietnam",
        YE:"Yemen", ZA:"South Africa",
    },
    ar: {
        AE:"الإمارات", AF:"أفغانستان", AL:"ألبانيا", AM:"أرمينيا",
        AR:"الأرجنتين", AT:"النمسا", AU:"أستراليا", AZ:"أذربيجان",
        BA:"البوسنة والهرسك", BD:"بنغلاديش", BE:"بلجيكا", BG:"بلغاريا",
        BH:"البحرين", BR:"البرازيل", CA:"كندا", CH:"سويسرا",
        CL:"تشيلي", CN:"الصين", CO:"كولومبيا", CZ:"التشيك",
        DE:"ألمانيا", DK:"الدنمارك", DZ:"الجزائر", EC:"الإكوادور",
        EE:"إستونيا", EG:"مصر", ES:"إسبانيا", ET:"إثيوبيا",
        FI:"فنلندا", FR:"فرنسا", GB:"المملكة المتحدة", GE:"جورجيا",
        GR:"اليونان", HR:"كرواتيا", HU:"المجر", ID:"إندونيسيا",
        IE:"أيرلندا", IL:"إسرائيل", IN:"الهند", IQ:"العراق",
        IR:"إيران", IS:"آيسلندا", IT:"إيطاليا", JO:"الأردن",
        JP:"اليابان", KE:"كينيا", KR:"كوريا الجنوبية", KW:"الكويت",
        KZ:"كازاخستان", LB:"لبنان", LK:"سريلانكا", LT:"ليتوانيا",
        LV:"لاتفيا", LY:"ليبيا", MA:"المغرب", MX:"المكسيك",
        MY:"ماليزيا", NG:"نيجيريا", NL:"هولندا", NO:"النرويج",
        NZ:"نيوزيلندا", OM:"عُمان", PE:"بيرو", PH:"الفلبين",
        PK:"باكستان", PL:"بولندا", PS:"فلسطين", PT:"البرتغال",
        QA:"قطر", RO:"رومانيا", RS:"صربيا", RU:"روسيا",
        SA:"السعودية", SD:"السودان", SE:"السويد", SG:"سنغافورة",
        SI:"سلوفينيا", SK:"سلوفاكيا", SO:"الصومال", SY:"سوريا",
        TH:"تايلاند", TN:"تونس", TR:"تركيا", UA:"أوكرانيا",
        US:"الولايات المتحدة", UZ:"أوزبكستان", VE:"فنزويلا", VN:"فيتنام",
        YE:"اليمن", ZA:"جنوب أفريقيا",
    },
};

// ISO-2 → flag emoji (regional indicator pair).
export function flagEmoji(code) {
    if (!code || code.length !== 2) return "";
    const A = 0x1F1E6 - "A".charCodeAt(0);
    const c = code.toUpperCase();
    return String.fromCodePoint(A + c.charCodeAt(0)) +
           String.fromCodePoint(A + c.charCodeAt(1));
}

// Religion → emoji (matches Android religion drawables — each variant of
// Islam shares one icon, "other" variants share another).
export const RELIGION_EMOJI = {
    SUNNI_ISLAM: "☪️", SHIA_ISLAM: "☪️", ALAWISM: "☪️", ISMAILI: "☪️",
    CHRISTIANITY: "✝️", DRUZE: "⭐", JUDAISM: "✡️", YAZIDISM: "☀️",
    HINDUISM: "🕉️", BUDDHISM: "☸️", SIKHISM: "🪯", BAHAI: "⭐",
    NON_RELIGIOUS: "•", OTHER: "•",
};

// Janerek Profession enum (id-keyed). Stored on `users.profession_id`.
// "OTHER" reveals an extra free-text input → `users.profession`.
export const PROFESSIONS = [
    { id: 0, key: "STUDENT" },
    { id: 1, key: "DOCTOR" },
    { id: 2, key: "PHARMACIST" },
    { id: 3, key: "ENGINEER" },
    { id: 4, key: "TEACHER" },
    { id: 5, key: "NURSE" },
    { id: 6, key: "ACCOUNTANT" },
    { id: 7, key: "MARKETING_MANAGER" },
    { id: 8, key: "SALES_REPRESENTATIVE" },
    { id: 9, key: "ARTIST" },
    { id: 10, key: "CHEF" },
    { id: 11, key: "ECONOMIST" },
    { id: 12, key: "BUSINESS_OWNER" },
    { id: 13, key: "OTHER" },
];

export const PROFESSION_LABELS = {
    en: {
        STUDENT: "Student", DOCTOR: "Doctor", PHARMACIST: "Pharmacist",
        ENGINEER: "Engineer", TEACHER: "Teacher", NURSE: "Nurse",
        ACCOUNTANT: "Accountant", MARKETING_MANAGER: "Marketing Manager",
        SALES_REPRESENTATIVE: "Sales Representative", ARTIST: "Artist",
        CHEF: "Chef", ECONOMIST: "Economist", BUSINESS_OWNER: "Business Owner",
        OTHER: "Other",
    },
    ar: {
        STUDENT: "طالب", DOCTOR: "طبيب", PHARMACIST: "صيدلي",
        ENGINEER: "مهندس", TEACHER: "مدرس", NURSE: "ممرض",
        ACCOUNTANT: "محاسب", MARKETING_MANAGER: "مدير تسويق",
        SALES_REPRESENTATIVE: "مندوب مبيعات", ARTIST: "فنان",
        CHEF: "شيف", ECONOMIST: "خبير اقتصادي", BUSINESS_OWNER: "صاحب عمل",
        OTHER: "أخرى",
    },
};

// Janerek Education enum (id-keyed). Stored on `users.education_id`.
// Selecting any value reveals a free-text "specialization" input →
// `users.education_specialization`.
export const EDUCATIONS = [
    { id: 0, key: "HIGH_SCHOOL_OR_LESS" },
    { id: 1, key: "DIPLOMA" },
    { id: 2, key: "BACHELOR" },
    { id: 3, key: "MASTER" },
    { id: 4, key: "DOCTORATE" },
];

export const EDUCATION_LABELS = {
    en: {
        HIGH_SCHOOL_OR_LESS: "High school or less",
        DIPLOMA: "Diploma",
        BACHELOR: "Bachelor",
        MASTER: "Master",
        DOCTORATE: "Doctorate",
    },
    ar: {
        HIGH_SCHOOL_OR_LESS: "ثانوية عامة أو أقل",
        DIPLOMA: "دبلوم",
        BACHELOR: "بكالوريوس",
        MASTER: "ماجستير",
        DOCTORATE: "دكتوراه",
    },
};

export const LOOKING_FOR_LABELS = {
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

// Sort helper — emirati/saudi/egyptian first when AR; alphabetical
// otherwise. Mirrors Android's Country.orderedList behavior.
export function orderedCountries(lang) {
    const names = COUNTRY_NAMES[lang] || COUNTRY_NAMES.en;
    return COUNTRY_CODES.slice().sort((a, b) => {
        const an = names[a] || a;
        const bn = names[b] || b;
        return an.localeCompare(bn, lang);
    });
}

export function orderedLanguages(lang) {
    const labels = LANGUAGE_LABELS[lang] || LANGUAGE_LABELS.en;
    return LANGUAGES.slice().sort((a, b) => {
        if (a === "OTHER") return 1;
        if (b === "OTHER") return -1;
        return (labels[a] || a).localeCompare(labels[b] || b, lang);
    });
}
