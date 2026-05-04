// Janerek signup-funnel shared client.
// Loaded as ES module by every signup / onboarding page. Owns:
//   - Supabase client init (anon key fetched from /api/auth-config)
//   - i18n dictionary + data-i18n swap (mirrors main.js pattern but
//     scoped to signup-only strings)
//   - language toggle (cookie-aware so the Pages middleware sees it)
//   - cross-step state in sessionStorage so users can refresh / back
//     without losing progress
//   - small UI helpers (showError / showInfo / setLoading / require
//     session / route)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// ===== i18n =====
// Single dictionary object — every signup/onboarding page references
// these keys via data-i18n. Keep sorted by section.
export const I18N = {
    en: {
        app_name: "Janerek",

        // --- top nav / shell ---
        nav_back: "Back",
        nav_already_have_account: "Already have an account?",
        nav_open_app: "Open the app",
        nav_sign_in: "Sign in",

        // --- /signup chooser ---
        chooser_title: "Create your account",
        chooser_subtitle: "Find a marriage-minded partner who shares your values.",
        chooser_continue_google: "Continue with Google",
        chooser_continue_apple: "Continue with Apple",
        chooser_continue_facebook: "Continue with Facebook",
        chooser_or: "or",
        chooser_continue_email: "Continue with email",
        chooser_terms: "By continuing you agree to our",
        chooser_terms_link: "Terms",
        chooser_terms_and: "and",
        chooser_privacy_link: "Privacy Policy",

        // --- /signup/email ---
        email_title: "Continue with email",
        email_subtitle: "We'll send you a magic link — no password needed.",
        email_label_email: "Email",
        email_submit: "Send me a link",
        email_have_account: "Already have an account?",

        // --- /signup/email-sent ---
        email_sent_title: "Check your email",
        email_sent_subtitle: "We just sent a sign-in link to {email}. Tap it to continue.",
        email_sent_resend: "Resend link",
        email_sent_resend_wait: "Wait a few seconds before resending.",
        email_sent_resent: "Link sent again ✓",
        email_sent_change: "Use a different email",

        // --- /auth/callback ---
        callback_loading: "Signing you in…",
        callback_failed_title: "Sign-in failed",
        callback_failed_body: "Something went wrong while completing sign-in. Please try again.",
        callback_retry: "Back to sign-up",

        // --- shared onboarding ---
        ob_step_of: "Step {n} of {total}",
        ob_continue: "Next",
        ob_back: "Back",
        ob_skip: "Skip for now",
        ob_saving: "Saving…",
        ob_error_save: "Couldn't save. Please try again.",
        ob_error_session: "Your session expired. Please sign in again.",

        // --- Step 1: Main details (name + DOB + gender) ---
        // Mirrors fragment_profile_onboarding_main_details.xml
        main_title: "Let's Get Started",
        main_subtitle: "Great to have you on board! Let's start by getting to know you a bit better.",
        main_section_name: "What is your full name",
        main_name_placeholder: "Your name",
        main_section_dob: "Date of Birth",
        main_section_gender: "Gender",
        main_dob_day: "Day",
        main_dob_month: "Month",
        main_dob_year: "Year",
        main_gender_male: "Male",
        main_gender_female: "Female",
        main_err_name: "Please enter a valid name.",
        main_err_dob: "Please enter a valid date of birth.",
        main_err_gender: "Please select a gender.",
        main_err_dob_too_young: "You must be at least 18 years old to use our app.",

        // --- Step 2: Background (religion + nationality + languages) ---
        bg_title: "Your Background",
        bg_subtitle: "Let others know more about your cultural and linguistic background. This can help you find people with shared experiences.",
        bg_section_religion: "Religion",
        bg_section_nationality: "Nationality",
        bg_section_language: "Spoken Languages",
        bg_pick_nationality: "Select your nationality",
        bg_pick_languages: "Select your languages",
        bg_err_religion: "Please select a religion.",
        bg_err_nationality: "Please select a nationality.",
        bg_err_language: "Please select at least one language.",
        bg_lang_limit: "You can select up to 4 languages",
        bg_dialog_done: "Done",
        bg_dialog_cancel: "Cancel",
        bg_dialog_search: "Search",

        // --- Step 3: Story (profession + education + bio) ---
        story_title: "Your Story",
        story_subtitle: "Your profile is your first impression. Share a bit about yourself to attract like-minded individuals.",
        story_section_profession: "Your Profession",
        story_section_education: "Your Education",
        story_section_bio: "About You",
        story_pick_profession: "Tell us what you do",
        story_pick_education: "Select your education",
        story_profession_extra_label: "Tell us what you do",
        story_profession_extra_placeholder: "Tell us what you do for a living.",
        story_profession_student_label: "Tell us where you study",
        story_profession_student_placeholder: "University/School name",
        story_education_extra_label: "Tell us about your specialization",
        story_education_extra_placeholder: "Your specialization",
        story_bio_placeholder: "Tell us about yourself",
        story_err_profession: "Please select your profession.",
        story_err_education: "Please select your education",
        story_err_profession_invalid: "Please enter a valid profession",
        story_err_university_invalid: "Please enter a valid university/school name",
        story_err_bio_invalid: "Please write at least 8 words about yourself.",

        // --- Step 4: Photos ---
        photos_title: "Show Your Smile",
        photos_subtitle: "A picture is worth a thousand words. Upload at least two photos where you feel confident and authentic.",
        photos_err_min: "Please upload at least two photos that clearly show your face.",
        photos_err_duplicate: "You've already added this photo.",
        photos_uploading: "Uploading…",
        photos_menu_title: "Edit photo",
        photos_menu_replace: "Replace photo",
        photos_menu_delete: "Delete photo",

        // --- Step 5: Looking for ---
        lf_title: "What are you looking for?",
        lf_subtitle: "We want to understand what brings you here so we can match you with people who are on the same page.",
        lf_finding_love: "Finding a life partner",
        lf_figuring_out: "Still figuring out",
        lf_friends: "Meeting friends",
        lf_required: "Please tell us what you are looking for.",
        lf_finish: "Begin Your Journey",

        // --- Photo crop overlay ---
        photo_crop_title: "Position your photo",
        photo_crop_subtitle: "Drag and zoom to fit the frame.",
        photo_crop_save: "Use this photo",
        photo_crop_cancel: "Cancel",

        // --- Welcome ---
        welcome_title: "You're all set!",
        welcome_subtitle: "Download the Janerek app to start matching.",
        welcome_hint_mobile: "Tap to open the app — or download it if you don't have it yet.",
        welcome_hint_desktop: "Scan the QR with your phone, or pick your store below.",
        welcome_open_app: "Open the app",
        welcome_get_android: "Get it on Google Play",
        welcome_get_ios: "Download on the App Store",
    },
    ar: {
        app_name: "جانرك",

        nav_back: "رجوع",
        nav_already_have_account: "لديك حساب بالفعل؟",
        nav_open_app: "افتح التطبيق",
        nav_sign_in: "تسجيل الدخول",

        chooser_title: "أنشئ حسابك",
        chooser_subtitle: "ابحث عن شريك جاد للزواج يشاركك قيمك.",
        chooser_continue_google: "المتابعة باستخدام Google",
        chooser_continue_apple: "المتابعة باستخدام Apple",
        chooser_continue_facebook: "المتابعة باستخدام Facebook",
        chooser_or: "أو",
        chooser_continue_email: "المتابعة بالبريد الإلكتروني",
        chooser_terms: "بالاستمرار فإنك توافق على",
        chooser_terms_link: "الشروط",
        chooser_terms_and: "و",
        chooser_privacy_link: "سياسة الخصوصية",

        email_title: "المتابعة بالبريد الإلكتروني",
        email_subtitle: "سنرسل لك رابطًا سحريًا — لا حاجة لكلمة مرور.",
        email_label_email: "البريد الإلكتروني",
        email_submit: "أرسل لي الرابط",
        email_have_account: "لديك حساب بالفعل؟",

        email_sent_title: "تحقّق من بريدك",
        email_sent_subtitle: "أرسلنا رابط الدخول إلى {email}. اضغط عليه للمتابعة.",
        email_sent_resend: "إعادة إرسال الرابط",
        email_sent_resend_wait: "انتظر بضع ثوانٍ قبل إعادة الإرسال.",
        email_sent_resent: "تم إرسال الرابط ✓",
        email_sent_change: "استخدم بريدًا آخر",

        callback_loading: "جارٍ تسجيل الدخول…",
        callback_failed_title: "فشل تسجيل الدخول",
        callback_failed_body: "حدث خطأ أثناء إكمال تسجيل الدخول. يُرجى المحاولة مرة أخرى.",
        callback_retry: "العودة إلى التسجيل",

        ob_step_of: "الخطوة {n} من {total}",
        ob_continue: "التالي",
        ob_back: "رجوع",
        ob_skip: "تخطي الآن",
        ob_saving: "جارٍ الحفظ…",
        ob_error_save: "تعذّر الحفظ. حاول مرة أخرى.",
        ob_error_session: "انتهت صلاحية الجلسة. يُرجى تسجيل الدخول مجددًا.",

        // Step 1
        main_title: "لنبدأ",
        main_subtitle: "يسعدنا انضمامك إلينا! لنبدأ بالتعرف عليك بشكل أفضل قليلاً.",
        main_section_name: "ما هو اسمك الكامل",
        main_name_placeholder: "اسمك",
        main_section_dob: "تاريخ الميلاد",
        main_section_gender: "الجنس",
        main_dob_day: "اليوم",
        main_dob_month: "الشهر",
        main_dob_year: "السنة",
        main_gender_male: "ذكر",
        main_gender_female: "أنثى",
        main_err_name: "يرجى إدخال اسم صحيح.",
        main_err_dob: "يرجى إدخال تاريخ ميلاد صحيح.",
        main_err_gender: "يرجى تحديد الجنس.",
        main_err_dob_too_young: "يجب أن يكون عمرك 18 عامًا على الأقل لاستخدام تطبيقنا.",

        // Step 2
        bg_title: "خلفيتك",
        bg_subtitle: "دع الآخرين يعرفون المزيد عن خلفيتك الثقافية واللغوية. يمكن أن يساعدك هذا في العثور على أشخاص لديهم تجارب مشتركة.",
        bg_section_religion: "الديانة",
        bg_section_nationality: "الجنسية",
        bg_section_language: "اللغات المنطوقة",
        bg_pick_nationality: "اختر جنسيتك",
        bg_pick_languages: "اختر لغاتك",
        bg_err_religion: "يرجى تحديد دين.",
        bg_err_nationality: "يرجى تحديد جنسية.",
        bg_err_language: "يرجى تحديد لغة واحدة على الأقل.",
        bg_lang_limit: "يمكنك تحديد ما يصل إلى 4 لغات",
        bg_dialog_done: "تم",
        bg_dialog_cancel: "إلغاء",
        bg_dialog_search: "بحث",

        // Step 3
        story_title: "قصتك",
        story_subtitle: "ملفك الشخصي هو انطباعك الأول. شارك القليل عن نفسك لجذب الأفراد ذوي التفكير المماثل.",
        story_section_profession: "مهنتك",
        story_section_education: "تحصيلك العلمي",
        story_section_bio: "عنك",
        story_pick_profession: "اختر مهنتك",
        story_pick_education: "اختر تحصيلك العلمي",
        story_profession_extra_label: "أخبرنا ماذا تفعل",
        story_profession_extra_placeholder: "أخبرنا ما هي وظيفتك",
        story_profession_student_label: "أخبرنا أين تدرس",
        story_profession_student_placeholder: "اسم الجامعة / المدرسة",
        story_education_extra_label: "أخبرنا عن تخصصك",
        story_education_extra_placeholder: "تخصصك",
        story_bio_placeholder: "أخبرنا عن نفسك",
        story_err_profession: "الرجاء تحديد مهنتك.",
        story_err_education: "الرجاء تحديد تحصيلك العلمي",
        story_err_profession_invalid: "الرجاء إدخال مهنة صالحة",
        story_err_university_invalid: "الرجاء إدخال اسم جامعة / مدرسة صالح",
        story_err_bio_invalid: "يرجى كتابة 8 كلمات على الأقل عن نفسك.",

        // Step 4
        photos_title: "أظهر ابتسامتك",
        photos_subtitle: "الصورة تساوي ألف كلمة. قم بتحميل صورتين على الأقل تشعر فيهما بالثقة والأصالة.",
        photos_err_min: "الصور ضرورية لإجراء اتصالات على تطبيقنا. يرجى تحميل صورتين على الأقل تظهران وجهك بوضوح.",
        photos_err_duplicate: "لقد أضفت هذه الصورة بالفعل.",
        photos_uploading: "جارٍ الرفع…",
        photos_menu_title: "تعديل الصورة",
        photos_menu_replace: "استبدال الصورة",
        photos_menu_delete: "حذف الصورة",

        // Step 5
        lf_title: "ما الذي تبحث عنه؟",
        lf_subtitle: "نريد أن نفهم ما الذي أتى بك إلى هنا حتى نتمكن من مطابقتك مع الأشخاص الذين هم على نفس الصفحة.",
        lf_finding_love: "العثور على شريك حياة",
        lf_figuring_out: "لا زلت أكتشف",
        lf_friends: "مقابلة أصدقاء",
        lf_required: "من فضلك أخبرنا ما الذي تبحث عنه.",
        lf_finish: "ابدأ رحلتك",

        // Photo crop overlay
        photo_crop_title: "حدّد موضع الصورة",
        photo_crop_subtitle: "اسحب وكبّر لملء الإطار.",
        photo_crop_save: "استخدم هذه الصورة",
        photo_crop_cancel: "إلغاء",

        welcome_title: "تم التسجيل!",
        welcome_subtitle: "حمّل تطبيق جانرك لبدء التطابق.",
        welcome_hint_mobile: "اضغط لفتح التطبيق — أو حمّله إن لم يكن لديك.",
        welcome_hint_desktop: "امسح رمز QR بهاتفك، أو اختر متجرك بالأسفل.",
        welcome_open_app: "افتح التطبيق",
        welcome_get_android: "حمّل من Google Play",
        welcome_get_ios: "حمّل من App Store",
    },
};

