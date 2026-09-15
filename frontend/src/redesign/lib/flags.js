import { getFlagCode } from '@/lib/countryCodes';

// OpenF1's country_code is sometimes missing (notably for TBD sessions
// early in a season, like the two placeholder "Bahrain" test-session
// entries), which left cards with no flag. This adds a name-based fallback
// so every race card can show a flag regardless of whether country_code
// came through.
const NAME_TO_ISO2 = {
  bahrain: 'bh',
  'saudi arabia': 'sa',
  australia: 'au',
  china: 'cn',
  japan: 'jp',
  'united states': 'us',
  usa: 'us',
  canada: 'ca',
  monaco: 'mc',
  spain: 'es',
  austria: 'at',
  'great britain': 'gb',
  'united kingdom': 'gb',
  uk: 'gb',
  belgium: 'be',
  hungary: 'hu',
  netherlands: 'nl',
  italy: 'it',
  azerbaijan: 'az',
  singapore: 'sg',
  mexico: 'mx',
  brazil: 'br',
  qatar: 'qa',
  'united arab emirates': 'ae',
  uae: 'ae',
  malaysia: 'my',
  portugal: 'pt',
  france: 'fr',
  germany: 'de',
  turkey: 'tr',
  russia: 'ru',
  argentina: 'ar',
  'south africa': 'za',
};

export function resolveFlagCode({ countryCode, country, location }) {
  const fromCode = getFlagCode(countryCode);
  if (fromCode) return fromCode;

  const candidates = [country, location].filter(Boolean).map((s) => s.toLowerCase());
  for (const candidate of candidates) {
    if (NAME_TO_ISO2[candidate]) return NAME_TO_ISO2[candidate];
    const match = Object.keys(NAME_TO_ISO2).find((name) => candidate.includes(name));
    if (match) return NAME_TO_ISO2[match];
  }
  return null;
}
