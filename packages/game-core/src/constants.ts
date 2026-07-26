import type { Country, Friend, TopWord } from './types'

export const DEFAULT_PROPS = Object.freeze({
  youCardColor: '#00c9b8',
  oppCardColor: '#ff4d6d',
  oppSide: 'masked typing',
  matchFormat: 'best of 3',
  timerSeconds: 15,
  botSkill: 'fair' as 'easy' | 'fair' | 'brutal',
  panicFx: true,
} as const)

export const EMOJI_MAP: readonly (readonly [string, string])[] = [
  ['black hole', '🕳️'], ['time machine', '⏳'], ['rubber chicken', '🐔'], ['super glue', '🧴'],
  ['pocket sand', '🏜️'], ['freeze ray', '❄️'], ['moon gravity', '🌕'], ['sleep paralysis', '😱'],
  ['peer pressure', '😰'], ['hot sauce', '🌶️'],
  ['volcano', '🌋'], ['lava', '🌋'], ['magma', '🌋'], ['fire', '🔥'], ['flame', '🔥'], ['inferno', '🔥'],
  ['tsunami', '🌊'], ['ocean', '🌊'], ['wave', '🌊'], ['water', '💧'], ['rain', '🌧️'], ['flood', '🌊'],
  ['ice', '🧊'], ['freeze', '🧊'], ['frost', '❄️'], ['snow', '❄️'], ['blizzard', '❄️'], ['glacier', '🧊'],
  ['tornado', '🌪️'], ['hurricane', '🌪️'], ['storm', '⛈️'], ['wind', '🌬️'], ['fog', '🌫️'], ['cloud', '☁️'],
  ['lightning', '⚡'], ['thunder', '⚡'], ['electric', '⚡'], ['static', '⚡'], ['shock', '⚡'],
  ['sun', '☀️'], ['solar', '☀️'], ['moon', '🌙'], ['star', '⭐'], ['galaxy', '🌌'], ['space', '🛸'],
  ['alien', '👽'], ['rocket', '🚀'], ['meteor', '☄️'], ['comet', '☄️'], ['asteroid', '☄️'], ['gravity', '🌍'],
  ['earthquake', '🫨'], ['earth', '🌍'], ['rock', '🪨'], ['stone', '🪨'], ['boulder', '🪨'], ['mountain', '⛰️'],
  ['paper', '📄'], ['scissor', '✂️'], ['sword', '⚔️'], ['knife', '🔪'], ['axe', '🪓'], ['hammer', '🔨'],
  ['drill', '🪛'], ['diamond', '💎'], ['gold', '🪙'], ['money', '💰'], ['tax', '🧾'], ['audit', '🧾'],
  ['bureaucracy', '📋'], ['paperwork', '📋'], ['lawyer', '⚖️'], ['law', '⚖️'], ['judge', '⚖️'],
  ['ghost', '👻'], ['haunt', '👻'], ['curse', '🏺'], ['doll', '🪆'], ['zombie', '🧟'], ['vampire', '🧛'],
  ['demon', '😈'], ['devil', '😈'], ['angel', '😇'], ['god', '✨'], ['wizard', '🧙'], ['witch', '🧙'],
  ['magic', '🪄'], ['spell', '🪄'], ['potion', '🧪'], ['dragon', '🐉'], ['dino', '🦖'], ['t-rex', '🦖'],
  ['shark', '🦈'], ['bear', '🐻'], ['lion', '🦁'], ['tiger', '🐯'], ['wolf', '🐺'], ['goose', '🪿'],
  ['duck', '🦆'], ['chicken', '🐔'], ['panda', '🐼'], ['cat', '🐱'], ['dog', '🐶'], ['snake', '🐍'],
  ['spider', '🕷️'], ['bee', '🐝'], ['goat', '🐐'], ['horse', '🐴'], ['octopus', '🐙'], ['kraken', '🐙'],
  ['whale', '🐋'], ['toddler', '👶'], ['baby', '👶'], ['grandma', '👵'], ['mom', '👩'], ['dad', '👨'],
  ['hug', '🤗'], ['love', '❤️'], ['heart', '❤️'], ['kiss', '💋'], ['friendship', '🫂'],
  ['banana', '🍌'], ['pizza', '🍕'], ['taco', '🌮'], ['cheese', '🧀'], ['garlic', '🧄'], ['onion', '🧅'],
  ['egg', '🥚'], ['potato', '🥔'], ['pineapple', '🍍'], ['watermelon', '🍉'], ['pepper', '🌶️'],
  ['sock', '🧦'], ['shoe', '👟'], ['slipper', '🥿'], ['sand', '🏜️'], ['time', '⏰'], ['clock', '⏰'],
  ['mirror', '🪞'], ['glitter', '✨'], ['bomb', '💣'], ['nuke', '☢️'], ['explosion', '💥'], ['boom', '💥'],
  ['magnet', '🧲'], ['robot', '🤖'], ['ai', '🤖'], ['computer', '💻'], ['wifi', '📶'], ['internet', '📶'],
  ['phone', '📱'], ['virus', '🦠'], ['germ', '🦠'], ['poison', '☠️'], ['skull', '💀'], ['death', '💀'],
  ['rainbow', '🌈'], ['flower', '🌸'], ['tree', '🌳'], ['forest', '🌲'], ['mushroom', '🍄'],
  ['book', '📚'], ['library', '📚'], ['pencil', '✏️'], ['pen', '🖊️'], ['music', '🎵'], ['guitar', '🎸'],
  ['karate', '🥋'], ['ninja', '🥷'], ['king', '👑'], ['queen', '👑'], ['crown', '👑'],
  ['dream', '💭'], ['nightmare', '😱'], ['vhs', '📼'], ['tape', '📼'], ['tv', '📺'], ['camera', '📷'],
  ['train', '🚂'], ['car', '🚗'], ['truck', '🚚'], ['plane', '✈️'], ['boat', '⛵'], ['anchor', '⚓'],
  ['quantum', '⚛️'], ['atom', '⚛️'], ['acid', '🧪'], ['science', '🧪'], ['chaos', '🌀'], ['void', '🕳️'],
  ['infinity', '♾️'], ['laser', '🔆'], ['sneeze', '🤧'], ['fart', '💨'], ['hesitation', '😶'],
  ['karma', '🪃'], ['piano', '🎹'], ['wi-fi', '📶'], ['boomerang', '🪃'], ['tank', '🛡️'],
]