// ===== Language =====
const LANG_COOKIE = "janerek-lang";

function readCookie(name) {
    const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name, value) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function currentLang() {
    const stored = localStorage.getItem(LANG_COOKIE);
    if (stored === "en" || stored === "ar") return stored;
    const fromHtml = document.documentElement.getAttribute("lang");
    if (fromHtml === "en" || fromHtml === "ar") return fromHtml;
    const fromCookie = readCookie(LANG_COOKIE);
    if (fromCookie === "en" || fromCookie === "ar") return fromCookie;
    return "ar";
}

export function t(key, params) {
    const lang = currentLang();
    let s = (I18N[lang] && I18N[lang][key]) || (I18N.en[key] || key);
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            s = s.replace(new RegExp(`{${k}}`, "g"), String(v));
        }
    }
    return s;
}

export function applyTranslations(root) {
    const scope = root || document;
    const els = scope.querySelectorAll("[data-i18n]");
    els.forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (!key) return;
        const params = {};
        // Allow per-element interpolation via data-i18n-* attributes.
        // (data-i18n-placeholder is its own thing — handled below.)
        Array.from(el.attributes).forEach((attr) => {
            if (
                attr.name.startsWith("data-i18n-") &&
                attr.name !== "data-i18n" &&
                attr.name !== "data-i18n-placeholder"
            ) {
                params[attr.name.slice("data-i18n-".length)] = attr.value;
            }
        });
        el.textContent = t(key, params);
    });
    // Placeholders
    scope.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (key) el.setAttribute("placeholder", t(key));
    });
}

