import { differenceInDays } from "date-fns";

export class UsagePeriod {
  static readonly PCT_CATALOG_VALUE_MOD = 0.06;
  static readonly PCT_CATALOG_VALUE_MIN = 0.7;
  static readonly NUMERATOR = 6;
  static readonly DENOMINATOR = 7;

  // TODO Define which variables below to UsagePeriod and should be accessible by it
  readonly firstDay: Date | null;
  readonly lastDay: Date | null;
  readonly days: number;
  readonly pctCatalogValue: number;
  readonly amount: number;
  readonly pctEmission: number;
  
  constructor(
    firstDay: Date | null,
    lastDay: Date | null,
    modifier: number,
    catalogValue: number,
    daysInCalendarYear: number,
    pctEmission: number
  ) {
    this.firstDay = firstDay;
    this.lastDay = lastDay;
    this.pctEmission = pctEmission;
    this.days = (!this.firstDay || !this.lastDay)
      ? 0
      : differenceInDays(this.lastDay, this.firstDay) + 1;

    const pctTheorique = 1 - UsagePeriod.PCT_CATALOG_VALUE_MOD * modifier;
    this.pctCatalogValue = Math.max(pctTheorique, UsagePeriod.PCT_CATALOG_VALUE_MIN);

    const result = catalogValue * 
      this.pctCatalogValue * 
      pctEmission *
      (this.days / daysInCalendarYear) * 
      UsagePeriod.NUMERATOR / UsagePeriod.DENOMINATOR
    this.amount = Math.round(result * 100) / 100;
  }
}