export const FALLBACKS: readonly string[] = ['✨', '🌀', '💥', '🔮', '🗿', '🛸', '⚡', '🎲']

export const BOT_THROWS: readonly string[] = ['Lava', 'Black Hole', 'Angry Goose', 'Tax Audit', 'Diamond Drill', 'Time Machine', 'Wet Sock', 'Tiny Tornado', 'Quantum Foam', 'Sentient Fog', 'Karate Panda', 'Infinite Mirror', 'Glitter Bomb', 'Ancient Curse', 'Rubber Chicken', 'Solar Flare', 'Bureaucracy', 'Cursed VHS', 'Magnet Storm', 'Feral Toddler']

export const IDEAS: readonly string[] = ['Volcano', 'Magnet', 'Tsunami', 'Banana', 'Karma', 'Gravity', 'Lawyer', 'Bees', 'Wi-Fi', 'Ghost', 'Tornado', 'Piano', 'Hot Sauce', 'Kraken', 'Black Hole', 'Super Glue']

export const VERBS: readonly string[] = ['crushes', 'obliterates', 'outwits', 'evaporates', 'devours', 'short-circuits', 'flattens', 'hypnotizes', 'disarms', 'vaporizes', 'out-vibes', 'neutralizes']

export const TIE_FLAVORS: readonly string[] = ['An unstoppable force meets an immovable object.', 'Perfectly balanced. Nobody scores — run it back.', 'The universe refuses to pick a side.', 'Both throws quietly agreed to a ceasefire.']