export function setLanguage(lang) {
    if (lang !== "en" && lang !== "ar") return;
    localStorage.setItem(LANG_COOKIE, lang);
    writeCookie(LANG_COOKIE, lang);
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.body.classList.remove("lang-ar", "lang-en");
    document.body.classList.add(`lang-${lang}`);
    applyTranslations();
    // Active state on toggle
    document.querySelectorAll(".lang-option").forEach((opt) => {
        opt.classList.toggle("active", opt.getAttribute("data-lang") === lang);
    });
    document.title = lang === "ar" ? "جانرك — التسجيل" : "Janerek — Sign up";
    window.dispatchEvent(new CustomEvent("janerek-lang-changed", { detail: { lang } }));
}

export function mountLangToggle() {
    const toggle = document.getElementById("langToggle");
    if (!toggle) return;
    toggle.addEventListener("click", (e) => {
        const opt = e.target.closest(".lang-option");
        const lang = opt
            ? opt.getAttribute("data-lang")
            : currentLang() === "ar" ? "en" : "ar";
        if (lang && lang !== currentLang()) setLanguage(lang);
    });
}

// ===== Supabase =====
let _client = null;
let _configPromise = null;

async function fetchAuthConfig() {
    if (!_configPromise) {
        _configPromise = fetch("/api/auth-config").then(async (r) => {
            if (!r.ok) {
                throw new Error(`auth-config fetch failed (${r.status})`);
            }
            const cfg = await r.json();
            if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
                throw new Error(
                    "auth-config is empty — set SUPABASE_URL and " +
                    "SUPABASE_ANON_KEY in .dev.vars (local) or in the " +
                    "CF Pages project's environment variables (prod)."
                );
            }
            return cfg;
        });
    }
    return _configPromise;
}

