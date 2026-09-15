export const iso3to2 = {
  AUS: 'au', AUT: 'at', AZE: 'az', BHR: 'bh', BEL: 'be', BRA: 'br',
  CAN: 'ca', CHN: 'cn', ESP: 'es', GBR: 'gb', HUN: 'hu', ITA: 'it',
  JPN: 'jp', KSA: 'sa', MCO: 'mc', MEX: 'mx', NLD: 'nl', PRT: 'pt',
  QAT: 'qa', SGP: 'sg', UAE: 'ae', USA: 'us', ARE: 'ae', ARG: 'ar',
  RSA: 'za', ZAF: 'za', MYS: 'my', RUS: 'ru', TUR: 'tr', FRA: 'fr',
  DEU: 'de', GER: 'de'
};

export function getFlagCode(countryCode) {
  if (!countryCode) return null;
  return iso3to2[countryCode.toUpperCase()] || null;
}