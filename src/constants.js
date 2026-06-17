/* ═══════════════════════════════════════════════════════════════════
   WAYNE OS // THE DARK KNIGHT PROTOCOL  ·  constants & lore
   The numbers are the religion. Everything is earned, slowly.
   ═══════════════════════════════════════════════════════════════════ */

// ─── THE TRINITY (+ supporting sectors) ──────────────────────────────
// Vigilante (Body), Wayne (Wealth), Detective (Mind) are the Trinity.
// Allies / Soul / Project deepen the world without diluting the core.
export const SECTORS = {
  body: {
    key: 'body',
    name: 'The Body',
    house: 'VIGILANTE',
    sigil: '☠',
    roman: 'I',
    accent: '#b30000', // Arkham-Red — Body / Combat
    tw: 'blood',
    blurb: 'Forge the weapon. The flesh is the first suit.',
  },
  mind: {
    key: 'mind',
    name: 'The Mind',
    house: 'DETECTIVE',
    sigil: '?',
    roman: 'II',
    accent: '#00ff41', // Riddler-Green — Mind / Hacking
    tw: 'acid',
    blurb: "The world's greatest detective was once a boy who read.",
  },
  wealth: {
    key: 'wealth',
    name: 'The Empire',
    house: 'WAYNE',
    sigil: '$',
    roman: 'III',
    accent: '#c9a24e', // Bat-Gold — Wealth / Priority
    tw: 'gold',
    blurb: 'Wayne money built the cave. Build the money.',
  },
  allies: {
    key: 'allies',
    name: 'The Allies',
    house: 'THE FAMILY',
    sigil: '✦',
    roman: 'IV',
    accent: '#7b8ec4',
    tw: 'batblue',
    blurb: 'No one becomes Batman alone. Not even Batman.',
  },
  soul: {
    key: 'soul',
    name: 'The Soul',
    house: 'THE VOW',
    sigil: '✝',
    roman: 'V',
    accent: '#a472c4',
    tw: 'chaos',
    blurb: 'The rule that keeps the monster a man.',
  },
  project: {
    key: 'project',
    name: 'The Machine',
    house: 'WAYNE TECH',
    sigil: '⛭',
    roman: 'VI',
    accent: '#c9a24e',
    tw: 'gold',
    blurb: 'Drives the Batmobile build. Wayne Tech, forged nightly.',
  },
}

export const SECTOR_ORDER = ['body', 'mind', 'wealth', 'allies', 'soul', 'project']
export const LEVELS_PER_SECTOR = 30

// ─── THREAT LEVELS (Task Cruciality) ─────────────────────────────────
// Higher rank = sorted to the top, more XP, more Wayne Coins, worse penalty.
export const THREAT = {
  LOW: {
    key: 'LOW',
    label: 'Low',
    rank: 0,
    xp: 6,
    coins: 1,
    penalty: 4,
    color: '#6a6759',
    tw: 'ash',
    tag: 'PETTY CRIME',
  },
  MEDIUM: {
    key: 'MEDIUM',
    label: 'Medium',
    rank: 1,
    xp: 12,
    coins: 2,
    penalty: 9,
    color: '#a8a395',
    tw: 'bone-dim',
    tag: 'ORGANIZED',
  },
  HIGH: {
    key: 'HIGH',
    label: 'High',
    rank: 2,
    xp: 22,
    coins: 4,
    penalty: 18,
    color: '#c9a24e',
    tw: 'gold',
    tag: 'MAJOR THREAT',
  },
  ARKHAM: {
    key: 'ARKHAM',
    label: 'Arkham-Level',
    rank: 3,
    xp: 40,
    coins: 8,
    penalty: 34,
    color: '#b30000',
    tw: 'blood',
    tag: 'ARKHAM-LEVEL',
  },
}
export const THREAT_ORDER = ['ARKHAM', 'HIGH', 'MEDIUM', 'LOW']