export async function supabase() {
    if (_client) return _client;
    const cfg = await fetchAuthConfig();
    _client = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            // Implicit flow: magic-link emails redirect with the token in
            // the URL hash, so the session works even when the link is
            // opened in a different browser / in-app webview than the one
            // that submitted the form. PKCE would require the verifier to
            // be in the same browser's localStorage, which fails for
            // typical mobile mail-app → in-app-browser transitions.
            detectSessionInUrl: true,
            flowType: "implicit",
        },
    });
    return _client;
}

export async function getSession() {
    const sb = await supabase();
    const { data } = await sb.auth.getSession();
    return data.session;
}

// Used by every onboarding page — if no session, bounce to /signup.
export async function requireSession() {
    const session = await getSession();
    if (!session) {
        window.location.href = "/signup/";
        // Returning a Promise that never resolves keeps callers waiting
        // until the navigation actually happens.
        return new Promise(() => {});
    }
    return session;
}

// ===== Cross-step state =====
const STATE_KEY = "janerek-signup-state";

export function readState() {
    try {
        return JSON.parse(sessionStorage.getItem(STATE_KEY) || "{}");
    } catch {
        return {};
    }
}

export function writeState(patch) {
    const next = { ...readState(), ...patch };
    sessionStorage.setItem(STATE_KEY, JSON.stringify(next));
    return next;
}

