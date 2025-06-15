import { CompanyCar } from './models/companyCar';
import { Motor } from './models/motor';
import i18next from 'i18next';
import { format } from 'date-fns';
import { UsagePeriod } from './models/usagePeriod';

const dateFormat = 'dd.MM.yyyy';
// Format helper function for pct values 
function formatPct(value: number, fractionDigits: number): string {
    return (value * 100).toFixed(fractionDigits);
}

// Calculation code
function calculate(): void {
    const catalogValue = parseFloat((document.getElementById('catalogValue') as HTMLInputElement).value);
    const co2 = parseFloat((document.getElementById('co2') as HTMLInputElement).value);

    const motorSelect = document.getElementById('motor') as HTMLSelectElement;
    const selectedMotor = motorSelect.selectedOptions[0];
    const motorValue = selectedMotor ? selectedMotor.getAttribute('i18n-id') || selectedMotor.value : '';
    
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
    
    resultBlocks.push(i18next.t('detail_motor', { motor: selectedMotor.textContent }));
    
    const defaultEmissionStatement = co2 == companyCar.defaultEmission ? i18next.t('detail_default_emission_statement') : '';
    resultBlocks.push(i18next.t('detail_emission', { emission: co2.toFixed(0), defaultEmissionStatement: defaultEmissionStatement }));
    
    resultBlocks.push(i18next.t('detail_first_day_at_disposal', { firstDayAtDisposal: format(companyCar.firstDayEntireUsagePeriod, dateFormat) }));
    resultBlocks.push(i18next.t('detail_last_day_at_disposal', { lastDayAtDisposal: format(lastDayAtDisposal ?? companyCar.lastDayEntireUsagePeriod, dateFormat) }));
    
    // Check if registration date does not start on the first of the month
    if (companyCar.registrationDate.getDate() !== 1) {
        resultBlocks.push("\n" + i18next.t('detail_registration_date_correction', { correctedRegistrationDate: format(companyCar.firstDayOfRegistrationMonth, dateFormat) }));
    }
    //
    if (lastDayAtDisposal) {
        resultBlocks.push("\n" + i18next.t('detail_last_day_at_disposal_correction', { correctedLastDayAtDisposal: format(companyCar.lastDayEntireUsagePeriod, dateFormat) }));
    }

    const usagePeriods = [companyCar.usagePeriod1, companyCar.usagePeriod2];
    usagePeriods.forEach(usagePeriod => {
        if (usagePeriod.firstDay && usagePeriod.lastDay && usagePeriod.days > 0) {
            resultBlocks.push("\n" + i18next.t('detail_pct', { 
                firstDay: format(usagePeriod.firstDay, dateFormat),
                lastDay: format(usagePeriod.lastDay, dateFormat),
                pct: formatPct(usagePeriod.pctCatalogValue, 0) // Only round numbers in this case
            }));
        }
    });

    // Emission
    const moreOrLess = companyCar.emission < companyCar.emissionReference ? i18next.t('detail_less') : i18next.t('detail_more');
    const plusOrMinus = companyCar.emission < companyCar.emissionReference ? i18next.t('detail_minus') : i18next.t('detail_plus');
    const defaultEmissionText = companyCar.emission === companyCar.defaultEmission ? i18next.t('detail_default_emission') : '';

    if (companyCar.motor === Motor.electric) {
        resultBlocks.push("\n" + i18next.t('detail_electric_emissions', {
            pct: formatPct(CompanyCar.PCT_EMISSION_MIN, 0) // Only round numbers in this case
        }));
    }
    else {
        resultBlocks.push("\n" + i18next.t('detail_emissions_intro', {
            defaultEmissionText: defaultEmissionText,
            emission: companyCar.emission,
            emissionDifference: Math.abs(companyCar.emissionMinusReference),
            moreOrLess: moreOrLess,
            emissionReference: companyCar.emissionReference,
            motor: (selectedMotor.textContent ?? "").toLowerCase(), // TODO smth better?
        }));
    
        resultBlocks.push("\n" + i18next.t('detail_emissions', {
            pctBaseEmission: formatPct(CompanyCar.PCT_EMISSION_BASE, 1),
            plusOrMinus: plusOrMinus,
            emissionDifference: (Math.abs(companyCar.emissionMinusReference) * 0.1).toFixed(1),
            pctTheoreticalEmission: formatPct(companyCar.pctTheoreticalEmission, 1)
        }));
    };

    const pctFinalEmission = formatPct(companyCar.pctFinalEmission, 1);

    if (companyCar.pctTheoreticalEmission > CompanyCar.PCT_EMISSION_MAX) {
        resultBlocks.push("\n" + i18next.t('detail_min_max_emission', {
            moreOrLess: i18next.t('detail_more'),
            minOrMax: i18next.t('detail_max'),
            pct: pctFinalEmission
        }));
    }
    else if (companyCar.pctTheoreticalEmission < CompanyCar.PCT_EMISSION_MIN) {
        resultBlocks.push("\n" + i18next.t('detail_min_max_emission', {   
            moreOrLess: i18next.t('detail_less'),
            minOrMax: i18next.t('detail_min'), 
            pct: pctFinalEmission
        }));
    }

    // Days
    usagePeriods.forEach(usagePeriod => {
        if (usagePeriod.firstDay && usagePeriod.lastDay && usagePeriod.days > 0) {
            resultBlocks.push("\n" + i18next.t('detail_days_in_period', { 
                firstDay: format(usagePeriod.firstDay, dateFormat),
                lastDay: format(usagePeriod.lastDay, dateFormat),
                days: usagePeriod.days
            }));
        }
    });
    resultBlocks.push("\n" + i18next.t('detail_days_in_year', { 
        year: companyCar.calendarYear,
        days: companyCar.daysInCalendarYear
    }));

    // Results
    usagePeriods.forEach(usagePeriod => {
        if (usagePeriod.firstDay && usagePeriod.lastDay && usagePeriod.days > 0) {
            resultBlocks.push("\n" + i18next.t('detail_period_result', { 
                firstDay: format(usagePeriod.firstDay, dateFormat),
                lastDay: format(usagePeriod.lastDay, dateFormat),
                catalogValue: numberFormat.format(companyCar.catalogValue),
                pctCatalogValue: formatPct(usagePeriod.pctCatalogValue, 0),
                numerator: UsagePeriod.NUMERATOR,
                denominator: UsagePeriod.DENOMINATOR,
                daysInPeriod: usagePeriod.days,
                daysInYear: companyCar.daysInCalendarYear, //TODO shouldn't this be an object separate from companyCar?
                pctEmission: formatPct(usagePeriod.pctEmission, 1),
                amount: numberFormat.format(usagePeriod.amount)
            }));
        }
    });

    if (companyCar.usagePeriod1.days > 0 && companyCar.usagePeriod2.days > 0) {
        resultBlocks.push("\n" + i18next.t('detail_period_result_sum', {
            year: companyCar.calendarYear,
            period1Amount: companyCar.usagePeriod1.amount,
            period2Amount: companyCar.usagePeriod2.amount,
            totalAmount: numberFormat.format(companyCar.totalAmount)
        }));
    }

    const totalDays = 
        companyCar.usagePeriod1.days > 0 && companyCar.usagePeriod2.days > 0 ? 
        i18next.t('detail_days_sum', {
            period1Days: companyCar.usagePeriod1.days,
            period2Days: companyCar.usagePeriod2.days
        }) : companyCar.totalDays.toString();
 
    if (companyCar.totalAmount < companyCar.minAmount) {
        resultBlocks.push("\n" + i18next.t('detail_min_amount', {
            year: companyCar.fiscalYear,
            theoreticalMinAmount: companyCar.theoreticalMinAmount,
            daysInUsage: totalDays,
            daysInCalendarYear: companyCar.daysInCalendarYear,
            minAmount: numberFormat.format(companyCar.minAmount)
        }));
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
            navigator.share({
                title: "Fisc36 Result",
                text: result,
                url: window.location.href,
            }).catch((err) => console.log("Share cancelled or failed:", err));
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

