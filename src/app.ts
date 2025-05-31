import { CompanyCar } from './models/companyCar';
import { Motor } from './models/motor';
import i18next from 'i18next';

// Calculation code
function calculate(): void {
    const value = parseFloat((document.getElementById('catalogValue') as HTMLInputElement).value);
    const co2 = parseFloat((document.getElementById('co2') as HTMLInputElement).value);

    const engineSelect = document.getElementById('engineType') as HTMLSelectElement;
    const selectedOption = engineSelect.selectedOptions[0];
    const engine = selectedOption ? selectedOption.getAttribute('i18n-id') || selectedOption.value : '';
    
    const fiscalYear = parseInt((document.getElementById('fiscalYear') as HTMLInputElement).value, 10);
    const registrationDate = new Date((document.getElementById('registrationDate') as HTMLInputElement).value);
    const firstDayAtDisposalValue = (document.getElementById('firstDayAtDisposal') as HTMLInputElement).value;
    const lastDayAtDisposalValue = (document.getElementById('lastDayAtDisposal') as HTMLInputElement).value;

    // TODO show error message
    if (
        isNaN(value) ||
        isNaN(co2) ||
        !engine ||
        isNaN(fiscalYear) ||
        isNaN(registrationDate.getTime())
    ) return;

    // Map engine string to Motor enum
    const motorMap: Record<string, Motor> = {
        diesel: Motor.diesel,
        petrol: Motor.petrol,
        lpg: Motor.lpg,
        gas: Motor.gas,
        electric: Motor.electric,
    };
    const motor = motorMap[engine];

    // Parse optional dates
    const firstDayAtDisposal = firstDayAtDisposalValue ? new Date(firstDayAtDisposalValue) : null;
    const lastDayAtDisposal = lastDayAtDisposalValue ? new Date(lastDayAtDisposalValue) : null;

    // Create CompanyCar instance
    const companyCar = new CompanyCar(
        fiscalYear,
        value,
        registrationDate,
        motor,
        co2,
        firstDayAtDisposal,
        lastDayAtDisposal
    );

    // Display the calculated amount
    const result = companyCar.totalAmount;
    const translatedResult = i18next.t('result_text', { amount: result.toFixed(2) });
    const resultText = document.getElementById('result-text');
    if (resultText) resultText.textContent = translatedResult;
    const resultDiv = document.getElementById("result");
    if (resultDiv) resultDiv.hidden = false;
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