export function clearState() {
    sessionStorage.removeItem(STATE_KEY);
}

// ===== Profile cache =====
// The full users row is fetched once (after auth callback / when
// nextOnboardingStep() runs) and cached in sessionStorage. Each
// onboarding page reads the cache synchronously to prefill the UI on
// the first paint — no DB roundtrip needed per step. Submit handlers
// keep the cache in sync via patchCachedProfile().
const PROFILE_CACHE_KEY = "janerek-profile";
// Columns onboarding cares about. Selecting a fixed list keeps the
// payload small and lets us cache as a flat object.
export const PROFILE_COLUMNS =
    "name, birthday, gender, religion, nationality, languages, " +
    "profession_id, profession, education_id, bio, " +
    "profile_photos, looking_for, is_profile_setup_complete";

export function getCachedProfile() {
    try {
        const raw = sessionStorage.getItem(PROFILE_CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function setCachedProfile(row) {
    try {
        if (row == null) {
            sessionStorage.removeItem(PROFILE_CACHE_KEY);
        } else {
            sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(row));
        }
    } catch { /* ignore quota / private mode */ }
}

export function patchCachedProfile(patch) {
    const next = { ...(getCachedProfile() || {}), ...patch };
    setCachedProfile(next);
    return next;
}

export function clearCachedProfile() {
    sessionStorage.removeItem(PROFILE_CACHE_KEY);
}

// Fetches the row from Supabase and writes it into the cache. Used by
// the auth callback and nextOnboardingStep() to warm the cache.
export async function fetchAndCacheProfile() {
    const sb = await supabase();
    const session = await getSession();
    if (!session) return null;
    const { data: row } = await sb
        .from("users")
        .select(PROFILE_COLUMNS)
        .eq("id", session.user.id)
        .maybeSingle();
    setCachedProfile(row || {});
    return row;
}

// ===== String validators (mirror Android StringUtils.kt) =====
// Bio is required ≥ 8 words after sanitization (trim, collapse
// whitespace, strip zero-width chars). Matches isValidBio() in
// productinfra/data/src/main/java/com/aboutyou/productinfra/data/utils/StringUtils.kt.

export function sanitizeBio(s) {
    return String(s ?? "")
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[​-‍﻿­]/g, "");
}

export function isValidBio(s) {
    const sanitized = sanitizeBio(s);
    if (!sanitized) return false;
    const words = sanitized.split(/\s+/).filter((w) => w.length > 0);
    return words.length >= 8;
}

// ===== UI helpers =====
export function showAlert(el, kind, message) {
    if (!el) return;
    el.className = `signup-alert ${kind}`;
    el.textContent = message;
    el.style.display = "block";
}

export function hideAlert(el) {
    if (!el) return;
    el.style.display = "none";
}

export function setLoading(btn, loading, idleHtml) {
    if (!btn) return;
    if (loading) {
        btn.dataset.idleHtml = btn.dataset.idleHtml || btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="signup-spinner"></span><span>${t("ob_saving")}</span>`;
    } else {
        btn.disabled = false;
        btn.innerHTML = idleHtml || btn.dataset.idleHtml || btn.innerHTML;
    }
}

// ===== Routing =====
// Mirrors the Android onboarding navigation graph (5 fragments):
//   1. main         — name + birthday + gender
//   2. background   — religion + nationality + languages
//   3. story        — bio
//   4. photos       — at least 2 photos
//   5. looking-for  — sets looking_for and flips is_profile_setup_complete
// Routing falls through the first incomplete step.
export async function nextOnboardingStep() {
    const sb = await supabase();
    const session = await getSession();
    if (!session) return "/signup/";
    const { data: row } = await sb
        .from("users")
        .select(PROFILE_COLUMNS)
        .eq("id", session.user.id)
        .maybeSingle();
    // Warm the cache so the destination page can render synchronously.
    setCachedProfile(row || {});
    // Trigger may still be lagging — treat as fresh.
    if (!row) return "/onboarding/main.html";
    if (row.is_profile_setup_complete) return "/welcome.html";
    if (!row.name || !row.birthday || !row.gender) return "/onboarding/main.html";
    const langs = Array.isArray(row.languages) ? row.languages : [];
    if (!row.religion || !row.nationality || langs.length === 0) {
        return "/onboarding/background.html";
    }
    if (row.profession_id == null || row.education_id == null || !isValidBio(row.bio)) {
        return "/onboarding/story.html";
    }
    const photos = Array.isArray(row.profile_photos) ? row.profile_photos : [];
    if (photos.length < 2) return "/onboarding/photos.html";
    if (row.looking_for == null) return "/onboarding/looking-for.html";
    return "/welcome.html";
}

// ===== Onboarding step indicator =====
// Renders the 5-segment indicator into a host element.
// Usage: <div class="page-step-indicator" data-step="2"></div>
export function mountStepIndicators(total) {
    const TOTAL = total || 5;
    document.querySelectorAll(".page-step-indicator").forEach((el) => {
        const current = parseInt(el.getAttribute("data-step") || "1", 10);
        let html = "";
        for (let i = 1; i <= TOTAL; i++) {
            const cls = i < current ? "step past" : i === current ? "step current" : "step";
            html += `<span class="${cls}"></span>`;
        }
        el.innerHTML = html;
    });
}

// ===== Bootstrap helper =====
// Pages call this once on DOMContentLoaded — it wires the language
// toggle, applies translations, and returns when the page is ready
// for page-specific code to run.
export function bootSignupPage(opts) {
    const lang = currentLang();
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.body.classList.add(`lang-${lang}`);
    applyTranslations();
    mountLangToggle();
    mountStepIndicators(5);
    // Active state on initial paint
    document.querySelectorAll(".lang-option").forEach((opt) => {
        opt.classList.toggle("active", opt.getAttribute("data-lang") === lang);
    });
    if (opts?.title) {
        document.title = opts.title[lang] || opts.title.en || document.title;
    }
}
