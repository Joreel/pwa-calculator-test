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
  static readonly CALENDAR_YEARS = Array.from(Object.keys(refPetrolJson));
  static readonly REF_ELECTRIC = new Map<number, number>(
    CompanyCar.CALENDAR_YEARS.map(year => [Number(year), 0])
  );
  
  static readonly EMISSION_REFERENCES: Map<Motor, Map<number, number>> = new Map([
    [Motor.diesel, CompanyCar.REF_DIESEL],
    [Motor.petrol, CompanyCar.REF_PETROL],
    [Motor.lpg, CompanyCar.REF_PETROL],
    [Motor.gas, CompanyCar.REF_PETROL],
    [Motor.electric, CompanyCar.REF_ELECTRIC]
  ]);

  readonly finalAmount: number;
  readonly defaultEmission: number;
  readonly firstDayOfRegistrationMonth: Date;
  readonly firstDayEntireUsagePeriod: Date;
  readonly lastDayEntireUsagePeriod: Date;
  readonly usagePeriod1: UsagePeriod;
  readonly usagePeriod2: UsagePeriod;
  readonly emission: number;
  readonly emissionReference: number;
  readonly emissionMinusReference: number;
  readonly pctFinalEmission: number;
  readonly pctTheoreticalEmission: number;
  readonly calendarYear: number;
  readonly daysInCalendarYear: number;
  readonly totalAmount: number;
  readonly totalDays: number;
  readonly minAmount: number;
  readonly theoreticalMinAmount: number;

  constructor(
    readonly fiscalYear: number,
    readonly catalogValue: number,
    readonly registrationDate: Date,
    readonly motor: Motor,
    emissionInput: number | null,
    firstDayAtDisposal: Date | null,
    readonly lastDayAtDisposal: Date | null
  ) {
    this.calendarYear = fiscalYear - 1;

    this.defaultEmission = CompanyCar.EMISSION_DEFAULT.get(motor) ?? 0; // TODO investigate how to properly handle this case
    this.emission = emissionInput ?? this.defaultEmission; // TODO investigate how to properly handle this case

    const emissionReferenceList = CompanyCar.EMISSION_REFERENCES.get(motor);
    // TODO investigate how to properly handle this case
    if (emissionReferenceList === undefined) {
      throw new Error(`No emission reference list found for motor ${motor}`);
    }
    this.emissionReference = emissionReferenceList.get(this.calendarYear) ?? 0; // TODO investigate how to properly handle this case
    // TODO investigate how to properly handle this case
    if (this.emissionReference === undefined) {
      throw new Error(`No emission reference found for motor ${motor} and year ${this.calendarYear}`);
    }

    this.firstDayOfRegistrationMonth = new Date(registrationDate.getFullYear(), registrationDate.getMonth(), 1);
    this.firstDayEntireUsagePeriod = firstDayAtDisposal ?? new Date(this.calendarYear, 0, 1);
    this.lastDayEntireUsagePeriod = new Date(
      (lastDayAtDisposal ?? new Date(fiscalYear, 0, 1)).getTime() - 86400000
    );
    const pivotDay = new Date(this.calendarYear, registrationDate.getMonth(), 1);

    const firstDayUsagePeriod1 = this.firstDayEntireUsagePeriod < pivotDay ? this.firstDayEntireUsagePeriod : null;
    const lastDayUsagePeriod1 =
      this.lastDayEntireUsagePeriod < pivotDay ? this.lastDayEntireUsagePeriod :
      this.firstDayEntireUsagePeriod < pivotDay ? new Date(pivotDay.getTime() - 86400000) :
      null;

    const firstDayUsagePeriod2 =
      pivotDay > this.lastDayEntireUsagePeriod ? null :
      pivotDay < this.firstDayEntireUsagePeriod ? this.firstDayEntireUsagePeriod : pivotDay;

    const lastDayUsagePeriod2 = this.lastDayEntireUsagePeriod > pivotDay ? this.lastDayEntireUsagePeriod : null;

    const modifierUsagePeriod2 = this.calendarYear - registrationDate.getFullYear();
    const modifierUsagePeriod1 = modifierUsagePeriod2 - 1;

    this.emissionMinusReference = this.emission - this.emissionReference;
    this.pctTheoreticalEmission = CompanyCar.PCT_EMISSION_BASE + CompanyCar.PCT_EMISSION_MOD * this.emissionMinusReference;
    this.pctFinalEmission = (
      motor === Motor.electric || this.pctTheoreticalEmission < CompanyCar.PCT_EMISSION_MIN
        ? CompanyCar.PCT_EMISSION_MIN
        : this.pctTheoreticalEmission > CompanyCar.PCT_EMISSION_MAX
          ? CompanyCar.PCT_EMISSION_MAX
          : this.pctTheoreticalEmission
    );

    this.daysInCalendarYear = (new Date(this.calendarYear, 11, 31).getDate() === 31) ? 366 : 365;

    this.usagePeriod1 = new UsagePeriod(firstDayUsagePeriod1, lastDayUsagePeriod1, modifierUsagePeriod1,
      catalogValue, this.daysInCalendarYear, this.pctFinalEmission);
    this.usagePeriod2 = new UsagePeriod(firstDayUsagePeriod2, lastDayUsagePeriod2, modifierUsagePeriod2,
      catalogValue, this.daysInCalendarYear, this.pctFinalEmission);

    this.totalAmount = this.usagePeriod1.amount + this.usagePeriod2.amount;
    this.totalDays = this.usagePeriod1.days + this.usagePeriod2.days;
    this.theoreticalMinAmount = CompanyCar.MIN_AMOUNTS.get(fiscalYear) ?? 0; // TODO investigate how to properly handle this case
    // TODO investigate how to properly handle this case
    if (this.theoreticalMinAmount === undefined) {
      throw new Error(`No minimum amount found for fiscal year ${fiscalYear}`);
    }
    this.minAmount = Math.round(100 * this.theoreticalMinAmount * this.totalDays / this.daysInCalendarYear) / 100;

    this.finalAmount = Math.max(this.totalAmount, this.minAmount);
  }
}
