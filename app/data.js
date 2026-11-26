/* StatAtlas data: twelve countries, six headline indicators each.
   Figures are the latest published values from the World Bank, the
   United Nations and the International Labour Organization, as noted
   beside each indicator. Values are stored in plain units so the
   charts and tables can format them: population in millions, GDP in
   billions of current US dollars, GDP per person in current US
   dollars, life expectancy in years, unemployment in percent of the
   labour force, land area in square kilometres. */
'use strict';

const INDICATORS = [
  {
    key: 'population',
    label: 'Population',
    unit: 'million people',
    source: 'UN World Population Prospects 2024, mid-year estimate',
    year: 2024,
    format: function (v) { return v.toFixed(1) + ' m'; },
    about: 'How many people live in the country.'
  },
  {
    key: 'gdp',
    label: 'GDP',
    unit: 'billion US dollars',
    source: 'World Bank, World Development Indicators NY.GDP.MKTP.CD',
    year: 2024,
    format: function (v) { return '$' + v.toLocaleString('en-US') + ' bn'; },
    about: 'The value of everything the economy produces in a year.'
  },
  {
    key: 'gdpPerCap',
    label: 'GDP per person',
    unit: 'US dollars',
    source: 'World Bank, World Development Indicators NY.GDP.PCAP.CD',
    year: 2024,
    format: function (v) { return '$' + v.toLocaleString('en-US'); },
    about: 'Average economic output per resident.'
  },
  {
    key: 'life',
    label: 'Life expectancy',
    unit: 'years',
    source: 'World Bank, World Development Indicators SP.DYN.LE00.IN',
    year: 2023,
    format: function (v) { return v.toFixed(1) + ' years'; },
    about: 'How long a newborn is expected to live at current death rates.'
  },
  {
    key: 'unemp',
    label: 'Unemployment',
    unit: 'percent of labour force',
    source: 'ILO modelled estimate; China: urban surveyed rate',
    year: 2024,
    format: function (v) { return v.toFixed(1) + '%'; },
    about: 'Share of the labour force without work but looking for it.'
  },
  {
    key: 'growth',
    label: 'GDP growth',
    unit: 'percent per year',
    source: 'World Bank, World Development Indicators NY.GDP.MKTP.KD.ZG',
    year: 2024,
    format: function (v) { return (v > 0 ? '+' : '') + v.toFixed(1) + '%'; },
    about: 'How fast the economy grew compared with the year before.'
  }
];

