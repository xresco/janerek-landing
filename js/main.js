// Janerek Landing Page — main.js

(function () {
    'use strict';

    // ——— Translations ———
    var translations = {
        ar: {
            app_name: 'جانرك',
            nav_features: 'المميزات',
            nav_how: 'كيف يعمل',
            nav_screenshots: 'صور التطبيق',
            nav_faq: 'الأسئلة الشائعة',
            nav_download: 'حمّل التطبيق',
            hero_title: 'جانرك',
            hero_tagline: 'شريك حياة يناسب قيمك وحياتك',
            hero_subtitle: 'اكتشف شريك حياتك المناسب بناءً على القيم والثقافة والاهتمامات المشتركة. جانرك هو المكان المناسب للقاء الشخص المناسب.',
            hero_cta: 'حمّل من Google Play',
            scroll_text: 'استكشف المزيد',
            features_title: 'لماذا جانرك؟',
            features_subtitle: 'تجربة مواعدة مصممة لمن يبحث عن علاقة جادة.',
            feature1_title: 'أنشئ ملفك الشخصي',
            feature1_desc: 'أضف جنسيتك، ديانتك، مهنتك، مستواك التعليمي، ولغاتك. ملفك الشخصي يعكس هويتك الحقيقية.',
            feature2_title: 'تصفية ذكية',
            feature2_desc: 'فلاتر متقدمة حسب الجنسية، الديانة، اللغة، العمر، والموقع. اعثر على الشخص المناسب بسهولة.',
            feature3_title: 'آمن وموثوق',
            feature3_desc: 'توثيق الملفات الشخصية وإعدادات الخصوصية المتقدمة. بياناتك الشخصية في أمان تام.',
            feature4_title: 'علاقات جادة',
            feature4_desc: 'مصمم للباحثين عن شريك حياة. من المحادثات العميقة إلى اللقاءات الحقيقية — رحلتك تبدأ هنا.',
            feature5_title: 'قريب منك',
            feature5_desc: 'اكتشف أشخاصاً بالقرب منك أو ابحث حسب البلد. شريكك المناسب قد يكون أقرب مما تتوقع.',
            feature6_title: 'تجربة مميزة',
            feature6_desc: 'اكتشف من أعجب بك، احصل على أولوية في الظهور، وتمتع بتمريرات غير محدودة.',
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
            download_title: 'مستعد للبدء؟',
            download_subtitle: 'انضم إلى آلاف الأشخاص الذين وجدوا شريكهم عبر جانرك.',
            download_btn: 'حمّل جانرك',
            footer_company: 'الشركة',
            footer_privacy: 'سياسة الخصوصية',
            footer_terms: 'شروط الاستخدام',
            footer_contact: 'تواصل معنا',
            footer_copy: '\u00A9 2026 جانرك. جميع الحقوق محفوظة.'
        },
        en: {
            app_name: 'Janerek',
            nav_features: 'Features',
            nav_how: 'How It Works',
            nav_screenshots: 'Screenshots',
            nav_faq: 'FAQ',
            nav_download: 'Download',
            hero_title: 'Janerek',
            hero_tagline: 'The right place to meet the right match',
            hero_subtitle: 'Discover your perfect match based on shared values, culture, and interests. Janerek is the right place to meet the right person.',
            hero_cta: 'Get it on Google Play',
            scroll_text: 'Scroll to explore',
            features_title: 'Why Janerek?',
            features_subtitle: 'A dating experience designed for those seeking a serious relationship.',
            feature1_title: 'Build Your Profile',
            feature1_desc: 'Add your nationality, religion, profession, education, and languages. Your profile reflects your true identity.',
            feature2_title: 'Smart Filters',
            feature2_desc: 'Advanced filters by nationality, religion, language, age, and location. Find the right person with ease.',
            feature3_title: 'Safe & Verified',
            feature3_desc: 'Profile verification and advanced privacy settings. Your personal data is completely secure.',
            feature4_title: 'Serious Connections',
            feature4_desc: 'Designed for those seeking a life partner. From deep conversations to real meetings — your journey starts here.',
            feature5_title: 'Location-Based',
            feature5_desc: 'Discover people near you or search by country. Your perfect match might be closer than you think.',
            feature6_title: 'Premium Experience',
            feature6_desc: 'See who likes you, get priority visibility, and enjoy unlimited swipes.',
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
            download_title: 'Ready to Start?',
            download_subtitle: 'Join thousands of people who found their match through Janerek.',
            download_btn: 'Download Janerek',
            footer_company: 'Company',
            footer_privacy: 'Privacy Policy',
            footer_terms: 'Terms of Service',
            footer_contact: 'Contact Us',
            footer_copy: '\u00A9 2026 Janerek. All rights reserved.'
        }
    };

    // ——— Language Switcher ———
    var currentLang = localStorage.getItem('janerek-lang') || 'ar';

    function switchLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('janerek-lang', lang);

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
})();
