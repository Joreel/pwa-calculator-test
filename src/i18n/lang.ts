import i18next from "i18next";
import i18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import fr from './fr.json';
import nl from './nl.json';

// TODO Add English and German
const resources = {
  // en: { translation: en }, // Uncomment if you have an English translation
  nl: { translation: nl },
  fr: { translation: fr },
  // de: { translation: de } // Uncomment if you have a German translation
};

// TODO Test whether language detection works

function updateContent(): void {
  document.querySelectorAll<HTMLElement>('[i18n-id]').forEach(el => {
    const key = el.getAttribute('i18n-id');
    if (!key) return;
    const translation = i18next.t(key);
    if (el.childNodes.length) {
      for (let node of Array.from(el.childNodes)) {
        if (node.nodeType === 3) {
          node.nodeValue = translation;
          break;
        }
      }
    } else {
      el.textContent = translation;
    }
  });
  // Update link to official documentation of calculation details
  const docLink = document.getElementById("doc_link") as HTMLAnchorElement | null;
  const falseHybridLink = document.getElementById("false_hybrid_link") as HTMLAnchorElement | null;
  if (docLink && falseHybridLink) {
    docLink.href = i18next.t('official_doc_link');
    falseHybridLink.href = i18next.t('official_doc_link');
  }
}

i18next
  .use(i18nextBrowserLanguageDetector)
  .init({
    resources,
    fallbackLng: 'fr', // TODO Set default language to English?
    lng: 'fr', // Set the default language
    debug: false,
    interpolation: {
      escapeValue: false // Do not escape interpolation values
    }
  }, (err) => {
    if (err) return console.error(err);
    updateContent();

    // Set dropdown to current language
    const langSelect = document.getElementById('languageSelect') as HTMLSelectElement | null;
    if (langSelect) {
      langSelect.value = i18next.language || 'fr'; // TODO Set default language to English?
    }
  });

// Handle language changes from dropdown
const langSelect = document.getElementById('languageSelect') as HTMLSelectElement | null;
if (langSelect) {
  langSelect.addEventListener('change', (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const selectedLang = target.value;
    i18next.changeLanguage(selectedLang, () => {
      updateContent();
      // Emit custom event so app logic can respond
      window.dispatchEvent(new Event('language-updated'));
    });
  });
}