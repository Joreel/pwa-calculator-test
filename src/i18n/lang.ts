import i18next from "i18next";
import i18nextBrowserLanguageDetector from "i18next-browser-languagedetector";

const resources = {
  fr: {
    translation: {
      title: "Fisc36",
      intro: "Calculez l'avantage de toute nature d'une voiture de société",
      lbl_fiscal_year: "Exercice d'imposition",
      lbl_catalog_value: "Valeur catalogue (€)",
      lbl_first_reg: "Première immatriculation",
      lbl_engine: "Moteur",
      lbl_co2: "CO₂ (g/km)",
      lbl_first_day: "Premier jour de mise à disposition",
      lbl_last_day: "Dernier jour de mise à disposition",
      small_required_field: "Champ obligatoire",
      btn_calculate: "Calculer",
      diesel: "Diesel",
      petrol: "Essence",
      electric: "Électrique",
      result_text: "Avantage de toute nature estimé: €{{amount}}",
      small_footnote_created_by: "Fisc36 fut créé par ",
      small_footnote_based_on: " et est basé sur la ",
      small_footnote_official_doc_link: "https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/avantages_toute_nature/voitures_de_societe",
      small_footnote_official_doc: "documentation du SPF Finances",
      small_footnote_source_code: "Le code source est disponible sur "
    }
  },
  nl: {
    translation: {
      title: "Fisc36",
      intro: "Bereken het voordeel van alle aard van een bedrijfswagen",
      lbl_fiscal_year: "Aanslagjaar",
      lbl_catalog_value: "Cataloguswaarde (€)",
      lbl_first_reg: "Eerste inschrijving",
      lbl_engine: "Motor",
      lbl_co2: "CO₂ (g/km)",
      lbl_first_day: "Eerste dag",
      lbl_last_day: "Laatse dag",
      small_required_field: "Verplicht veld",
      btn_calculate: "Bereken",
      diesel: "Diesel",
      petrol: "Benzine",
      electric: "Elektrisch",
      result_text: "Voordeel van alle aard geschat op: €{{amount}}",
      small_footnote_created_by: "Fisc36 werd gemaakt door ",
      small_footnote_based_on: " en is gebaseerd op de ",
      small_footnote_official_doc_link: "https://financien.belgium.be/nl/ondernemingen/personeel_en_loon/voordelen_van_alle_aard/bedrijfswagens",
      small_footnote_official_doc: "documentatie van de FOD Financiën",
      small_footnote_source_code: "De broncode is beschikbaar op "
    }
  }
};
// TODO Add German?

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
  if (docLink) {
    docLink.href = i18next.t('small_footnote_official_doc_link');
  }
}

i18next
  .use(i18nextBrowserLanguageDetector)
  .init({
    resources,
    fallbackLng: 'fr',
    lng: 'fr', // Set the default language
    debug: false
  }, (err) => {
    if (err) return console.error(err);
    updateContent();

    // Set dropdown to current language
    const langSelect = document.getElementById('languageSelect') as HTMLSelectElement | null;
    if (langSelect) {
      langSelect.value = i18next.language || 'fr';
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