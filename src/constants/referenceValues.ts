// Copied over from second table in https://finances.belgium.be/sites/default/files/downloads/121-faq-voitures-de-societe-2025.pdf
// CO2 emission references for each calendar year for petrol, LPG and natural gas based motor vehicles
export const refPetrol = new Map<number, number>([
    [2012, 115],
    [2013, 116],
    [2014, 112],
    [2015, 110],
    [2016, 107],
    [2017, 105],
    [2018, 105],
    [2019, 107],
    [2020, 111],
    [2021, 102],
    [2022, 91],
    [2023, 82],
    [2024, 78],
    [2025, 71]
]);

// CO2 emission references for each calendar year for diesel motor vehicles
export const refDiesel = new Map<number, number>([
    [2012, 95], 
    [2013, 95], 
    [2014, 93], 
    [2015, 91], 
    [2016, 89], 
    [2017, 87],
    [2018, 86], 
    [2019, 88], 
    [2020, 91], 
    [2021, 84], 
    [2022, 75], 
    [2023, 67],
    [2024, 65],
    [2025, 59]
]);

// CO2 emission references for each calendar year for electric vehicles
export const refElectric = new Map<number, number>([
    [2012, 0], 
    [2013, 0], 
    [2014, 0], 
    [2015, 0], 
    [2016, 0], 
    [2017, 0],
    [2018, 0], 
    [2019, 0], 
    [2020, 0], 
    [2021, 0], 
    [2022, 0], 
    [2023, 0],
    [2024, 0],
    [2025, 0]
]);

// Copied over from third table in https://finances.belgium.be/sites/default/files/downloads/121-faq-voitures-de-societe-2025.pdf
// Minimum amount (in euros) that can be taxed for each fiscal year
export const minAmounts = new Map<number, number>([
    [2013, 1200],
    [2014, 1230],
    [2015, 1250],
    [2016, 1250],
    [2017, 1260],
    [2018, 1280],
    [2019, 1310],
    [2020, 1340],
    [2021, 1360],
    [2022, 1370],
    [2023, 1400],
    [2024, 1540],
    [2025, 1600],
    [2026, 1650]
]);