// ─── PATROL ROUTES (recurrence) ──────────────────────────────────────
export const RECUR = {
  NONE: 'NONE',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  CUSTOM: 'CUSTOM', // uses days[] (0=Sun .. 6=Sat)
}
export const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
export const WEEKDAYS_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ─── UPGRADE LADDERS — ~30 tiny rungs per sector ─────────────────────
// You do not become Batman in a week.
export const UPGRADES = {
  body: [
    'stretch & breathe', 'push-up form drilled', 'first cold shower',
    '8 hrs sleep, three nights', 'boxing wraps acquired', 'bag work fundamentals',
    'muay thai: jab + cross', 'krav maga: inside defense', 'silat: hand traps',
    'joint locks I', 'wing chun: chain punches', 'judo: foundational throws',
    'BJJ: positional control', 'ninjutsu: silent movement', 'keysi: defensive lines',
    'weighted vest training', 'scaling rope: 30 ft', 'free running fundamentals',
    'iron palm conditioning', 'needle-thread breath', 'kata of the broken sword',
    'fasted morning patrols', 'league of shadows form I', 'league of shadows form II',
    'league of shadows form III', "poisoner's tolerance", 'the silent walk',
    'deathstroke sparring set', 'five-style mastery', 'THE PEAK HUMAN',
  ],
  mind: [
    'library card', 'casefile journaling', "rubik's cube under 2 min",
    'GTD inbox zero', 'first language: latin', 'memory palace I',
    'deduction trees', 'encrypted notebook', 'second language: japanese',
    'third language: russian', 'speed reading: 600 wpm', 'lockpicking basics',
    'lockpicking: tubular', 'criminology textbook I', 'criminology textbook II',
    'forensic pathology I', 'ciphers: classical', 'ciphers: modern',
    'psych: behavioral analysis', 'interrogation: layered', 'polygraph defeat',
    'hypnotic suggestion', 'the kobra defense (mind)', 'AI/ML for crime mapping',
    'first batcomputer build', 'facial recognition v1', 'city-scale wiretap',
    'predictive crime model', 'the great equation', "WORLD'S GREATEST DETECTIVE",
  ],
  wealth: [
    '$1k saved', 'first index fund', 'side income I',
    '$10k saved', 'tax filed clean', 'small business loan',
    'first warehouse property', 'patent: file one', 'patent: file three',
    'first hire', '10 employees', 'Series A funded',
    'first acquisition', 'private security division', 'applied sciences division',
    'Wayne Tower lease', 'Wayne Tower purchase', '$1M net worth',
    '$10M net worth', 'Wayne Tech R&D wing', 'kevlar contract: USA',
    'carbon nanotube patent', 'satellite uplink leased', 'satellite uplink owned',
    '$100M net worth', 'Wayne Enterprises (CEO)', 'Wayne Manor restored',
    'the Batcave (lit)', 'philanthropic empire', 'BILLIONAIRE',
  ],
  allies: [
    'Alfred answers the bell', 'Alfred makes tea', 'first true friend',
    'Lucius: small consult', 'Lucius: applied sciences', 'Lucius: full alliance',
    'Gordon: precinct contact', 'Gordon: detective tier', 'Gordon: lieutenant',
    'Gordon: commissioner', 'Selina: rooftop accord', 'Selina: alliance',
    'Dick (Robin) recruited', 'Dick trained', 'Dick graduates: Nightwing',
    'Barbara: research aide', 'Barbara: Oracle', 'Tim (Robin III)',
    'Damian (Robin V)', 'Cassandra recruited', 'Stephanie recruited',
    'Outsiders formed', 'League: contact', 'League: trusted',
    'League: founder', 'Justice League Watchtower', 'Birds of Prey alliance',
    'the Bat-Family complete', 'global allies network', 'THE WORLD STANDS WITH YOU',
  ],
  soul: [
    'grieve, finally', 'first quiet hour', 'one promise kept',
    'the no-kill rule, firm', 'forgive Joe Chill (try)', 'Crime Alley: stand there',
    'annual visit to the alley', 'Wayne Foundation: revive', 'school for Park Row kids',
    'Martha Wayne clinic', 'Thomas Wayne wing', 'anonymous gifts: ten',
    'anonymous gifts: hundred', 'speak at the orphanage', 'fund the orphanage',
    'open the manor for shelter', 'Dr. Thompkins, reconnected', "sit with a victim's family",
    'do not strike in anger I', 'do not strike in anger II', 'do not strike in anger III',
    'the one tear, allowed', 'joy, briefly', 'love, briefly',
    'love, sustained', 'say the words, aloud', 'let someone hold you',
    'the boy in the alley: held', 'the parents: at peace', 'BECOME, FULLY',
  ],
  project: [
    'the chassis', 'wheels: bolted', 'front axle',
    'rear axle', 'steering column', 'first ignition',
    'armored plating I', 'armored plating II', 'smokescreen rig',
    'afterburner installed', 'ejector seat', 'ramming prow',
    'machine guns: forward', 'rocket pod: left', 'rocket pod: right',
    'tumbler mode: locked', 'tumbler mode: extended', 'stealth coating',
    'EMP launcher', 'grapple hook (vehicle)', 'auto-pilot: city',
    'auto-pilot: pursuit', 'submerge package', 'flight package: hover',
    'flight package: stable', 'flight package: aerial', 'bat-pod separation',
    'satellite uplink (in car)', 'VANTABLACK coat', 'THE BATMOBILE (FINAL)',
  ],
}

