import { differenceInDays } from "date-fns";

export class UsagePeriod {
  static readonly PCT_CATALOG_VALUE_MOD = 0.06;
  static readonly PCT_CATALOG_VALUE_MIN = 0.7;
  static readonly NUMERATOR = 6;
  static readonly DENOMINATOR = 7;

  days: number;
  pctCatalogValue: number;
  amount: number;

  constructor(
    firstDay: Date | null,
    lastDay: Date | null,
    modifier: number,
    catalogValue: number,
    calendarDays: number,
    pctEmission: number
  ) {
    this.days = (!firstDay || !lastDay)
      ? 0
      : differenceInDays(lastDay, firstDay) + 1;

    const pctTheorique = 1 - UsagePeriod.PCT_CATALOG_VALUE_MOD * modifier;
    this.pctCatalogValue = Math.max(pctTheorique, UsagePeriod.PCT_CATALOG_VALUE_MIN);

    const result = catalogValue * 
      this.pctCatalogValue * 
      pctEmission *
      (this.days / calendarDays) * 
      UsagePeriod.NUMERATOR / UsagePeriod.DENOMINATOR
    this.amount = Math.round(result * 100) / 100;
  }
}
