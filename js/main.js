// Janerek Landing Page — main.js

(function () {
    'use strict';

    // ——— Analytics: Plausible event tracker ———
    // No-op until the Plausible script loads (deferred). The queue is
    // primed via the inline shim in <head>, so calls before script-load
    // are buffered and replayed once it arrives.
    function track(event, props) {
        try {
            if (typeof window.plausible === 'function') {
                window.plausible(event, { props: props || {} });
            }
        } catch (_) { /* never break UX on a tracking failure */ }
    }

    // ——— Translations ———
    var translations = {
        ar: {
            app_name: 'جانرك',
            nav_features: 'المميزات',
            nav_how: 'كيف يعمل',
            nav_who: 'لمن جانرك',
            nav_cities: 'المدن',
            nav_screenshots: 'صور التطبيق',
            nav_faq: 'الأسئلة الشائعة',
            nav_download: 'حمّل التطبيق',
            nav_signup: 'سجّل الآن',
            nav_continue: 'أكمل ملفك الشخصي',
            nav_sign_out: 'تسجيل الخروج',
            hero_title: 'جانرك',
            hero_tagline: 'ابدأ قصة زواجك من هنا',
            hero_subtitle: 'تطبيق تعارف للزواج — ابحث عن شريك يناسب قيمك وثقافتك.',
            hero_cta: 'حمّل من Google Play',
            hero_cta_ios: 'حمّل من App Store',
            hero_cta_signup: 'أو ابدأ ملفك الشخصي على الويب',
            ios_dialog_title: 'قريباً على iPhone',
            ios_dialog_body: 'نعمل على نسخة iPhone من جانرك. التطبيق متاح الآن على Android — أو ابدأ ملفك الشخصي على الويب وانتقل بسلاسة عند إطلاق نسخة iPhone.',
            ios_dialog_android: 'حمّل لـ Android',
            ios_dialog_web: 'سجّل على الويب',
            hero_trust1: 'حسابات موثّقة',
            hero_trust2: 'خصوصية كاملة',
            hero_trust3: 'احترام من أول تواصل',
            scroll_text: 'استكشف المزيد',
            personas_eyebrow: 'لمن جانرك',
            personas_title: 'ثلاثة أصوات. نيّةٌ واحدة.',
            personas_subtitle: 'بدايات مختلفة، وجهة واحدة — شريك حياة يعرف ما يريد، تماماً مثلك.',
            persona1_voice: '"ليس لديّ وقت أضيّعه."',
            persona1_title: 'للجادّين فقط',
            persona1_desc: 'تجاوزتَ الألعاب والكيمياء قبل الجوهر. جانرك يضع بين يديك أشخاصاً يقصدون الزواج فعلاً، مع فلاتر عميقة تعنيها من الخطوة الأولى.',
            persona2_voice: '"العائلة تهمّني."',
            persona2_title: 'عندما تهمّ القيم',
            persona2_desc: 'الدين، الثقافة، أين ستربّون أطفالكم — ليست حدوداً، بل أساس. اختر ما لا يمكن أن تتنازل عنه، وستجد من يهتم بنفس الأشياء.',
            persona3_voice: '"أنا مستعدّ حين أكون مستعداً."',
            persona3_title: 'بدايةٌ ثانية',
            persona3_desc: 'سواء بدأت من الصفر أو عدت بعد فصل سابق — هذه ليست سباقاً. جانرك مساحة محترمة لتأخذ وقتك وتختار بحكمة.',
            features_eyebrow: 'المميزات',
            feat_pill_nationality: 'الجنسية',
            feat_pill_religion: 'الديانة',
            feat_pill_language: 'اللغة',
            feat_pill_education: 'المستوى التعليمي',
            feat_pill_profession: 'المهنة',
            feat_pill_location: 'الموقع',
            how_eyebrow: 'كيف يعمل',
            cities_eyebrow: 'جانرك حول العالم',
            cities_title: 'حيث يلتقي العالم العربي',
            cities_subtitle: 'مجتمع نشط في الوطن العربي والمهجر — الناس الذين يفهمونك ليسوا بعيدين.',
            cities_mena_title: 'العالم العربي',
            cities_mena1: 'الرياض · جدّة · الدمام',
            cities_mena2: 'دبي · أبوظبي',
            cities_mena3: 'القاهرة · الإسكندرية',
            cities_mena4: 'عمّان · الدوحة · الكويت',
            cities_mena5: 'الدار البيضاء · تونس · الجزائر',
            cities_mena6: 'بيروت · إسطنبول · بغداد',
            cities_diaspora_title: 'المهجر العربي',
            cities_diaspora1: 'لندن · مانشستر',
            cities_diaspora2: 'باريس · مرسيليا',
            cities_diaspora3: 'برلين · فرانكفورت',
            cities_diaspora4: 'تورنتو · مونتريال · أوتاوا',
            cities_diaspora5: 'ديترويت · شيكاغو · لوس أنجلوس',
            cities_diaspora6: 'سيدني · ملبورن',
            cities_note_title: 'في كل مكان آخر',
            cities_note_body: 'جانرك يخدم المجتمع العربي والإسلامي في كل قارة. سجّل اليوم وشاهد من حولك ممن يبحثون مثلك بجدية.',
            cities_note_cta: 'حمّل وابدأ البحث',
            trust_eyebrow: 'الثقة والأمان',
            trust_title: 'مساحة محترمة، آمنة، حقيقية',
            trust1_title: 'أشخاص حقيقيون',
            trust1_desc: 'كل عضو يكمل التحقق بصورة سيلفي قبل التفاعل الكامل. الحسابات الوهمية تُحذف خلال ساعات، لا أيام.',
            trust2_title: 'خصوصية مطلقة',
            trust2_desc: 'لا ربط بحساباتك على وسائل التواصل. ملفك غير قابل للظهور في محركات البحث. تتحكم أنت بمن يرى ماذا.',
            trust3_title: 'معايير المجتمع',
            trust3_desc: 'سياسة عدم تسامح مطلق مع التحرش. الإبلاغ بنقرة واحدة، ويقرأ كل بلاغ فريق بشري — لا ذكاء اصطناعي.',
            trust4_title: 'دعم من أشخاص حقيقيين',
            trust4_desc: 'تواصل مع شخص حقيقي على info@janerek.com. نرد خلال ساعات في أيام العمل، ليس بعد أسابيع.',
            newsletter_eyebrow: 'ابق على تواصل',
            newsletter_title: 'نصائح للعثور على الشخص المناسب',
            newsletter_subtitle: 'رسالة شهرية واحدة: نصائح لكتابة ملف شخصي يلفت الانتباه، أفكار لمحادثات جادة، وقصص نجاح من المجتمع. بدون إزعاج. ألغ الاشتراك متى شئت.',
            newsletter_placeholder: 'بريدك الإلكتروني',
            newsletter_cta: 'اشترك',
            newsletter_hint: 'رسالة واحدة شهرياً. لن نشارك بريدك مع أحد.',
            newsletter_success: 'شكراً! تم تسجيلك. ابحث عن أول رسالة في بريدك خلال أيام قليلة.',
            newsletter_error_email: 'هذا لا يبدو بريداً صحيحاً.',
            newsletter_error_generic: 'حدث خطأ ما. حاول مرة أخرى بعد قليل.',
            band_title: 'لست مستعدًا للتحميل؟',
            band_subtitle: 'أنشئ ملفك الشخصي على الويب في دقيقتين، ثم حمّل التطبيق وتابع من حيث توقفت.',
            band_cta: 'سجّل مجانًا',
            features_title: 'ما الذي يميز جانِرك؟',
            features_subtitle: 'تطبيق مصمم للباحثين عن شريك حياة — وليس مجرد تمرير عشوائي.',
            feature1_title: 'نية واضحة للزواج',
            feature1_desc: 'كل شخص هنا هدفه واحد: بناء أسرة. بدون ألعاب، بدون إضاعة وقت — جدية من البداية.',
            feature2_title: 'توافق ثقافي حقيقي',
            feature2_desc: 'إمكانية البحث حسب الجنسية، الدين، اللغة، والموقع. لأن شريك الحياة يجب أن يفهم عالمك — عاداتك، قيمك، وطموحاتك.',
            feature3_title: 'حسابات موثّقة وآمنة',
            feature3_desc: 'أشخاص حقيقيون. ملفات موثّقة. بيئة آمنة يمكنك الوثوق بها.',
            feature4_title: 'احترام من أول تواصل',
            feature4_desc: 'مصمم لمجتمعات تقدّر العائلة والالتزام. كل تفاعل يبدأ باحترام ووضوح.',
            feature5_title: 'فلاتر ذكية ودقيقة',
            feature5_desc: 'وقتك ثمين. فلاترنا تساعدك في العثور على الشخص المناسب بسرعة — دون إضاعة الوقت مع من لا يناسبك.',
            feature6_title: 'تجربة عصرية بقيم أصيلة',
            feature6_desc: 'تصميم حديث يناسب جيل اليوم، دون التنازل عن القيم والتقاليد.',
            how_title: 'كيف يعمل؟',
            how_subtitle: 'ثلاث خطوات بسيطة للعثور على شريكك.',
            step1_title: 'أنشئ ملفك الشخصي',
            step1_desc: 'شارك جنسيتك، ديانتك، مهنتك، واهتماماتك. كلما شاركت أكثر، كانت نتائجك أفضل.',
            step2_title: 'اكتشف وتطابق',
            step2_desc: 'تصفح ملفات شخصية مُصفّاة حسب تفضيلاتك. أعجبك شخص؟ اسحب لليمين.',
            step3_title: 'تواصل',
            step3_desc: 'عندما يكون الإعجاب متبادلاً، ابدأ المحادثة. خطط للقاء وتعرّف على شريكك المحتمل.',
            screenshots_title: 'شاهد التطبيق',
            screenshots_subtitle: 'نظرة على تجربة جانرك.',
            testimonials_title: 'ماذا يقول المستخدمون',
            testimonial1_text: '"أخيراً تطبيق يفهم احتياجاتي. الفلاتر ممتازة وساعدتني ألاقي أشخاص يشاركوني نفس القيم والثقافة."',
            testimonial1_name: 'نور م.',
            testimonial1_meta: 'عضو منذ 2026',
            testimonial2_text: '"التطبيق سهل الاستخدام ويركز على العلاقات الجادة. وجدت شريكة حياتي من خلاله وأنا ممتن جداً."',
            testimonial2_name: 'عمر ك.',
            testimonial2_meta: 'عضو منذ 2026',
            testimonial3_text: '"أحب إمكانية البحث حسب الجنسية والديانة. هذا يوفر الكثير من الوقت ويساعد في إيجاد شخص متوافق فعلاً."',
            testimonial3_name: 'لينا ر.',
            testimonial3_meta: 'عضو منذ 2026',
            faq_title: 'الأسئلة الشائعة',
            faq1_q: 'ما هو جانرك؟',
            faq1_a: 'جانرك هو تطبيق مواعدة مصمم للأشخاص الباحثين عن شريك حياة. يتيح لك التعبير عن هويتك وثقافتك والتواصل مع أشخاص يشاركونك نفس القيم.',
            faq2_q: 'هل جانرك مجاني؟',
            faq2_a: 'نعم! جانرك مجاني للتحميل والاستخدام. يمكنك إنشاء ملفك الشخصي، التصفح، الإعجاب، والمحادثة مجاناً. نقدم أيضاً اشتراكاً مميزاً يفتح مزايا إضافية.',
            faq3_q: 'كيف يعمل التطابق؟',
            faq3_a: 'تصفح الملفات الشخصية المُصفّاة حسب تفضيلاتك. اسحب لليمين إذا أعجبك شخص. إذا أعجبت به أنت أيضاً، يحدث تطابق ويمكنكما بدء المحادثة!',
            faq4_q: 'هل معلوماتي آمنة؟',
            faq4_a: 'بالتأكيد. خصوصيتك أولويتنا القصوى. ملفك الشخصي مرئي فقط لأعضاء جانرك الآخرين. لا نشارك بياناتك مع أطراف ثالثة أبداً، ولديك تحكم كامل فيما تشاركه.',
            faq5_q: 'ما الذي يميز جانرك عن التطبيقات الأخرى؟',
            faq5_a: 'جانرك مصمم خصيصاً للباحثين عن علاقة جادة. نقدم فلاتر حسب الجنسية، الديانة، اللغة، المهنة، والمستوى التعليمي — مما يساعدك في إيجاد شخص متوافق حقاً.',
            faq6_q: 'كيف أحذف حسابي؟',
            faq6_a: 'يمكنك حذف حسابك في أي وقت من صفحة الإعدادات داخل التطبيق. اذهب إلى الإعدادات > الحساب > حذف الحساب. سيتم حذف جميع بياناتك نهائياً من خوادمنا.',
            download_title: 'شريك حياتك قد يكون هنا',
            download_subtitle: 'حمّل جانِرك وابدأ رحلتك بجدية.',
            download_btn: 'حمّل جانرك',
            footer_company: 'الشركة',
            footer_privacy: 'سياسة الخصوصية',
            footer_terms: 'شروط الاستخدام',
            footer_child_safety: 'حماية الأطفال',
            footer_contact: 'تواصل معنا',
            footer_copy: '\u00A9 2026 جانرك. جميع الحقوق محفوظة.'
        },
        en: {
            app_name: 'Janerek',
            nav_features: 'Features',
            nav_how: 'How It Works',
            nav_who: "Who it's for",
            nav_cities: 'Cities',
            nav_screenshots: 'Screenshots',
            nav_faq: 'FAQ',
            nav_download: 'Download',
            nav_signup: 'Sign up',
            nav_continue: 'Complete your profile',
            nav_sign_out: 'Sign out',
            hero_title: 'Janerek',
            hero_tagline: 'Dating for Marriage',
            hero_subtitle: 'Marriage-first dating. Find your future spouse based on values and culture.',
            hero_cta: 'Get it on Google Play',
            hero_cta_ios: 'Download on the App Store',
            hero_cta_signup: 'Or start your profile on the web',
            ios_dialog_title: 'Coming soon to iPhone',
            ios_dialog_body: "We're building the iPhone version of Janerek. It's live on Android right now — or start your profile on the web and pick up seamlessly when iPhone launches.",
            ios_dialog_android: 'Download for Android',
            ios_dialog_web: 'Sign up on the web',
            hero_trust1: 'Verified profiles',
            hero_trust2: 'Complete privacy',
            hero_trust3: 'Respect from message one',
            scroll_text: 'Scroll to explore',
            personas_eyebrow: "Who Janerek is for",
            personas_title: 'Three voices. One intent.',
            personas_subtitle: 'Different starting points, same destination — a partner who knows what they want, just like you do.',
            persona1_voice: '"I\'m not here to waste time."',
            persona1_title: 'Only the serious',
            persona1_desc: "You're past the games. Past chemistry-before-substance. Janerek puts marriage-minded people in front of you, with depth filters that mean it from the very first message.",
            persona2_voice: '"Family matters to me."',
            persona2_title: 'When values matter',
            persona2_desc: "Faith, culture, where you'll raise children — these aren't dealbreakers, they're the foundation. Filter for what counts, and find someone who already cares about the same things.",
            persona3_voice: '"I\'m ready when I\'m ready."',
            persona3_title: 'A second beginning',
            persona3_desc: "Whether you're starting fresh or starting again — this isn't a sprint. Janerek is a calm, respectful space to take your time and get it right.",
            features_eyebrow: 'Features',
            feat_pill_nationality: 'Nationality',
            feat_pill_religion: 'Religion',
            feat_pill_language: 'Language',
            feat_pill_education: 'Education',
            feat_pill_profession: 'Profession',
            feat_pill_location: 'Location',
            how_eyebrow: 'How it works',
            cities_eyebrow: 'Janerek around the world',
            cities_title: 'An international community',
            cities_subtitle: "An active community across continents — the people who share your values are closer than you think.",
            cities_mena_title: 'Middle East & North Africa',
            cities_mena1: 'Riyadh · Jeddah · Dammam',
            cities_mena2: 'Dubai · Abu Dhabi',
            cities_mena3: 'Cairo · Alexandria',
            cities_mena4: 'Amman · Doha · Kuwait City',
            cities_mena5: 'Casablanca · Tunis · Algiers',
            cities_mena6: 'Beirut · Istanbul · Baghdad',
            cities_diaspora_title: 'Around the globe',
            cities_diaspora1: 'London · Manchester',
            cities_diaspora2: 'Paris · Marseille',
            cities_diaspora3: 'Berlin · Frankfurt',
            cities_diaspora4: 'Toronto · Montreal · Ottawa',
            cities_diaspora5: 'Detroit · Chicago · Los Angeles',
            cities_diaspora6: 'Sydney · Melbourne',
            cities_note_title: 'Everywhere else',
            cities_note_body: 'Janerek serves serious singles on every continent. Sign up today and see who around you is searching with the same intent.',
            cities_note_cta: 'Download and start searching',
            trust_eyebrow: 'Trust & safety',
            trust_title: 'A respectful, safe, real space',
            trust1_title: 'Real people only',
            trust1_desc: 'Every member completes a selfie verification before fully interacting. Fake accounts are removed within hours, not days.',
            trust2_title: 'Absolute privacy',
            trust2_desc: "No social-media linking. Your profile doesn't appear in search engines. You decide who sees what.",
            trust3_title: 'Community standards',
            trust3_desc: 'Zero-tolerance harassment policy. Reporting is one tap — and a human team reads every report, not an AI.',
            trust4_title: 'Real human support',
            trust4_desc: 'Reach a real person at info@janerek.com. We respond in hours on working days, not weeks.',
            newsletter_eyebrow: 'Stay in touch',
            newsletter_title: 'Tips for finding the right one',
            newsletter_subtitle: "One email a month: tips for writing a compelling profile, ideas for meaningful conversations, and success stories from the community. No spam. Unsubscribe any time.",
            newsletter_placeholder: 'Your email address',
            newsletter_cta: 'Subscribe',
            newsletter_hint: "One email a month. We won't share your address with anyone.",
            newsletter_success: "Thank you — you're on the list. Look for our first email in your inbox within a few days.",
            newsletter_error_email: "That doesn't look like a valid email.",
            newsletter_error_generic: 'Something went wrong. Try again in a moment.',
            band_title: 'Not ready to download yet?',
            band_subtitle: 'Create your profile online in two minutes — install the app whenever you\'re ready and pick up right where you left off.',
            band_cta: 'Sign up free',
            features_title: 'Why Janerek?',
            features_subtitle: 'A dating app built for marriage, not just swiping.',
            feature1_title: 'Designed for Marriage',
            feature1_desc: 'Everyone on Janerek is here for the same reason: to find a life partner. No hookups. No games. Only serious individuals ready to build a future.',
            feature2_title: 'Culture & Compatibility First',
            feature2_desc: 'Filter by nationality, religion, language, and location to meet someone who truly understands your world — your traditions, your values, your vision.',
            feature3_title: 'Verified & Secure',
            feature3_desc: 'Real people. Verified profiles. A safe environment where serious intentions come first.',
            feature4_title: 'Family-Oriented & Respectful',
            feature4_desc: 'Designed for communities where family, respect, and long-term commitment matter. Every interaction starts with dignity and clarity.',
            feature5_title: 'Smart, Meaningful Matching',
            feature5_desc: 'Powerful filters help you focus on what truly matters — so you spend less time searching and more time connecting.',
            feature6_title: 'Modern Experience, Traditional Values',
            feature6_desc: 'A clean, youthful app experience built for today\'s generation — without compromising on cultural roots and principles.',
            how_title: 'How It Works',
            how_subtitle: 'Three simple steps to finding your match.',
            step1_title: 'Create Your Profile',
            step1_desc: 'Share your nationality, religion, profession, and interests. The more you share, the better your results.',
            step2_title: 'Discover & Match',
            step2_desc: 'Browse profiles filtered to your preferences. Like someone? Swipe right.',
            step3_title: 'Connect',
            step3_desc: 'When the feeling is mutual, start chatting. Plan a meeting and get to know your potential partner.',
            screenshots_title: 'See It In Action',
            screenshots_subtitle: 'A glimpse of the Janerek experience.',
            testimonials_title: 'What People Are Saying',
            testimonial1_text: '"Finally an app that understands my needs. The filters are excellent and helped me find people who share my values and culture."',
            testimonial1_name: 'Nour M.',
            testimonial1_meta: 'Member since 2026',
            testimonial2_text: '"The app is easy to use and focuses on serious relationships. I found my life partner through it and I\'m very grateful."',
            testimonial2_name: 'Omar K.',
            testimonial2_meta: 'Member since 2026',
            testimonial3_text: '"I love being able to search by nationality and religion. It saves so much time and helps find someone truly compatible."',
            testimonial3_name: 'Lina R.',
            testimonial3_meta: 'Member since 2026',
            faq_title: 'Frequently Asked Questions',
            faq1_q: 'What is Janerek?',
            faq1_a: 'Janerek is a dating app designed for people looking for a life partner. It allows you to express your identity and culture and connect with people who share your values.',
            faq2_q: 'Is Janerek free?',
            faq2_a: 'Yes! Janerek is free to download and use. You can create a profile, browse, like, and chat for free. We also offer a premium subscription that unlocks additional features.',
            faq3_q: 'How does matching work?',
            faq3_a: 'Browse profiles filtered to your preferences. Swipe right if you like someone. If they like you back, it\'s a match and you can start chatting!',
            faq4_q: 'Is my information safe?',
            faq4_a: 'Absolutely. Your privacy is our top priority. Your profile is only visible to other Janerek members. We never share your data with third parties, and you have full control over what you share.',
            faq5_q: 'What makes Janerek different from other apps?',
            faq5_a: 'Janerek is designed specifically for those seeking a serious relationship. We offer filters by nationality, religion, language, profession, and education level — helping you find someone truly compatible.',
            faq6_q: 'How do I delete my account?',
            faq6_a: 'You can delete your account at any time from the Settings page within the app. Go to Settings > Account > Delete Account. All your data will be permanently removed from our servers.',
            download_title: 'Your future spouse might already be here.',
            download_subtitle: 'Download Janerek today and start your journey with purpose.',
            download_btn: 'Download Janerek',
            footer_company: 'Company',
            footer_privacy: 'Privacy Policy',
            footer_terms: 'Terms of Service',
            footer_child_safety: 'Child Safety',
            footer_contact: 'Contact Us',
            footer_copy: '\u00A9 2026 Janerek. All rights reserved.'
        }
    };

    // ——— Language Switcher ———
    // Initial language priority:
    //   1. localStorage (explicit user choice from a prior visit)
    //   2. <html lang> set by the Pages middleware (cookie / Accept-Language)
    //   3. fallback 'ar'
    var htmlLang = document.documentElement.getAttribute('lang');
    var currentLang =
        localStorage.getItem('janerek-lang') ||
        (htmlLang === 'en' || htmlLang === 'ar' ? htmlLang : null) ||
        'ar';

    function switchLanguage(lang) {
        var previous = currentLang;
        currentLang = lang;
        localStorage.setItem('janerek-lang', lang);
        if (previous && previous !== lang) {
            track('LangSwitch', { from: previous, to: lang });
        }
        // Swap locale-tagged marketing imagery (persona photos) — mirrors
        // the existing screenshot-localization swap below.
        document.querySelectorAll('[data-marketing]').forEach(function (img) {
            img.removeAttribute('loading');
            img.src = '/assets/images/marketing/' + lang + '/' + img.dataset.marketing;
        });
        // Mirror to a cookie so server-rendered pages (the share-profile
        // route, future SSR) see the same language without an extra round
        // trip. 1-year max-age, lax same-site.
        document.cookie = 'janerek-lang=' + lang + '; path=/; max-age=' + (60 * 60 * 24 * 365) + '; samesite=lax';

        var html = document.documentElement;
        html.setAttribute('lang', lang);
        html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

        document.body.classList.remove('lang-ar', 'lang-en');
        document.body.classList.add('lang-' + lang);

        // Update all translatable elements
        var elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        // And translatable placeholders (e.g., the newsletter input)
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang] && translations[lang][key]) {
                el.setAttribute('placeholder', translations[lang][key]);
            }
        });

        // Update testimonial avatars
        var avatars = document.querySelectorAll('.testimonial-avatar');
        if (lang === 'ar') {
            if (avatars[0]) avatars[0].textContent = 'ن';
            if (avatars[1]) avatars[1].textContent = 'ع';
            if (avatars[2]) avatars[2].textContent = 'ل';
        } else {
            if (avatars[0]) avatars[0].textContent = 'N';
            if (avatars[1]) avatars[1].textContent = 'O';
            if (avatars[2]) avatars[2].textContent = 'L';
        }

        // Update active state on toggle
        document.querySelectorAll('.lang-option').forEach(function (opt) {
            opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
        });

        // Update page title
        if (lang === 'ar') {
            document.title = 'جانرك - شريك حياة يناسب قيمك وحياتك';
        } else {
            document.title = 'Janerek - The Right Place to Meet the Right Match';
        }

        // Swap screenshot images to match selected language
        document.querySelectorAll('[data-screenshot]').forEach(function(img) {
            img.removeAttribute('loading');
            img.src = 'assets/screenshots/' + lang + '/' + img.dataset.screenshot;
        });

        // Notify parallax scroll about direction change
        window.dispatchEvent(new Event('langChanged'));
    }

    // Language toggle click
    var langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', function (e) {
            var target = e.target.closest('.lang-option');
            if (target) {
                var lang = target.getAttribute('data-lang');
                if (lang && lang !== currentLang) {
                    switchLanguage(lang);
                }
            } else {
                // Toggle between languages on button click
                switchLanguage(currentLang === 'ar' ? 'en' : 'ar');
            }
        });
    }

    // Initialize language
    switchLanguage(currentLang);

    // ——— Session-aware CTAs ———
    // The home page is a static asset, but Supabase persists its session
    // in localStorage under `sb-{project-ref}-auth-token`. Peek at that
    // (no need to load supabase-js here) so the nav CTA can say
    // "Continue" instead of "Sign up" when the visitor is already signed
    // in, and we can offer a "Sign out" affordance to clear stale state.
    function hasActiveSupabaseSession() {
        try {
            for (var i = 0; i < localStorage.length; i++) {
                var k = localStorage.key(i);
                if (!k || !/^sb-.*-auth-token$/.test(k)) continue;
                var raw = localStorage.getItem(k);
                if (!raw) continue;
                var s = JSON.parse(raw);
                // Supabase wraps payloads either as { currentSession: {...} }
                // (older SDK) or directly as the session object (newer).
                var sess = (s && s.currentSession) || s;
                var exp = sess && sess.expires_at;
                if (typeof exp !== 'number') continue;
                if (exp * 1000 > Date.now()) return true;
            }
        } catch (_) { /* ignore parse / quota errors */ }
        return false;
    }

    function clearSupabaseSession() {
        try {
            var keys = [];
            for (var i = 0; i < localStorage.length; i++) {
                var k = localStorage.key(i);
                if (k && /^sb-.*-auth-token$/.test(k)) keys.push(k);
            }
            keys.forEach(function (k) { localStorage.removeItem(k); });
            sessionStorage.removeItem('janerek-profile');
            sessionStorage.removeItem('janerek-signup-state');
        } catch (_) { /* ignore */ }
    }

    function applySessionAwareCtas() {
        var loggedIn = hasActiveSupabaseSession();
        // Nav CTA: "Sign up" → "Continue"
        document.querySelectorAll('.nav-cta[href="/signup/"]').forEach(function (el) {
            el.setAttribute('data-i18n', loggedIn ? 'nav_continue' : 'nav_signup');
        });
        // Big band CTA mid-page
        document.querySelectorAll('.signup-band-cta [data-i18n="band_cta"]').forEach(function (el) {
            el.setAttribute('data-i18n', loggedIn ? 'nav_continue' : 'band_cta');
        });
        // Inject / remove a Sign out link next to the nav CTA.
        var navList = document.getElementById('navLinks');
        var existing = document.getElementById('navSignOut');
        if (loggedIn && navList && !existing) {
            var li = document.createElement('li');
            li.id = 'navSignOut';
            var a = document.createElement('a');
            a.href = '#';
            a.setAttribute('data-i18n', 'nav_sign_out');
            a.textContent = translations[currentLang].nav_sign_out;
            a.style.opacity = '0.75';
            a.addEventListener('click', function (e) {
                e.preventDefault();
                clearSupabaseSession();
                window.location.reload();
            });
            li.appendChild(a);
            // Insert after the CTA <li>.
            var ctaLi = navList.querySelector('.nav-cta');
            if (ctaLi && ctaLi.parentNode) {
                navList.insertBefore(li, ctaLi.parentNode.nextSibling);
            } else {
                navList.appendChild(li);
            }
        } else if (!loggedIn && existing) {
            existing.remove();
        }
        // Re-run translation so the swapped data-i18n keys take effect.
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (translations[currentLang] && translations[currentLang][key]) {
                el.textContent = translations[currentLang][key];
            }
        });
    }

    applySessionAwareCtas();
    // Re-evaluate when the user toggles language (so the new sign-out
    // link gets translated) or when they come back to the tab.
    window.addEventListener('langChanged', applySessionAwareCtas);
    window.addEventListener('focus', applySessionAwareCtas);

    // ——— Mobile Navigation Toggle ———
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');
    var navbar = document.getElementById('navbar');

    navToggle.addEventListener('click', function () {
        navLinks.classList.toggle('open');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navLinks.classList.remove('open');
            navToggle.classList.remove('active');
        });
    });

    // Close mobile menu when tapping outside
    function closeMenuOutside(e) {
        if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !navToggle.contains(e.target)) {
            navLinks.classList.remove('open');
            navToggle.classList.remove('active');
        }
    }
    document.addEventListener('click', closeMenuOutside);
    document.addEventListener('touchstart', closeMenuOutside);

    // ——— Navbar scroll background ———
    function updateNavbar() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    // ——— Smooth scrolling for anchor links ———
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            var navHeight = navbar.offsetHeight;
            var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });

    // ——— Scroll-triggered fade-in animations ———
    var fadeElements = document.querySelectorAll('.fade-in');

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        fadeElements.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        fadeElements.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    // ——— FAQ Accordion ———
    document.querySelectorAll('.faq-question').forEach(function (button) {
        button.addEventListener('click', function () {
            var faqItem = this.parentElement;
            var isOpen = faqItem.classList.contains('open');

            document.querySelectorAll('.faq-item.open').forEach(function (item) {
                item.classList.remove('open');
            });

            if (!isOpen) {
                faqItem.classList.add('open');
            }
        });
    });

    // ——— Screenshots carousel: arrows + drag + scroll hint ———
    var carousel = document.querySelector('.screenshots-carousel');
    if (carousel) {
        // Always reset scroll to start (left side) since carousel is forced LTR
        carousel.scrollLeft = 0;
        window.addEventListener('langChanged', function () {
            carousel.scrollLeft = 0;
        });

        var leftBtn = document.querySelector('.carousel-arrow-left');
        var rightBtn = document.querySelector('.carousel-arrow-right');
        var scrollStep = 300;

        // Arrow clicks (carousel is always LTR)
        if (leftBtn) {
            leftBtn.addEventListener('click', function () {
                carousel.scrollBy({ left: -scrollStep, behavior: 'smooth' });
            });
        }
        if (rightBtn) {
            rightBtn.addEventListener('click', function () {
                carousel.scrollBy({ left: scrollStep, behavior: 'smooth' });
            });
        }

        // Arrow visibility
        function updateArrows() {
            if (!leftBtn || !rightBtn) return;
            var sl = carousel.scrollLeft;
            var max = carousel.scrollWidth - carousel.clientWidth;
            leftBtn.classList.toggle('hidden', sl <= 10);
            rightBtn.classList.toggle('hidden', sl >= max - 10);
        }
        carousel.addEventListener('scroll', updateArrows);
        setTimeout(updateArrows, 100);

        // Drag to scroll
        var isDown = false, startX, scrollLeftPos;
        carousel.addEventListener('mousedown', function (e) {
            isDown = true;
            carousel.style.scrollSnapType = 'none';
            startX = e.pageX - carousel.offsetLeft;
            scrollLeftPos = carousel.scrollLeft;
        });
        carousel.addEventListener('mouseleave', function () {
            isDown = false;
            carousel.style.scrollSnapType = '';
        });
        carousel.addEventListener('mouseup', function () {
            isDown = false;
            carousel.style.scrollSnapType = '';
        });
        carousel.addEventListener('mousemove', function (e) {
            if (!isDown) return;
            e.preventDefault();
            var x = e.pageX - carousel.offsetLeft;
            carousel.scrollLeft = scrollLeftPos - (x - startX) * 1.5;
        });

        // One-time scroll hint when section enters viewport
        var hintDone = false;
        var screenshotsSection = document.getElementById('screenshots');
        if (screenshotsSection) {
            var hintObserver = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting && !hintDone) {
                    hintDone = true;
                    hintObserver.disconnect();
                    setTimeout(function () {
                        carousel.scrollBy({ left: 250, behavior: 'smooth' });
                        setTimeout(function () {
                            carousel.scrollBy({ left: -250, behavior: 'smooth' });
                        }, 500);
                    }, 300);
                }
            }, { threshold: 0.3 });
            hintObserver.observe(screenshotsSection);
        }
    }

    // ——— iOS coming-soon dialog ———
    // The iOS button is gated until App Store launch. Click → log event,
    // open a friendly modal pointing the visitor to Android + web signup.
    var iosDialog = document.getElementById('iosDialog');
    var iosBtn = document.getElementById('iosCta');

    function openDialog() {
        if (!iosDialog) return;
        iosDialog.removeAttribute('hidden');
        document.body.classList.add('has-dialog');
        // Move focus to the close button for keyboard users.
        var closeBtn = iosDialog.querySelector('.dialog__close');
        if (closeBtn) closeBtn.focus();
    }
    function closeDialog() {
        if (!iosDialog) return;
        iosDialog.setAttribute('hidden', '');
        document.body.classList.remove('has-dialog');
        if (iosBtn) iosBtn.focus();
    }

    if (iosBtn) {
        iosBtn.addEventListener('click', function (e) {
            e.preventDefault();
            track('AppStoreClick', { comingSoon: true, locale: currentLang });
            openDialog();
        });
    }
    if (iosDialog) {
        iosDialog.querySelectorAll('[data-dialog-close]').forEach(function (el) {
            el.addEventListener('click', closeDialog);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !iosDialog.hasAttribute('hidden')) {
                closeDialog();
            }
        });
    }

    // ——— CTA click tracking ———
    // Wired via data attributes so we can add new CTAs without touching JS.
    document.querySelectorAll('[data-store="play"]').forEach(function (el) {
        el.addEventListener('click', function () {
            track('PlayStoreClick', { locale: currentLang, location: el.closest('section')?.id || el.closest('.dialog') ? 'dialog' : 'unknown' });
        });
    });
    document.querySelectorAll('[data-cta="websignup"]').forEach(function (el) {
        el.addEventListener('click', function () {
            track('WebSignupClick', { locale: currentLang, location: el.closest('section')?.id || el.closest('.dialog') ? 'dialog' : 'unknown' });
        });
    });

    // ——— Newsletter form ———
    // Subscribes the visitor to monthly tips. Posts to /api/newsletter
    // (Cloudflare Function → Supabase). Honeypot field for bot
    // protection; duplicate emails coalesce silently server-side.
    var newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            newsletterForm.classList.remove('is-success', 'is-error');
            var emailInput = newsletterForm.querySelector('input[name="email"]');
            var hpInput = newsletterForm.querySelector('input[name="hp"]');
            var errorEl = newsletterForm.querySelector('[data-error]');
            var email = (emailInput && emailInput.value || '').trim();
            var hp = (hpInput && hpInput.value || '').trim();

            if (!EMAIL_RE.test(email)) {
                if (errorEl) errorEl.textContent = translations[currentLang].newsletter_error_email;
                newsletterForm.classList.add('is-error');
                return;
            }
            // Honeypot tripped — fake-success and bail
            if (hp) {
                newsletterForm.classList.add('is-success');
                return;
            }

            var btn = newsletterForm.querySelector('button[type="submit"]');
            if (btn) btn.disabled = true;

            fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    locale: currentLang,
                    source: 'index_newsletter',
                    referrer: document.referrer || ''
                })
            }).then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                newsletterForm.classList.add('is-success');
                track('NewsletterSubmit', { locale: currentLang });
            }).catch(function () {
                if (errorEl) errorEl.textContent = translations[currentLang].newsletter_error_generic;
                newsletterForm.classList.add('is-error');
            }).then(function () {
                if (btn) btn.disabled = false;
            });
        });
    }
})();
