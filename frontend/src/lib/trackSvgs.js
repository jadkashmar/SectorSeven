const REPO_BASE = 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/detailed/white-outline';

export const trackSvgFiles = {
  austin: 'austin-1.svg',
  sakhir: 'bahrain-1.svg',        // OpenF1 uses "Sakhir" for Bahrain
  baku: 'baku-1.svg',
  barcelona: 'catalunya-6.svg',   // OpenF1 likely says "Barcelona", file is "catalunya"
  hungaroring: 'hungaroring-3.svg',
  interlagos: 'interlagos-2.svg', // OpenF1 may say "São Paulo" instead — verify
  jeddah: 'jeddah-1.svg',
  'las vegas': 'las-vegas-1.svg', // verify exact OpenF1 string, may need key adjustment
  lusail: 'lusail-1.svg',
  madrid: 'madring-1.svg',        // note: source file is misspelled "madring"
  'marina bay': 'marina-bay-4.svg',
  melbourne: 'melbourne-2.svg',
  'mexico city': 'mexico-city-3.svg',
  miami: 'miami-1.svg',
  'monte carlo': 'monaco-6.svg',  // OpenF1 confirmed uses "Monte Carlo"
  montreal: 'montreal-6.svg',
  monza: 'monza-7.svg',
  sepang: 'sepang-1.svg',
  shanghai: 'shanghai-1.svg',
  silverstone: 'silverstone-8.svg',
  'spa-francorchamps': 'spa-francorchamps-4.svg',
  spielberg: 'spielberg-3.svg',
  suzuka: 'suzuka-2.svg',
  'yas marina': 'yas-marina-2.svg',
  zandvoort: 'zandvoort-5.svg',
};

export function getTrackSvgUrl(circuitShortName) {
  if (!circuitShortName) return null;
  const key = circuitShortName.toLowerCase();
  const filename = trackSvgFiles[key];
  return filename ? `${REPO_BASE}/${filename}` : null;
}
