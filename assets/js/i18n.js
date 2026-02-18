// Simple i18n (EN/FR) for static HTML content
// Usage: add data-i18n="key" to any element that contains text to translate.

(function () {
  const STORAGE_KEY = 'foxiwear_lang';

  const translations = {
    en: {
      lang_name: 'ENGLISH',
      lang_french: 'FRENCH',
      nav_tracking: 'FOXI® TRACKING',
      nav_company: 'OUR COMPANY',
      nav_support: 'SUPPORT',
      nav_dashboard: 'DASHBOARD',
      nav_powersports: 'POWERSPORTS',
      nav_pro: 'FOXI® PRO',
      nav_new_arrivals: 'NEW ARRIVALS',
      hero_motocross: 'FOXI® MOTOCROSS',
      hero_motocross_desc: 'UNLEASH YOUR STYLE WITH OUR POWERSPORTS GEAR',
      hero_get_started: '🦊 GET STARTED',
      hero_wintersports: 'FOXI® WINTERSPORTS',
      hero_winter_desc: 'DISCOVER OUR WINTER ❄️ COLLECTION',
      hero_winter_get_started: '❄️ GET STARTED',
      hero_pro_title: 'UNLOCK REWARDS WITH FOXI® PRO',
      hero_pro_desc: 'EARN REWARDS WHEN YOU UPGRADE YOUR GEAR',
      hero_pro_cta: 'GET STARTED TODAY'
    },
    fr: {
      lang_name: 'FRANÇAIS',
      lang_french: 'FRANÇAIS',
      nav_tracking: 'SUIVI FOXI®',
      nav_company: 'NOTRE ENTREPRISE',
      nav_support: 'ASSISTANCE',
      nav_dashboard: 'TABLEAU DE BORD',
      nav_powersports: 'SPORTS MOTORISÉS',
      nav_pro: 'FOXI® PRO',
      nav_new_arrivals: 'NOUVEAUTÉS',
      hero_motocross: 'FOXI® MOTOCROSS',
      hero_motocross_desc: 'DÉCHAÎNEZ VOTRE STYLE AVEC NOTRE ÉQUIPEMENT DE SPORTS MOTORISÉS',
      hero_get_started: '🦊 COMMENCER',
      hero_wintersports: 'FOXI® SPORTS D’HIVER',
      hero_winter_desc: 'DÉCOUVREZ NOTRE COLLECTION HIVER ❄️',
      hero_winter_get_started: '❄️ COMMENCER',
      hero_pro_title: 'DÉBLOQUEZ DES RÉCOMPENSES AVEC FOXI® PRO',
      hero_pro_desc: 'GAGNEZ DES RÉCOMPENSES LORSQUE VOUS AMÉLIOREZ VOTRE ÉQUIPEMENT',
      hero_pro_cta: 'COMMENCEZ AUJOURD’HUI'
    }
  };

  function applyTranslations(lang) {
    const dict = translations[lang] || translations.en;

    document.documentElement.setAttribute('lang', lang === 'fr' ? 'fr' : 'en');

    // Update language toggle label
    const langToggle = document.getElementById('shop-header-lang-toggle');
    if (langToggle) langToggle.textContent = dict.lang_name;

    // Translate all nodes with data-i18n
    const nodes = document.querySelectorAll('[data-i18n]');
    nodes.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const value = dict[key];
      if (typeof value === 'string') {
        el.textContent = value;
      }
    });

    // Translate placeholders
    const placeholderNodes = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderNodes.forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (!key) return;
      const value = dict[key];
      if (typeof value === 'string') {
        el.setAttribute('placeholder', value);
      }
    });

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function initLanguageSwitcher() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initialLang = saved || 'en';

    // Wire the dropdown option(s)
    const langMenu = document.querySelector('.shop-header-lang');
    if (langMenu) {
      const options = langMenu.querySelectorAll('ul li a');
      options.forEach((a) => {
        const explicitLang = a.getAttribute('data-lang');
        if (explicitLang === 'en' || explicitLang === 'fr') {
          a.addEventListener('click', (e) => {
            e.preventDefault();
            applyTranslations(explicitLang);
          });
          return;
        }

        // Backward-compatible fallback (if you add more labels later)
        const label = (a.textContent || '').trim().toLowerCase();
        if (label.includes('french') || label.includes('français') || label.includes('francais')) {
          a.addEventListener('click', (e) => {
            e.preventDefault();
            applyTranslations('fr');
          });
        }
        if (label.includes('english') || label.includes('anglais')) {
          a.addEventListener('click', (e) => {
            e.preventDefault();
            applyTranslations('en');
          });
        }
      });
    }

    applyTranslations(initialLang);
  }

  document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
})();
