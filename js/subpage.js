// Janerek Subpages — Language switcher + shared translations

(function () {
    'use strict';

    var translations = {
        ar: {
            app_name: 'جانرك',
            footer_copy: '\u00A9 2026 جانرك. جميع الحقوق محفوظة.',
            back_home: '\u2192 العودة للرئيسية',

            // Privacy
            privacy_page_title: 'سياسة الخصوصية',
            privacy_updated: 'آخر تحديث: فبراير 2026',
            privacy_intro: 'في جانرك، خصوصيتك أساسية في كل ما نقوم به. توضح سياسة الخصوصية هذه كيف نجمع ونستخدم ونكشف ونحمي معلوماتك عند استخدام تطبيقنا وخدماتنا.',
            privacy_h1: '1. المعلومات التي نجمعها',
            privacy_p1: 'معلومات الحساب: عند إنشاء حساب، نجمع اسمك، تاريخ ميلادك، بريدك الإلكتروني، وبيانات المصادقة (عبر Google أو Facebook أو Apple Sign-In).',
            privacy_p2: 'معلومات الملف الشخصي: المعلومات التي تختار تقديمها في ملفك الشخصي، بما في ذلك الصور، الجنس، الجنسية، الديانة، المهنة، المستوى التعليمي، واللغات.',
            privacy_p3: 'بيانات الموقع: بإذنك، نجمع موقعك التقريبي لعرض مستخدمين قريبين منك. يمكنك أيضاً اختيار البحث حسب البلد.',
            privacy_p4: 'بيانات الاستخدام: نجمع معلومات حول كيفية استخدامك للتطبيق، بما في ذلك التمريرات والتطابقات واستخدام الميزات، لتحسين خدمتنا.',
            privacy_p5: 'معلومات الجهاز: نجمع نوع الجهاز وإصدار نظام التشغيل وإصدار التطبيق لأغراض التوافق واستكشاف الأخطاء.',
            privacy_h2: '2. كيف نستخدم معلوماتك',
            privacy_p6: 'نستخدم المعلومات التي نجمعها من أجل:',
            privacy_li1: 'تقديم وصيانة وتحسين خدماتنا',
            privacy_li2: 'مطابقتك مع مستخدمين متوافقين بناءً على تفضيلاتك وفلاترك',
            privacy_li3: 'إرسال إشعارات حول التطابقات والرسائل وتحديثات التطبيق',
            privacy_li4: 'ضمان أمان وسلامة منصتنا',
            privacy_li5: 'تحليل اتجاهات الاستخدام لتحسين تجربة المستخدم',
            privacy_h3: '3. مشاركة المعلومات',
            privacy_p7: 'نحن لا نبيع بياناتك الشخصية لأطراف ثالثة. قد نشارك المعلومات في الحالات المحدودة التالية:',
            privacy_li6: 'المستخدمون الآخرون: معلومات ملفك الشخصي مرئية لأعضاء جانرك الآخرين كجزء من الخدمة',
            privacy_li7: 'مزودو الخدمة: نستخدم خدمات طرف ثالث (استضافة سحابية، تحليلات) تعالج البيانات نيابة عنا وفق اتفاقيات سرية صارمة',
            privacy_li8: 'المتطلبات القانونية: قد نكشف المعلومات إذا كان ذلك مطلوباً بموجب القانون أو لحماية سلامة مستخدمينا',
            privacy_h4: '4. أمان البيانات',
            privacy_p8: 'نطبق إجراءات أمان معيارية في الصناعة لحماية معلوماتك الشخصية، بما في ذلك نقل البيانات المشفرة والبنية التحتية السحابية الآمنة والمراجعات الأمنية المنتظمة.',
            privacy_h5: '5. حقوقك',
            privacy_p9: 'لديك الحق في:',
            privacy_li9: 'الوصول إلى بياناتك الشخصية وتحميلها',
            privacy_li10: 'تصحيح أو تحديث معلومات ملفك الشخصي في أي وقت',
            privacy_li11: 'حذف حسابك وجميع البيانات المرتبطة به نهائياً',
            privacy_li12: 'إلغاء الاشتراك في الإشعارات غير الضرورية',
            privacy_li13: 'سحب الموافقة على تتبع الموقع',
            privacy_h6: '6. الاحتفاظ بالبيانات',
            privacy_p10: 'نحتفظ ببياناتك طالما أن حسابك نشط. عند حذف حسابك، يتم حذف جميع البيانات الشخصية نهائياً من خوادمنا خلال 30 يوماً.',
            privacy_h7: '7. القيود العمرية',
            privacy_p11: 'جانرك مخصص للبالغين الذين تبلغ أعمارهم 18 عاماً فما فوق. لا نجمع معلومات عن عمد من أي شخص دون 18 عاماً.',
            privacy_h8: '8. التغييرات على هذه السياسة',
            privacy_p12: 'قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنقوم بإخطارك بالتغييرات الهامة عبر التطبيق أو البريد الإلكتروني.',
            privacy_h9: '9. تواصل معنا',
            privacy_p13: 'إذا كانت لديك أسئلة حول سياسة الخصوصية هذه أو بياناتك الشخصية، يرجى التواصل معنا.',

            // Terms
            terms_page_title: 'شروط الاستخدام',
            terms_updated: 'آخر تحديث: فبراير 2026',
            terms_intro: 'مرحباً بك في جانرك. بتحميل التطبيق أو الوصول إليه أو استخدامه، فإنك توافق على الالتزام بشروط الاستخدام هذه. يرجى قراءتها بعناية.',
            terms_h1: '1. الأهلية',
            terms_p1: 'يجب أن يكون عمرك 18 عاماً على الأقل لإنشاء حساب واستخدام جانرك.',
            terms_h2: '2. حسابك',
            terms_p2: 'أنت مسؤول عن الحفاظ على سرية بيانات حسابك وعن جميع الأنشطة التي تحدث تحت حسابك. أنت توافق على:',
            terms_li1: 'تقديم معلومات دقيقة وصادقة في ملفك الشخصي',
            terms_li2: 'استخدام صورك الخاصة فقط التي تمثلك بدقة',
            terms_li3: 'عدم إنشاء حسابات متعددة أو انتحال شخصية شخص آخر',
            terms_li4: 'إخطارنا فوراً بأي وصول غير مصرح به إلى حسابك',
            terms_h3: '3. الاستخدام المقبول',
            terms_p3: 'عند استخدام جانرك، فإنك توافق على عدم:',
            terms_li5: 'مضايقة أو تهديد أو ترهيب المستخدمين الآخرين',
            terms_li6: 'نشر محتوى غير قانوني أو مسيء أو ينتهك حقوق الآخرين',
            terms_li7: 'مشاركة محتوى صريح يتضمن قاصرين أو أفراد غير موافقين',
            terms_li8: 'استخدام التطبيق لأغراض تجارية أو طلبات أو إعلانات',
            terms_li9: 'محاولة استخراج البيانات أو اختراق أو عكس هندسة التطبيق',
            terms_li10: 'إنشاء ملفات شخصية وهمية أو استخدام روبوتات أو أدوات آلية',
            terms_li11: 'مشاركة معلومات المستخدمين الآخرين الخاصة دون موافقتهم',
            terms_h4: '4. المحتوى',
            terms_p4: 'تحتفظ بملكية المحتوى الذي تنشره على جانرك. بنشر المحتوى، فإنك تمنحنا ترخيصاً غير حصري وعالمي لاستخدام وعرض وتوزيع المحتوى الخاص بك داخل التطبيق لغرض تقديم خدمتنا.',
            terms_p5: 'نحتفظ بالحق في إزالة أي محتوى ينتهك هذه الشروط أو نراه غير مناسب، دون إشعار مسبق.',
            terms_h5: '5. الاشتراكات والمدفوعات',
            terms_p6: 'يقدم جانرك ميزات مجانية ومميزة. يتم إصدار فواتير الاشتراكات المميزة عبر Google Play.',
            terms_li12: 'يتم تجديد الاشتراكات تلقائياً ما لم يتم إلغاؤها قبل تاريخ التجديد',
            terms_li13: 'يمكنك إدارة أو إلغاء اشتراكك من خلال متجر Google Play',
            terms_li14: 'يتم التعامل مع المبالغ المستردة وفقاً لسياسة استرداد Google Play',
            terms_li15: 'نحتفظ بالحق في تغيير الأسعار مع إشعار معقول',
            terms_h6: '6. توثيق الملف الشخصي',
            terms_p7: 'يقدم جانرك توثيقاً اختيارياً للملف الشخصي. تشير شارات التوثيق إلى أن المستخدم قد أكمل عملية التوثيق لدينا.',
            terms_h7: '7. السلامة والإبلاغ',
            terms_p8: 'نحن ملتزمون بالحفاظ على مجتمع آمن. إذا واجهت سلوكاً غير لائق، يمكنك الإبلاغ عن المستخدمين أو حظرهم مباشرة داخل التطبيق.',
            terms_h8: '8. حدود المسؤولية',
            terms_p9: 'يتم تقديم جانرك "كما هو" دون ضمانات من أي نوع. لا نضمن أن:',
            terms_li16: 'التطبيق سيكون متاحاً في جميع الأوقات دون انقطاع',
            terms_li17: 'ملفات المستخدمين الآخرين دقيقة أو صادقة',
            terms_li18: 'ستجد تطابقاً أو تحقق نتيجة محددة',
            terms_h9: '9. الإنهاء',
            terms_p10: 'نحتفظ بالحق في تعليق أو إنهاء حسابك في أي وقت إذا انتهكت هذه الشروط.',
            terms_h10: '10. التغييرات على هذه الشروط',
            terms_p11: 'قد نقوم بتحديث شروط الاستخدام هذه من وقت لآخر.',
            terms_h11: '11. التواصل',
            terms_p12: 'إذا كانت لديك أسئلة حول شروط الاستخدام هذه، يرجى التواصل معنا.',

            // Contact
            contact_page_title: 'تواصل معنا',
            contact_intro: 'هل لديك سؤال أو ملاحظة أو تحتاج مساعدة؟ نحب أن نسمع منك. املأ النموذج أدناه وسنرد عليك في أقرب وقت ممكن.',
            contact_name: 'الاسم',
            contact_name_ph: 'اسمك',
            contact_email: 'البريد الإلكتروني',
            contact_subject: 'الموضوع',
            contact_subject_ph: 'ما هو الموضوع؟',
            contact_message: 'الرسالة',
            contact_message_ph: 'أخبرنا المزيد...',
            contact_send: 'إرسال الرسالة',
            contact_other_title: 'طرق أخرى للتواصل',
            contact_other_text: 'للمسائل العاجلة أو مشاكل الحساب، يمكنك التواصل معنا مباشرة على:'
        },
        en: {
            app_name: 'Janerek',
            footer_copy: '\u00A9 2026 Janerek. All rights reserved.',
            back_home: '\u2190 Back to home',

            // Privacy
            privacy_page_title: 'Privacy Policy',
            privacy_updated: 'Last updated: February 2026',
            privacy_intro: 'At Janerek, your privacy is fundamental to everything we do. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.',
            privacy_h1: '1. Information We Collect',
            privacy_p1: 'Account Information: When you create an account, we collect your name, date of birth, email address, and authentication credentials (via Google, Facebook, or Apple Sign-In).',
            privacy_p2: 'Profile Information: Information you choose to provide on your profile, including photos, gender, nationality, religion, profession, education level, and languages.',
            privacy_p3: 'Location Data: With your permission, we collect your approximate location to show you nearby users. You can also choose to search by country instead.',
            privacy_p4: 'Usage Data: We collect information about how you use the app, including swipes, matches, and feature usage, to improve our service.',
            privacy_p5: 'Device Information: We collect device type, operating system version, and app version for compatibility and troubleshooting purposes.',
            privacy_h2: '2. How We Use Your Information',
            privacy_p6: 'We use the information we collect to:',
            privacy_li1: 'Provide, maintain, and improve our services',
            privacy_li2: 'Match you with compatible users based on your preferences and filters',
            privacy_li3: 'Send you notifications about matches, messages, and app updates',
            privacy_li4: 'Ensure the safety and security of our platform',
            privacy_li5: 'Analyze usage trends to improve the user experience',
            privacy_h3: '3. Information Sharing',
            privacy_p7: 'We do not sell your personal data to third parties. We may share information in the following limited circumstances:',
            privacy_li6: 'Other Users: Your profile information is visible to other Janerek members as part of the service',
            privacy_li7: 'Service Providers: We use third-party services (cloud hosting, analytics) that process data on our behalf under strict confidentiality agreements',
            privacy_li8: 'Legal Requirements: We may disclose information if required by law or to protect the safety of our users',
            privacy_h4: '4. Data Security',
            privacy_p8: 'We implement industry-standard security measures to protect your personal information, including encrypted data transmission, secure cloud infrastructure, and regular security audits.',
            privacy_h5: '5. Your Rights',
            privacy_p9: 'You have the right to:',
            privacy_li9: 'Access and download your personal data',
            privacy_li10: 'Correct or update your profile information at any time',
            privacy_li11: 'Delete your account and all associated data permanently',
            privacy_li12: 'Opt out of non-essential notifications',
            privacy_li13: 'Withdraw consent for location tracking',
            privacy_h6: '6. Data Retention',
            privacy_p10: 'We retain your data for as long as your account is active. When you delete your account, all personal data is permanently removed from our servers within 30 days.',
            privacy_h7: '7. Age Restriction',
            privacy_p11: 'Janerek is intended for adults aged 18 and older. We do not knowingly collect information from anyone under 18.',
            privacy_h8: '8. Changes to This Policy',
            privacy_p12: 'We may update this Privacy Policy from time to time. We will notify you of significant changes through the app or via email.',
            privacy_h9: '9. Contact Us',
            privacy_p13: 'If you have questions about this Privacy Policy or your personal data, please contact us.',

            // Terms
            terms_page_title: 'Terms of Service',
            terms_updated: 'Last updated: February 2026',
            terms_intro: 'Welcome to Janerek. By downloading, accessing, or using our app, you agree to be bound by these Terms of Service. Please read them carefully.',
            terms_h1: '1. Eligibility',
            terms_p1: 'You must be at least 18 years old to create an account and use Janerek.',
            terms_h2: '2. Your Account',
            terms_p2: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:',
            terms_li1: 'Provide accurate and truthful information on your profile',
            terms_li2: 'Use only your own photos that accurately represent you',
            terms_li3: 'Not create multiple accounts or impersonate another person',
            terms_li4: 'Notify us immediately of any unauthorized access to your account',
            terms_h3: '3. Acceptable Use',
            terms_p3: 'When using Janerek, you agree not to:',
            terms_li5: 'Harass, threaten, or intimidate other users',
            terms_li6: 'Post content that is illegal, defamatory, or violates the rights of others',
            terms_li7: 'Share explicit content involving minors or non-consenting individuals',
            terms_li8: 'Use the app for commercial purposes, solicitation, or advertising',
            terms_li9: 'Attempt to scrape, hack, or reverse-engineer the app',
            terms_li10: 'Create fake profiles or use bots or automated tools',
            terms_li11: 'Share other users\' private information without their consent',
            terms_h4: '4. Content',
            terms_p4: 'You retain ownership of the content you post on Janerek. By posting content, you grant us a non-exclusive, worldwide license to use, display, and distribute your content within the app for the purpose of providing our service.',
            terms_p5: 'We reserve the right to remove any content that violates these terms or that we deem inappropriate, without prior notice.',
            terms_h5: '5. Subscriptions & Payments',
            terms_p6: 'Janerek offers free and premium features. Premium subscriptions are billed through Google Play.',
            terms_li12: 'Subscriptions auto-renew unless cancelled before the renewal date',
            terms_li13: 'You can manage or cancel your subscription through the Google Play Store',
            terms_li14: 'Refunds are handled according to Google Play\'s refund policy',
            terms_li15: 'We reserve the right to change pricing with reasonable notice',
            terms_h6: '6. Profile Verification',
            terms_p7: 'Janerek offers optional profile verification. Verified badges indicate that a user has completed our verification process.',
            terms_h7: '7. Safety & Reporting',
            terms_p8: 'We are committed to maintaining a safe community. If you encounter inappropriate behavior, you can report or block users directly within the app.',
            terms_h8: '8. Limitation of Liability',
            terms_p9: 'Janerek is provided "as is" without warranties of any kind. We do not guarantee that:',
            terms_li16: 'The app will be available at all times without interruption',
            terms_li17: 'Other users\' profiles are accurate or truthful',
            terms_li18: 'You will find a match or achieve a specific outcome',
            terms_h9: '9. Termination',
            terms_p10: 'We reserve the right to suspend or terminate your account at any time if you violate these terms.',
            terms_h10: '10. Changes to These Terms',
            terms_p11: 'We may update these Terms of Service from time to time.',
            terms_h11: '11. Contact',
            terms_p12: 'If you have questions about these Terms of Service, please contact us.',

            // Contact
            contact_page_title: 'Contact Us',
            contact_intro: 'Have a question, feedback, or need help? We\'d love to hear from you. Fill out the form below and we\'ll get back to you as soon as possible.',
            contact_name: 'Name',
            contact_name_ph: 'Your name',
            contact_email: 'Email',
            contact_subject: 'Subject',
            contact_subject_ph: 'What is this about?',
            contact_message: 'Message',
            contact_message_ph: 'Tell us more...',
            contact_send: 'Send Message',
            contact_other_title: 'Other Ways to Reach Us',
            contact_other_text: 'For urgent matters or account issues, you can also reach us directly at:'
        }
    };

    var currentLang = localStorage.getItem('janerek-lang') || 'ar';

    function switchLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('janerek-lang', lang);

        var html = document.documentElement;
        html.setAttribute('lang', lang);
        html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

        document.body.classList.remove('lang-ar', 'lang-en');
        document.body.classList.add('lang-' + lang);

        // Update text content
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang] && translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });

        // Update active state
        document.querySelectorAll('.lang-option').forEach(function (opt) {
            opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
        });

        // Update back arrow direction
        var backLink = document.querySelector('.page-back');
        if (backLink) {
            var text = translations[lang].back_home || '';
            backLink.textContent = text;
        }
    }

    // Language toggle
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
                switchLanguage(currentLang === 'ar' ? 'en' : 'ar');
            }
        });
    }

    switchLanguage(currentLang);
})();
