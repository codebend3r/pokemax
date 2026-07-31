import { parse } from 'node-html-parser';

export interface NpcTrade {
  versions: string[]; // PokéAPI version names
  give: string; // PokéAPI species slug the player hands over
  receive: string; // PokéAPI species slug the player gets
  location: string;
}

// Bulbapedia "List of in-game trades" section ids → affected versions.
// Sections not listed (Stadium, XD, Ranch, unused/debug trades, Yancy/Curtis
// repeatable trades, Legends Z-A placeholder) are deliberately skipped.
// prettier-ignore
const TRADE_SECTIONS: Record<string, string[]> = {
  'Pokémon_Red_and_Green_(Japan),_Pokémon_Red_and_Blue_(Western)': ['red', 'blue'],
  'Pokémon_Yellow': ['yellow'],
  'Pokémon_Gold,_Silver,_and_Crystal': ['gold', 'silver', 'crystal'],
  'Pokémon_Ruby_and_Sapphire': ['ruby', 'sapphire'],
  'Pokémon_FireRed_and_LeafGreen': ['firered', 'leafgreen'],
  'Pokémon_Emerald': ['emerald'],
  'Pokémon_Diamond,_Pearl,_and_Platinum': ['diamond', 'pearl', 'platinum'],
  'Pokémon_HeartGold_and_SoulSilver': ['heartgold', 'soulsilver'],
  'Pokémon_Black_and_White': ['black', 'white'],
  'Pokémon_Black_2_and_White_2': ['black-2', 'white-2'],
  'Pokémon_X_and_Y': ['x', 'y'],
  'Pokémon_Omega_Ruby_and_Alpha_Sapphire': ['omega-ruby', 'alpha-sapphire'],
  'Pokémon_Sun_and_Moon': ['sun', 'moon'],
  'Pokémon_Ultra_Sun_and_Ultra_Moon': ['ultra-sun', 'ultra-moon'],
  "Pokémon:_Let's_Go,_Pikachu!_and_Let's_Go,_Eevee!": ['lets-go-pikachu', 'lets-go-eevee'],
  'Pokémon_Sword_and_Shield': ['sword', 'shield'],
  'The_Isle_of_Armor': ['sword', 'shield'],
  'Pokémon_Brilliant_Diamond_and_Shining_Pearl': ['brilliant-diamond', 'shining-pearl'],
  'Pokémon_Scarlet_and_Violet': ['scarlet', 'violet'],
  'The_Indigo_Disk': ['scarlet', 'violet'],
};

// prettier-ignore
const SLUG_OVERRIDES: Record<string, string> = {
  'nidoran♀': 'nidoran-f', 'nidoran♂': 'nidoran-m',
  "farfetch'd": 'farfetchd',
  "sirfetch'd": 'sirfetchd',
  'mr. mime': 'mr-mime', 'mr. rime': 'mr-rime', 'mime jr.': 'mime-jr',
  'type: null': 'type-null', 'flabébé': 'flabebe',
};

export function bulbaNameToSlug(name: string): string {
  const lower = name.trim().toLowerCase();
  const override = SLUG_OVERRIDES[lower];
  if (override) return override;
  return lower
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.:'’]/g, '')
    .replace(/\s+/g, '-');
}

function speciesFromRow(rowHtml: string): string[] {
  const names: string[] = [];
  const re = /title="([^"]+) \(Pokémon\)"/g;
  let m = re.exec(rowHtml);
  while (m) {
    const slug = bulbaNameToSlug(m[1]);
    if (names[names.length - 1] !== slug) names.push(slug);
    m = re.exec(rowHtml);
  }
  return names;
}

export function parseTradeLists(html: string): NpcTrade[] {
  const trades: NpcTrade[] = [];
  // Split into sections on headline spans; the id attribute carries the key.
  const parts = html.split(/<span class="mw-headline" id="/);
  for (const part of parts.slice(1)) {
    const idEnd = part.indexOf('"');
    if (idEnd < 0) continue;
    const versions = TRADE_SECTIONS[part.slice(0, idEnd)];
    if (!versions) continue;
    const root = parse(part.slice(idEnd));
    for (const table of root.querySelectorAll('table')) {
      const headerText = table
        .querySelectorAll('th')
        .map((th) => th.text)
        .join(' ');
      if (!headerText.includes("Player's Pokémon")) continue;
      for (const tr of table.querySelectorAll('tr')) {
        const tds = tr.querySelectorAll('td');
        if (tds.length < 3) continue;
        const species = speciesFromRow(tr.innerHTML);
        if (species.length < 2) continue;
        trades.push({
          versions,
          give: species[0],
          receive: species[1],
          location: tds[0].text.replace(/\s+/g, ' ').trim(),
        });
      }
    }
  }
  return trades;
}
