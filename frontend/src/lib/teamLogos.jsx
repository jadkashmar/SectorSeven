export const teamLogos = [
  { match: 'red bull', url: 'https://fraternitysororitysvg.com/assets/images/products/Red-Two-Bull.png' },
  { match: 'mclaren', url: 'https://img.icons8.com/ios_filled/512/FD7E14/mclaren.png' },
  { match: 'mercedes', url: 'https://images.seeklogo.com/logo-png/37/2/mercedes-benz-logo-png_seeklogo-370725.png' },
  { match: 'ferrari', url: 'https://upload.wikimedia.org/wikipedia/de/thumb/c/c0/Scuderia_Ferrari_Logo.svg/500px-Scuderia_Ferrari_Logo.svg.png' },
  { match: 'haas', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Logo_Haas_F1.png?_=20161123050608' },
  { match: 'cadillac', url: 'https://images.seeklogo.com/logo-png/32/2/cadillac-logo-png_seeklogo-326357.png' },
  { match: 'audi', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Audif1.com_logo17.svg/3840px-Audif1.com_logo17.svg.png' },
  { match: 'alpine', url: 'https://brandlogos.net/wp-content/uploads/2022/08/alpine_logomark-logo_brandlogos.net_pzhvz.png' },
  { match: 'racing bulls', url: 'https://upload.wikimedia.org/wikipedia/it/a/a3/RB-Racing_Bulls_Logo.png?utm_source=it.wikipedia.org&utm_campaign=index&utm_content=original' },
  { match: 'rb', url: 'https://upload.wikimedia.org/wikipedia/it/a/a3/RB-Racing_Bulls_Logo.png?utm_source=it.wikipedia.org&utm_campaign=index&utm_content=original' },
  { match: 'williams', url: 'https://paddock212.com/cdn/shop/collections/ChatGPT_Image_21_aout_2025_01_43_35.png?v=1772893306&width=2000' },
  { match: 'aston martin', url: 'https://iconape.com/wp-content/png_logo_vector/aston-martin.png' },
];

export function getTeamLogo(teamName) {
  if (!teamName) return null;
  const lower = teamName.toLowerCase();
  const found = teamLogos.find((t) => lower.includes(t.match));
  return found ? found.url : null;
}