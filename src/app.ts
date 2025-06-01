import { CompanyCar } from './models/companyCar';
import { Motor } from './models/motor';
import i18next from 'i18next';
import { format } from 'date-fns';

const dateFormat = 'dd.MM.yyyy';

// Calculation code
function calculate(): void {
    const catalogValue = parseFloat((document.getElementById('catalogValue') as HTMLInputElement).value);
    const co2 = parseFloat((document.getElementById('co2') as HTMLInputElement).value);

    const motorSelect = document.getElementById('motor') as HTMLSelectElement;
    const selectedOption = motorSelect.selectedOptions[0];
    const motorValue = selectedOption ? selectedOption.getAttribute('i18n-id') || selectedOption.value : '';
    
    const fiscalYear = parseInt((document.getElementById('fiscalYear') as HTMLInputElement).value, 10);
    const registrationDate = new Date((document.getElementById('registrationDate') as HTMLInputElement).value);
    const firstDayAtDisposalValue = (document.getElementById('firstDayAtDisposal') as HTMLInputElement).value;
    const lastDayAtDisposalValue = (document.getElementById('lastDayAtDisposal') as HTMLInputElement).value;

    // TODO show error message
    if (
        isNaN(catalogValue) ||
        isNaN(co2) ||
        !motorValue ||
        isNaN(fiscalYear) ||
        isNaN(registrationDate.getTime())
    ) return;

    // Map motor string to Motor enum
    const motorMap: Record<string, Motor> = {
        diesel: Motor.diesel,
        petrol: Motor.petrol,
        lpg: Motor.lpg,
        gas: Motor.gas,
        electric: Motor.electric,
    };
    const motor = motorMap[motorValue];

    // Parse optional dates
    const firstDayAtDisposal = firstDayAtDisposalValue ? new Date(firstDayAtDisposalValue) : null;
    const lastDayAtDisposal = lastDayAtDisposalValue ? new Date(lastDayAtDisposalValue) : null;

    // Create CompanyCar instance
    const companyCar = new CompanyCar(
        fiscalYear,
        catalogValue,
        registrationDate,
        motor,
        co2,
        firstDayAtDisposal,
        lastDayAtDisposal
    );
    const result = companyCar.finalAmount;

    const numberFormat = new Intl.NumberFormat(i18next.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const resultBlocks: string[] = [];
    resultBlocks.push(i18next.t('result_text', { amount: numberFormat.format(result) }) + "\n");
    resultBlocks.push(i18next.t('detail_title') + "\n");
    
    resultBlocks.push(i18next.t('detail_fiscal_year', { fiscalYear: fiscalYear }));
    resultBlocks.push(i18next.t('detail_catalog_value', { catalogValue: numberFormat.format(catalogValue) }));
    resultBlocks.push(i18next.t('detail_registration_date', { registrationDate: format(registrationDate, dateFormat) }));
    
    resultBlocks.push(i18next.t('detail_motor', { motor: selectedOption.textContent }));
    
    const defaultEmissionStatement = co2 == companyCar.defaultEmission ? i18next.t('detail_default_emission_statement') : '';
    resultBlocks.push(i18next.t('detail_emission', { emission: co2.toFixed(0), defaultEmissionStatement: defaultEmissionStatement }));
    
    resultBlocks.push(i18next.t('detail_first_day_at_disposal', { firstDayAtDisposal: format(companyCar.firstDayEntireUsagePeriod, dateFormat) }));
    resultBlocks.push(i18next.t('detail_last_day_at_disposal', { lastDayAtDisposal: format(lastDayAtDisposal ?? companyCar.lastDayEntireUsagePeriod, dateFormat) }));
    
    
    // Check if registration date does not start on the first of the month
    if (companyCar.registrationDate.getDate() !== 1) {
        resultBlocks.push("\n" + i18next.t('detail_registration_date_correction', { correctedRegistrationDate: format(companyCar.firstDayOfRegistrationMonth, dateFormat) }));
    }
    if (lastDayAtDisposal) {
        resultBlocks.push(i18next.t('detail_last_day_at_disposal_correction', { correctedLastDayAtDisposal: format(companyCar.lastDayEntireUsagePeriod, dateFormat) }));
    }

    const finalResult = resultBlocks.join('\n'); // This joins each block with two newlines, forcing an empty line between all text blocks
    console.log(finalResult); // For debugging purposes

    // Display the calculated amount
    const resultText = document.getElementById('result-text');
    if (resultText) 
        resultText.textContent = finalResult;
    const resultDiv = document.getElementById("result");
    if (resultDiv) 
        resultDiv.hidden = false;
}

document.addEventListener('DOMContentLoaded', () => {
  // Calculate the result when the form gets submitted
const fiscForm = document.getElementById('fiscForm');
    if (fiscForm) {
    fiscForm.addEventListener('submit', function (e: Event) {
        e.preventDefault();
        calculate();
    });
    }

    // Recalculate result when the language is updated
    window.addEventListener('language-updated', () => {
    calculate(); // will re-translate result
});


// Share result logic
const btnShareResult = document.getElementById("btn_share_result");
if (btnShareResult) {
btnShareResult.addEventListener("click", () => {
    const result = (document.getElementById("result-text") as HTMLElement).textContent || "";

    if (navigator.share) {
    navigator
        .share({
        title: "Fisc36 Result",
        text: result,
        url: window.location.href,
        })
        .catch((err) => console.log("Share cancelled or failed:", err));
    } else if (navigator.clipboard) {
    navigator.clipboard.writeText(result).then(() =>
        alert("Copied to clipboard!")
    );
    } else {
    const subject = "Fisc36 Result";
    const body = result;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
});
}

});