// XP needed for each level within a sector (slow ratchet).
export const xpForLevel = (lvl) => 40 + lvl * 18

// Composite codename progression by total mastery (0–180 levels).
export const STAGES = [
  { at: 0, codename: 'The Boy in the Alley', stage: 'pre-training' },
  { at: 12, codename: 'The Runaway', stage: 'wandering the world' },
  { at: 30, codename: 'The Student', stage: 'league of shadows' },
  { at: 55, codename: 'The Returned', stage: 'gotham, reclaimed' },
  { at: 85, codename: 'The Vigilante', stage: 'the cowl, first worn' },
  { at: 120, codename: 'The Dark Knight', stage: 'gotham fears him' },
  { at: 160, codename: 'The Legend', stage: 'more than a man' },
  { at: 180, codename: 'BATMAN', stage: 'becoming, complete' },
]

// ─── RA'S AL GHUL — the antagonist who mocks and, rarely, praises ────
export const RAS_GENERIC = [
  'You are a boy hiding in an alley.',
  'Your compassion is a weakness your enemies will not share.',
  'Theatricality and deception are powerful agents. You have neither.',
  'If you make yourself more than just a man, you become legend. You are not legend.',
  'Training is nothing. Will is everything. Your will is plastic.',
  'You lack the courage to do what is necessary.',
  'Death does not wait for your motivation.',
  'I have seen you fight. It is sad.',
  'You wear the costume but you do not wear the cause.',
  'The bat is not a symbol. Not until you earn it.',
  'Crime is patient. You are not.',
  'I have buried sons more disciplined than you.',
  'You think hesitation is mercy. It is cowardice in a wig.',
  'Your enemies do not check their phones. They prepare.',
]
export const RAS_PRAISE = [
  'Adequate. Do it again, ten thousand times.',
  'You begin to understand. The path is long.',
  'A flicker of the immortal in you tonight. Do not waste it.',
  'I have trained worse who became legend. Continue.',
  'The League would not yet have you. But it watches.',
]

// ─── ALFRED — the conscience, the notifications, the steady hand ─────
export const ALFRED = {
  greeting: [
    'The cave is cold, sir. Shall we begin?',
    'A new night, Master Wayne. Gotham has not improved in your absence.',
  ],
  signalUp: [
    'Excuse me, Master Wayne. A priority target requires your immediate attention.',
    'The signal is lit, sir. I have laid out the cowl.',
  ],
  idle: [
    'Master Bruce, the equipment gathers dust. As do you.',
    'I took the liberty of brewing tea three hours ago, sir. It is cold now.',
    'Procrastination, sir, is the only criminal you have never caught.',
  ],
  done: [
    'Well struck, sir. I shall log it in the case file.',
    'One less, Master Wayne. Gotham notices, even if it never thanks you.',
  ],
  arkham: [
    'Sir — an Arkham-level threat is loose in your case file. I would not sleep on it.',
  ],
  chaos: [
    'The Joker has tampered with your winnings, sir. I did warn you about the coins.',
  ],
  fail: [
    'It pains me to report it, sir: a mission has failed. The Waynes did not raise a quitter.',
  ],
}

// Joker chaos: chance, on completion, to lose part of the reward — unless
// the user pays Wayne Coins for protection.
export const JOKER_CHANCE = 0.14
export const JOKER_SHIELD_COST = 3