export const COUNTRIES: readonly Country[] = [['🇺🇸', 'USA'], ['🇮🇳', 'India'], ['🇯🇵', 'Japan'], ['🇧🇷', 'Brazil'], ['🇩🇪', 'Germany'], ['🇫🇷', 'France'], ['🇬🇧', 'UK'], ['🇰🇷', 'Korea'], ['🇨🇦', 'Canada'], ['🇦🇺', 'Australia'], ['🇲🇽', 'Mexico'], ['🇪🇸', 'Spain'], ['🇮🇹', 'Italy'], ['🇳🇬', 'Nigeria'], ['🇸🇪', 'Sweden'], ['🇹🇷', 'Türkiye']]

export const TOP_WORDS: readonly TopWord[] = [
  { word: 'Black Hole', emoji: '🕳️', plays: '48.2k', wr: '74%', wrBg: 'rgba(255,77,109,0.16)', wrC: '#c2264a' },
  { word: 'Nuke', emoji: '💣', plays: '41.7k', wr: '69%', wrBg: 'rgba(255,107,87,0.16)', wrC: '#d33d2a' },
  { word: 'Time', emoji: '⏰', plays: '38.9k', wr: '66%', wrBg: 'rgba(238,181,47,0.2)', wrC: '#8f6a00' },
  { word: 'Water', emoji: '💧', plays: '33.1k', wr: '61%', wrBg: 'rgba(0,201,184,0.16)', wrC: '#00857a' },
  { word: 'Karma', emoji: '🔮', plays: '27.6k', wr: '58%', wrBg: 'rgba(139,108,242,0.16)', wrC: '#6a4fd8' },
]

export const FRIENDS: readonly Friend[] = [
  { name: 'PixelPunk', handle: '@pixel', flag: '🇬🇧', country: 'UK', online: true, color: '#8b5cf6', matches: '842', wr: '58%', fav: 'Glitch' },
  { name: 'NoScope_Nina', handle: '@nina', flag: '🇧🇷', country: 'Brazil', online: true, color: '#ff4d6d', matches: '1,204', wr: '64%', fav: 'Piranha' },
  { name: 'Sir_Loses', handle: '@sirl', flag: '🇩🇪', country: 'Germany', online: false, color: '#4c8dff', matches: '317', wr: '41%', fav: 'Bureaucracy' },
  { name: 'toastmaster', handle: '@toast', flag: '🇰🇷', country: 'Korea', online: true, color: '#eeb52f', matches: '2,051', wr: '71%', fav: 'Butter' },
  { name: 'GG_Gary', handle: '@gary', flag: '🇨🇦', country: 'Canada', online: false, color: '#00c9b8', matches: '659', wr: '55%', fav: 'Moose' },
]

/** Human-looking names for ghost matchmaking fallback (never reveal these are bots). */
export const GHOST_OPPONENTS: readonly { name: string; handle: string }[] = [
  { name: 'NovaBlade', handle: '@nova' },
  { name: 'quiet_storm', handle: '@qstorm' },
  { name: 'Kairos', handle: '@kairos' },
  { name: 'MangoMissile', handle: '@mango' },
  { name: 'EchoPark', handle: '@echo' },
  { name: 'Rivet', handle: '@rivet' },
  { name: 'SaltMine', handle: '@salt' },
  { name: 'JadeViper', handle: '@jade' },
  { name: 'LowPoly', handle: '@lowpoly' },
  { name: 'CrimsonInk', handle: '@crimson' },
  { name: 'ByteBaron', handle: '@byte' },
  { name: 'Wisp', handle: '@wisp' },
]

/** How long to wait in the real queue before silently falling back to a ghost bot. */
export const GHOST_QUEUE_MS = 8_000