const COUNTRIES = [
  {
    code: 'ind', name: 'India', region: 'South Asia', capital: 'New Delhi',
    area: 3287263, population: 1450.9, gdp: 3910, gdpPerCap: 2695,
    life: 72.0, unemp: 4.2, growth: 6.5,
    trend: [1396.4, 1411.0, 1425.2, 1438.7, 1450.9],
    profile: 'The world\u2019s most populous country since 2023, and its fastest-growing large economy in 2024.'
  },
  {
    code: 'chn', name: 'China', region: 'East Asia', capital: 'Beijing',
    area: 9596961, population: 1409.0, gdp: 18740, gdpPerCap: 13300,
    life: 78.6, unemp: 5.1, growth: 5.0,
    trend: [1439.3, 1425.9, 1411.8, 1410.7, 1409.0],
    profile: 'The second-largest economy and the largest by purchasing power, with a population now shrinking slowly.'
  },
  {
    code: 'usa', name: 'United States', region: 'North America', capital: 'Washington, D.C.',
    area: 9833517, population: 340.1, gdp: 29180, gdpPerCap: 85800,
    life: 78.4, unemp: 4.0, growth: 2.8,
    trend: [335.9, 337.0, 338.3, 339.5, 340.1],
    profile: 'The world\u2019s largest economy, producing about a quarter of global output in 2024.'
  },
  {
    code: 'jpn', name: 'Japan', region: 'East Asia', capital: 'Tokyo',
    area: 377975, population: 124.0, gdp: 4030, gdpPerCap: 32500,
    life: 84.0, unemp: 2.5, growth: -0.2,
    trend: [126.1, 125.7, 125.1, 124.6, 124.0],
    profile: 'The oldest large society on earth, with the second-longest life expectancy of the countries here.'
  },
  {
    code: 'deu', name: 'Germany', region: 'Western Europe', capital: 'Berlin',
    area: 357588, population: 84.6, gdp: 4660, gdpPerCap: 55100,
    life: 81.7, unemp: 3.4, growth: -0.5,
    trend: [83.2, 83.2, 83.8, 84.5, 84.6],
    profile: 'Europe\u2019s largest economy, built on manufacturing and exports, which shrank slightly in 2024.'
  },
  {
    code: 'gbr', name: 'United Kingdom', region: 'Western Europe', capital: 'London',
    area: 242495, population: 69.3, gdp: 3730, gdpPerCap: 53800,
    life: 81.2, unemp: 4.3, growth: 1.1,
    trend: [67.7, 68.1, 68.5, 68.9, 69.3],
    profile: 'The sixth-largest economy, where services make up about four fifths of output.'
  },
  {
    code: 'fra', name: 'France', region: 'Western Europe', capital: 'Paris',
    area: 551695, population: 68.2, gdp: 3140, gdpPerCap: 46000,
    life: 83.3, unemp: 7.4, growth: 1.1,
    trend: [67.8, 68.0, 68.1, 68.2, 68.2],
    profile: 'Western Europe\u2019s second-largest economy, with the highest unemployment of the European countries here.'
  },
  {
    code: 'bra', name: 'Brazil', region: 'South America', capital: 'Bras\u00edlia',
    area: 8515767, population: 216.4, gdp: 2170, gdpPerCap: 10030,
    life: 76.3, unemp: 6.6, growth: 3.4,
    trend: [213.2, 214.3, 215.3, 215.8, 216.4],
    profile: 'South America\u2019s largest country and economy, home to about half the continent\u2019s people.'
  },
  {
    code: 'can', name: 'Canada', region: 'North America', capital: 'Ottawa',
    area: 9984670, population: 39.7, gdp: 2240, gdpPerCap: 56400,
    life: 82.6, unemp: 6.3, growth: 1.5,
    trend: [38.0, 38.2, 39.0, 39.6, 39.7],
    profile: 'The world\u2019s second-largest country by land, with one of its lowest population densities.'
  },
  {
    code: 'aus', name: 'Australia', region: 'Oceania', capital: 'Canberra',
    area: 7692024, population: 26.7, gdp: 1800, gdpPerCap: 67400,
    life: 83.1, unemp: 4.0, growth: 1.0,
    trend: [25.7, 25.9, 26.1, 26.4, 26.7],
    profile: 'A continent-sized country of 27 million people, most of them living within a short drive of the coast.'
  },
  {
    code: 'che', name: 'Switzerland', region: 'Western Europe', capital: 'Bern',
    area: 41285, population: 8.9, gdp: 930, gdpPerCap: 104500,
    life: 84.2, unemp: 4.4, growth: 1.3,
    trend: [8.6, 8.7, 8.8, 8.9, 8.9],
    profile: 'The longest-lived population in this set, and the richest per person by a wide margin.'
  },
  {
    code: 'nga', name: 'Nigeria', region: 'West Africa', capital: 'Abuja',
    area: 923768, population: 232.7, gdp: 188, gdpPerCap: 808,
    life: 54.6, unemp: 4.3, growth: 3.4,
    trend: [213.4, 218.5, 223.8, 229.2, 232.7],
    profile: 'Africa\u2019s most populous country, adding about five million people a year, with the lowest life expectancy here.'
  }
];

const TREND_YEARS = [2020, 2021, 2022, 2023, 2024];

function countryByCode(code) {
  for (var i = 0; i < COUNTRIES.length; i++) {
    if (COUNTRIES[i].code === code) return COUNTRIES[i];
  }
  return null;
}

function indicatorByKey(key) {
  for (var i = 0; i < INDICATORS.length; i++) {
    if (INDICATORS[i].key === key) return INDICATORS[i];
  }
  return INDICATORS[0];
}

function densityOf(country) {
  return country.population * 1000000 / country.area;
}
