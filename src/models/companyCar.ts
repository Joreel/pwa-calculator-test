import { Motor } from "./motor";
import { UsagePeriod } from "./usagePeriod";

import refPetrolJson from '../referenceTables/refPetrol.json';
import refDieselJson from '../referenceTables/refDiesel.json';
import minAmountsJson from '../referenceTables/minAmounts.json';

export class CompanyCar {
  static readonly PCT_EMISSION_BASE = 0.055;
  static readonly PCT_EMISSION_MOD = 0.001;
  static readonly PCT_EMISSION_MIN = 0.04;
  static readonly PCT_EMISSION_MAX = 0.18;

  static readonly EMISSION_DEFAULT_PETROL = 205;
  static readonly EMISSION_DEFAULT: Map<Motor, number> = new Map<Motor, number>([
    [Motor.diesel, 195],
    [Motor.petrol, CompanyCar.EMISSION_DEFAULT_PETROL],
    [Motor.lpg, CompanyCar.EMISSION_DEFAULT_PETROL],
    [Motor.gas, CompanyCar.EMISSION_DEFAULT_PETROL],
    [Motor.electric, 0]
  ]);

  // Copied over from third table in https://finances.belgium.be/sites/default/files/downloads/121-faq-voitures-de-societe-2025.pdf
  // Minimum amount (in euros) that can be taxed for each fiscal year
  static readonly MIN_AMOUNTS = new Map<number, number>(Object.entries(minAmountsJson).map(([k, v]) => [Number(k), v as number]));
  // Copied over from second table in https://finances.belgium.be/sites/default/files/downloads/121-faq-voitures-de-societe-2025.pdf
  // CO2 emission references for each calendar year for petrol, LPG and natural gas based motor vehicles
  static readonly REF_PETROL = new Map<number, number>(Object.entries(refPetrolJson).map(([k, v]) => [Number(k), v as number]));
  // CO2 emission references for each calendar year for diesel motor vehicles
  static readonly REF_DIESEL = new Map<number, number>(Object.entries(refDieselJson).map(([k, v]) => [Number(k), v as number]));
  // In case of electric cars, the reference is always 0
  static readonly REF_ELECTRIC: Map<number, number> = new Proxy(new Map<number, number>(), {
    get(target, prop) {
      // Always return 0 for any year (number key)
      if (typeof prop === "string" && !isNaN(Number(prop))) {
        return 0;
      }
      // Fallback to normal Map behavior for other properties
      // @ts-ignore
      return target[prop];
    }
  });
  
  static readonly EMISSION_REFERENCES: Map<Motor, Map<number, number>> = new Map([
    [Motor.diesel, CompanyCar.REF_DIESEL],
    [Motor.petrol, CompanyCar.REF_PETROL],
    [Motor.lpg, CompanyCar.REF_PETROL],
    [Motor.gas, CompanyCar.REF_PETROL],
    [Motor.electric, CompanyCar.REF_ELECTRIC]
  ]);

  readonly totalAmount: number;

  constructor(
    readonly fiscalYear: number,
    readonly catalogValue: number,
    readonly registrationDate: Date,
    readonly motor: Motor,
    emissionInput: number | null,
    firstDayAtDisposal: Date | null,
    readonly lastDayAtDisposal: Date | null
  ) {
    const calendarYear = fiscalYear - 1;

    const emissionDefault = CompanyCar.EMISSION_DEFAULT.get(motor);
    const emission = emissionInput ?? emissionDefault ?? 0; // TODO investigate how to properly handle this case

    const emissionReferenceList = CompanyCar.EMISSION_REFERENCES.get(motor);
    // TODO investigate how to properly handle this case
    if (emissionReferenceList === undefined) {
      throw new Error(`No emission reference list found for motor ${motor}`);
    }
    const emissionReference = emissionReferenceList.get(calendarYear);
    // TODO investigate how to properly handle this case
    if (emissionReference === undefined) {
      throw new Error(`No emission reference found for motor ${motor} and year ${calendarYear}`);
    }

    const firstDayOfRegistrationMonth = new Date(registrationDate.getFullYear(), registrationDate.getMonth(), 1);
    const firstDayEntireUsagePeriod = firstDayAtDisposal ?? new Date(calendarYear, 0, 1);
    const lastDayEntireUsagePeriod = new Date(
      (lastDayAtDisposal ?? new Date(fiscalYear, 0, 1)).getTime() - 86400000
    );
    const pivotDay = new Date(calendarYear, registrationDate.getMonth(), 1);

    const firstDayUsagePeriod1 = firstDayEntireUsagePeriod < pivotDay ? firstDayEntireUsagePeriod : null;
    const lastDayUsagePeriod1 =
      lastDayEntireUsagePeriod < pivotDay ? lastDayEntireUsagePeriod :
      firstDayEntireUsagePeriod < pivotDay ? new Date(pivotDay.getTime() - 86400000) :
      null;

    const firstDayUsagePeriod2 =
      pivotDay > lastDayEntireUsagePeriod ? null :
      pivotDay < firstDayEntireUsagePeriod ? firstDayEntireUsagePeriod : pivotDay;

    const lastDayUsagePeriod2 = lastDayEntireUsagePeriod > pivotDay ? lastDayEntireUsagePeriod : null;

    const modifierUsagePeriod2 = calendarYear - registrationDate.getFullYear();
    const modifierUsagePeriod1 = modifierUsagePeriod2 - 1;

    const emissionMinusReference = emission - emissionReference;
    const pctTheoreticalEmission = CompanyCar.PCT_EMISSION_BASE + CompanyCar.PCT_EMISSION_MOD * emissionMinusReference;
    const pctFinalEmission = (
      motor === Motor.electric || pctTheoreticalEmission < CompanyCar.PCT_EMISSION_MIN
        ? CompanyCar.PCT_EMISSION_MIN
        : pctTheoreticalEmission > CompanyCar.PCT_EMISSION_MAX
          ? CompanyCar.PCT_EMISSION_MAX
          : pctTheoreticalEmission
    );

    const calendarDays = (new Date(calendarYear, 11, 31).getDate() === 31) ? 366 : 365;

    const usagePeriod1 = new UsagePeriod(firstDayUsagePeriod1, lastDayUsagePeriod1, modifierUsagePeriod1,
      catalogValue, calendarDays, pctFinalEmission);
    const usagePeriod2 = new UsagePeriod(firstDayUsagePeriod2, lastDayUsagePeriod2, modifierUsagePeriod2,
      catalogValue, calendarDays, pctFinalEmission);

    const totalAmount = usagePeriod1.amount + usagePeriod2.amount;
    const totalDays = usagePeriod1.days + usagePeriod2.days;
    const minTheorecticalAmount = CompanyCar.MIN_AMOUNTS.get(fiscalYear);
    // TODO investigate how to properly handle this case
    if (minTheorecticalAmount === undefined) {
      throw new Error(`No minimum amount found for fiscal year ${fiscalYear}`);
    }
    const minAmount = Math.round(100 * minTheorecticalAmount * totalDays / calendarDays) / 100;

    this.totalAmount = Math.max(totalAmount, minAmount);
  }
}
