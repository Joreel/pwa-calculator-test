import { test, expect } from 'vitest';
import { Motor } from '../../src/models/motor';
import { CompanyCar } from '../../src/models/companyCar';

type TestCase = [
  fiscalYear: number,
  catalogValue: number,
  registrationDate: Date,
  motor: Motor,
  emissionInput: number | null,
  firstDayAtDisposal: Date | null,
  lastDayAtDisposal: Date | null,
  totalAmount: number
];

const testCases: TestCase[] = [
  [2013, 30000.00, new Date(2011, 5, 21), Motor.petrol, 120, null, null, 1488.73],
  [2021, 30000.00, new Date(2019, 5, 21), Motor.petrol, 120, null, null, 1587.98],
  
  [2013, 37500.00, new Date(2012, 7, 30), Motor.petrol, 127, new Date(2012, 8, 17), null, 623.71],
  [2021, 37500.00, new Date(2020, 7, 30), Motor.petrol, 127, new Date(2020, 8, 17), null, 660.95],
  
  [2013, 30000.00, new Date(2011, 4, 20), Motor.diesel, 112, null, new Date(2012, 7, 8), 1082.83],
  [2021, 30000.00, new Date(2019, 4, 20), Motor.diesel, 112, null, new Date(2020, 7, 8), 1142.99],
  
  [2013, 25000.00, new Date(2008, 9, 5), Motor.petrol, 112, new Date(2012, 2, 1), new Date(2012, 2, 31), 98.36],
  [2021, 25000.00, new Date(2016, 9, 5), Motor.petrol, 112, new Date(2020, 2, 1), new Date(2020, 2, 31), 111.48],
  
  [2013, 30000.00, new Date(2009, 9, 5), Motor.petrol, 120, null, new Date(2012, 6, 10), 708.53],
  [2021, 30000.00, new Date(2017, 9, 5), Motor.petrol, 120, null, new Date(2020, 6, 10), 755.77],
  
  [2013, 35000.00, new Date(2012, 6, 5), Motor.diesel, 100, new Date(2012, 6, 10), null, 860.66],
  [2021, 35000.00, new Date(2020, 6, 5), Motor.diesel, 100, new Date(2020, 6, 10), null, 918.03],
  
  [2013, 20000.00, new Date(2010, 4, 5), Motor.petrol, 110, new Date(2012, 2, 1), new Date(2012, 5, 1), 301.64],
  [2021, 20000.00, new Date(2018, 4, 5), Motor.petrol, 110, new Date(2020, 2, 1), new Date(2020, 5, 1), 341.86],
  
  [2013, 40000.00, new Date(2012, 4, 31), Motor.diesel, 120, new Date(2012, 5, 1), null, 1603.75],
  [2021, 40000.00, new Date(2020, 4, 31), Motor.diesel, 120, new Date(2020, 5, 1), null, 1683.93],
];

test.each(testCases)(
  'The correct total amount for fiscal year %i is returned',
  (fiscalYear, catalogValue, registrationDate, motor, emissionInput, firstDayAtDisposal, lastDayAtDisposal, expectedTotalAmount) => {
    const companyCar = new CompanyCar(
      fiscalYear,
      catalogValue,
      registrationDate,
      motor,
      emissionInput,
      firstDayAtDisposal,
      lastDayAtDisposal
    );
    expect(companyCar.finalAmount).toEqual(expectedTotalAmount);
  }
);
