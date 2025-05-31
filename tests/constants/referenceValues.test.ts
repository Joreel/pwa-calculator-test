import { test, expect } from 'vitest';
import { minAmounts, refDiesel, refElectric, refPetrol } from '../../src/constants/referenceValues';

test('Constant lists contain the same amount of years', () => {
  expect(refPetrol.size).toEqual(refDiesel.size);
  expect(refPetrol.size).toEqual(refElectric.size);
  expect(refPetrol.size).toEqual(minAmounts.size);
});
