import { test, expect } from 'vitest';
import refPetrolJson from '../../src/referenceTables/refPetrol.json';
import refDieselJson from '../../src/referenceTables/refDiesel.json';
import minAmountsJson from '../../src/referenceTables/minAmounts.json';

test('Reference tables contain the same amount of years', () => {
  expect(Object.keys(refPetrolJson).length).toEqual(Object.keys(refDieselJson).length);
  expect(Object.keys(refPetrolJson).length).toEqual(Object.keys(minAmountsJson).length);
});
