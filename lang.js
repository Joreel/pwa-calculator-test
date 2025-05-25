const resources = {
    fr: {
      translation: {
        title: "Fisc36",
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
        result_text: "Avantage de toute nature estimé: €{{amount}}"
      }
    },
    nl: {
      translation: {
        title: "Fisc36",
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
        result_text: "Voordeel van alle aard geschat op: €{{amount}}"
      }
    }
  };
  
function updateContent() {
    document.querySelectorAll('[i18n-id]').forEach(el => {
        const key = el.getAttribute('i18n-id');
        const translation = i18next.t(key);
        if (el.childNodes.length) {
            for (let node of el.childNodes) {
                if (node.nodeType === 3) {
                node.nodeValue = translation;
                break;
                }
            }
        } 
        else {
            el.textContent = translation;
        }
    });
}
    
i18next
.use(i18nextBrowserLanguageDetector)
.init({
    resources,
    fallbackLng: 'fr',
    lng: 'fr', // Set the default language
    debug: false
}, (err, t) => {
    if (err) return console.error(err);
    updateContent();

    // Set dropdown to current language
    const langSelect = document.getElementById('languageSelect');
    langSelect.value = i18next.language || 'fr';
});
    
// Handle language changes from dropdown
document.getElementById('languageSelect').addEventListener('change', (event) => {
    const selectedLang = event.target.value;
    i18next.changeLanguage(selectedLang, () => {
        updateContent();
        // Emit custom event so app logic can respond
        window.dispatchEvent(new Event('language-updated'));
    });
});