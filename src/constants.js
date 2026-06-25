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
    accent: '#c0392b', // gotham teal — Body / Combat
    tw: 'acid',
    blurb: 'Forge the weapon. The flesh is the first suit.',
  },
  mind: {
    key: 'mind',
    name: 'The Mind',
    house: 'DETECTIVE',
    sigil: '?',
    roman: 'II',
    accent: '#a83423', // gotham-cyan — Mind / Detective
    tw: 'acid',
    blurb: "The world's greatest detective was once a boy who read.",
  },
  wealth: {
    key: 'wealth',
    name: 'The Empire',
    house: 'WAYNE',
    sigil: '$',
    roman: 'III',
    accent: '#D73423', // crimson — Wealth / Priority
    tw: 'gold',
    blurb: 'Wayne money built the cave. Build the money.',
  },
  allies: {
    key: 'allies',
    name: 'The Allies',
    house: 'THE FAMILY',
    sigil: '✦',
    roman: 'IV',
    accent: '#9c5248', // gotham-slate
    tw: 'batblue',
    blurb: 'No one becomes Batman alone. Not even Batman.',
  },
  soul: {
    key: 'soul',
    name: 'The Soul',
    house: 'THE VOW',
    sigil: '✝',
    roman: 'V',
    accent: '#b06a60', // pale slate — The Vow
    tw: 'chaos',
    blurb: 'The rule that keeps the monster a man.',
  },
  project: {
    key: 'project',
    name: 'The Machine',
    house: 'WAYNE TECH',
    sigil: '⛭',
    roman: 'VI',
    accent: '#b8341c', // deep rust — Wayne Tech
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
    color: '#9c5248', // gotham-slate
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
    color: '#a83423', // gotham-cyan
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
    color: '#D73423', // crimson — major threat
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
    color: '#D62516', // gotham-blood
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
  focusBroke: [
    'You broke focus, sir. The Joker thrives on a wandering mind.',
    'Detective Vision collapsed. Discipline is a muscle, Master Bruce, and you just dropped the weight.',
  ],
  focusDone: [
    'A full patrol, uninterrupted. This is the work that builds legends, sir.',
    'Ninety minutes of pure focus. Even Ra’s would struggle to mock that.',
  ],
  wayne: [
    'The board awaits, Master Wayne. Do try to smile for the cameras.',
    'A Wayne Enterprises matter, sir. Profitable, if dull.',
  ],
  batman: [
    'The cowl suits you tonight, sir. Gotham is restless.',
    'Down to the cave, then. The city will not save itself.',
  ],
}

// Joker chaos: chance, on completion, to lose part of the reward — unless
// the user pays Wayne Coins for protection.
export const JOKER_CHANCE = 0.14
export const JOKER_SHIELD_COST = 3

/* ═══════════════════════════════════════════════════════════════════
   COWL TOGGLE — Contextual Duality. Two identities, two schedules.
   ═══════════════════════════════════════════════════════════════════ */
export const MODES = {
  wayne: {
    key: 'wayne',
    label: 'BRUCE WAYNE',
    sub: 'Wayne Enterprises',
    tagline: 'wealth · diplomacy · the public face',
    accent: '#D73423',
    sectors: ['wealth', 'allies', 'soul'],
  },
  batman: {
    key: 'batman',
    label: 'THE BATMAN',
    sub: 'The Dark Knight Protocol',
    tagline: 'body · mind · the machine · deep work',
    accent: '#D62516',
    sectors: ['body', 'mind', 'project', 'soul'],
  },
}
// Which threat levels each identity concerns itself with.
export const MODE_THREATS = {
  wayne: ['LOW', 'MEDIUM'], // administrative, diplomatic
  batman: ['MEDIUM', 'HIGH', 'ARKHAM'], // violence, deep work, extremity
}

/* ═══════════════════════════════════════════════════════════════════
   DETECTIVE VISION — Flow-state deep work. Break focus, pay the price.
   ═══════════════════════════════════════════════════════════════════ */
export const FOCUS_DURATIONS = [
  { label: '25 · RECON', ms: 25 * 60 * 1000 },
  { label: '50 · STAKEOUT', ms: 50 * 60 * 1000 },
  { label: '90 · FULL PATROL', ms: 90 * 60 * 1000 },
]
export const FOCUS_DEFAULT_MS = 90 * 60 * 1000
export const FOCUS_BOUNTY_XP = 60 // on top of the task's own reward
export const FOCUS_BOUNTY_COINS = 6
export const FOCUS_BREAK_XP_PENALTY = 50 // brutal — this is the whole point
export const FOCUS_BREAK_COIN_PENALTY = 8

/* ═══════════════════════════════════════════════════════════════════
   ARKHAM WING — personify your failures. Give the obstacle a face.
   ═══════════════════════════════════════════════════════════════════ */
export const ROGUES = {
  riddler: {
    key: 'riddler',
    name: 'The Riddler',
    cause: 'Analysis paralysis · overthinking',
    color: '#00ff41',
    glyph: '?',
  },
  freeze: {
    key: 'freeze',
    name: 'Mr. Freeze',
    cause: 'Burnout · apathy · the cold',
    color: '#5fd0e6',
    glyph: '❄',
  },
  ivy: {
    key: 'ivy',
    name: 'Poison Ivy',
    cause: 'Distraction · pleasure · the scroll',
    color: '#46c46e',
    glyph: '✿',
  },
  bane: {
    key: 'bane',
    name: 'Bane',
    cause: 'Physical exhaustion · broken body',
    color: '#b3681f',
    glyph: '⊗',
  },
}
export const ROGUE_ORDER = ['riddler', 'freeze', 'ivy', 'bane']

// Ra's adapts his mockery to whichever Rogue defeats you most.
export const RAS_ROGUE = {
  riddler: 'You drowned in your own questions. The Riddler did not even need to try.',
  freeze: 'You went cold. Apathy is a death Mr. Freeze would envy.',
  ivy: 'You let a plant distract you from your destiny. Pathetic.',
  bane: 'Your body broke before your will was tested. Bane would be ashamed for you.',
}

/* ═══════════════════════════════════════════════════════════════════
   FOUNDATION (store-scaffolded this round; full UI to follow)
   ═══════════════════════════════════════════════════════════════════ */
// Tower of Babel — pre-committed if/then traps for your weaker future self.
export const CONTINGENCY_TEMPLATES = [
  {
    id: 'body-collapse',
    label: 'If Body falters 3 days → lock Wealth',
    when: { type: 'sectorStall', sector: 'body', days: 3 },
    then: { type: 'lockSector', sector: 'wealth' },
    cost: 25,
  },
  {
    id: 'signal-missed',
    label: 'If a Bat-Signal task is missed → −100 WC + Fear Gas',
    when: { type: 'signalMissed' },
    then: { type: 'coinPenalty', amount: 100, fearGas: true },
    cost: 25,
  },
]

// Lucius Fox R&D — the Wayne Coin sink. Buy your own progression.
export const RND_STAGES = ['idea', 'active', 'deployable']
export const RND_STAGE_COST = { idea: 0, active: 40, deployable: 120 }

// Batsuit Telemetry — biometric-adaptive difficulty.
export const BACTA_SLEEP_THRESHOLD = 5 // hours
export const BACTA_SORENESS_THRESHOLD = 7 // 1–10

/* ═══════════════════════════════════════════════════════════════════
   BATPANEL — visual progression tiers (1–5) from sector mastery.
   Empire = Wealth/Admin · Machine = Tech/Tools · Body = Fitness/Mind.
   ═══════════════════════════════════════════════════════════════════ */
export const TIER_MAX = 5
// 0–30 sector levels → a 1–5 image tier.
export const levelToTier = (lvl) => Math.min(TIER_MAX, Math.max(1, Math.floor(lvl / 6) + 1))

/* ═══════════════════════════════════════════════════════════════════
   PREP TIME — Batman never fails with prep time. Invoke it, and the
   stakes multiply. Abandon a prepped task and the Joker feasts.
   ═══════════════════════════════════════════════════════════════════ */
export const PREP_DEFAULT_MS = 15 * 60 * 1000 // 15 minutes
export const PREP_OPTIONS = [
  { label: '15 MIN', ms: 15 * 60 * 1000 },
  { label: '30 MIN', ms: 30 * 60 * 1000 },
  { label: '60 MIN', ms: 60 * 60 * 1000 },
]
// Base Joker Chaos penalty for abandoning a task; ×10 once prep is invoked.
export const JOKER_CHAOS_XP = 8
export const JOKER_CHAOS_COINS = 3
export const PREP_PENALTY_MULT = 10

// Adopt a Robin — delegation toast (Directive 3).
export const ROBIN_TOAST =
  'Task delegated to an underaged sidekick in bright colors. Tactically questionable. Task cleared.'

/* ═══════════════════════════════════════════════════════════════════
   BILLIONAIRE PLAYBOY ALIBIS — issued to the press to bury a failure.
   ═══════════════════════════════════════════════════════════════════ */
export const ALIBIS = [
  'Fell out of a yacht with the entire Russian Ballet. Twice.',
  'Bought the bank to fire one rude teller. Got distracted buying the city block.',
  'Was “test-driving” six Lamborghinis simultaneously for charity.',
  'Trapped under a very expensive supermodel at a very exclusive gala.',
  'Lost a weekend to a high-stakes baccarat game in Monaco. Won a vineyard.',
  'Accidentally funded an opera, then had to attend the entire opera.',
  'Mistook a board meeting for a wine tasting. Regret nothing.',
  'Was photographed asleep in a fountain outside the Iceberg Lounge. As one is.',
]

/* ═══════════════════════════════════════════════════════════════════
   BROODING MODE — the edgelord idle monologue. Pure cringe, on purpose.
   ═══════════════════════════════════════════════════════════════════ */
export const BROODING_IDLE_MS = 3 * 60 * 1000 // 3 minutes
export const BROODING_QUOTES = [
  'Gotham is a diseased animal... and I have been staring at a blank screen for three minutes.',
  'They thought the dark was their ally. They merely adopted the dark. I was born into a tab left open.',
  'Criminals are a superstitious, cowardly lot. So is my motivation, apparently.',
  'I am vengeance. I am the night. I am... extremely idle right now.',
  'It is not who I am underneath, but what I do, that defines me. I have done nothing for 180 seconds.',
  'The rain washes the filth from the streets. It cannot wash away an unfinished case file.',
]

/* ═══════════════════════════════════════════════════════════════════
   THE ARMORY — Wayne Tech gadgets bought with Wayne Coins.
   Each unfolds, transformer-style, and deploys with a flourish.
   icon = lucide-react component name (resolved in Armory.jsx).
   perk is mostly morale/flavor; the collection itself is the reward.
   ═══════════════════════════════════════════════════════════════════ */
export const GADGETS = [
  { id: 'grapnel', name: 'Grapnel Gun', class: 'TRAVERSAL', cost: 40, icon: 'Anchor',
    desc: 'Magnesium-grade jump line. Ascend five stories in 1.2 seconds.',
    perk: 'Morale: the city gets smaller.' },
  { id: 'batarang', name: 'Batarang Mk II', class: 'OFFENSE', cost: 65, icon: 'Send',
    desc: 'Balanced tri-edge, returns to hand. Now with a tracer payload.',
    perk: 'Marks a target. It cannot hide.' },
  { id: 'smoke', name: 'Smoke Pellets', class: 'EVASION', cost: 55, icon: 'Cloud',
    desc: 'Vanish mid-sentence. Theatricality is a weapon.',
    perk: 'Disengage on your terms.' },
  { id: 'gel', name: 'Explosive Gel', class: 'BREACH', cost: 85, icon: 'Flame',
    desc: 'Sprayable, shapeable, detonated on command. Mind the walls.',
    perk: 'No door is truly locked.' },
  { id: 'optics', name: 'Detective Optics', class: 'RECON', cost: 110, icon: 'ScanEye',
    desc: 'Cowl lenses with multi-spectral overlay. See what they hide.',
    perk: 'Evidence highlights itself.' },
  { id: 'emp', name: 'EMP Charge', class: 'SABOTAGE', cost: 140, icon: 'Zap',
    desc: 'Localized pulse. Every camera on the block goes dark.',
    perk: 'Surveillance is now optional.' },
  { id: 'cape', name: 'Memory-Cloth Cape', class: 'MOBILITY', cost: 175, icon: 'Bird',
    desc: 'Rigidifies on current. Gliding is just falling with intent.',
    perk: 'Arrive from above. Always above.' },
  { id: 'tumbler', name: 'Tumbler Ignition', class: 'VEHICLE', cost: 240, icon: 'Car',
    desc: 'It was designed as a bridging vehicle. It does not need the bridge.',
    perk: 'The Batmobile answers to you.' },
]

/* ═══════════════════════════════════════════════════════════════════
   V5 // ORACLE INTEGRATION
   ═══════════════════════════════════════════════════════════════════ */

// ── Task pipeline status (Blackgate Kanban) ──────────────────────────
export const STATUS = {
  backlog: { key: 'backlog', label: 'Intel Gathered', sub: 'BACKLOG', color: '#9c5248' },
  patrol: { key: 'patrol', label: 'On Patrol', sub: 'IN PROGRESS', color: '#D73423' },
  incarcerated: { key: 'incarcerated', label: 'Incarcerated', sub: 'DONE', color: '#D62516' },
}
export const STATUS_ORDER = ['backlog', 'patrol', 'incarcerated']

// ── Command Console quick threat tiers (3-pick UI maps to full ladder) ─
export const CONSOLE_THREATS = [
  { key: 'LOW', label: 'STREET' },
  { key: 'HIGH', label: 'ROGUE' },
  { key: 'ARKHAM', label: 'ARKHAM' },
]

// ── Omnibar parser token tables ──────────────────────────────────────
// #tokens → sector. Includes lore aliases (machine→project, etc.).
export const SECTOR_TOKENS = {
  body: 'body', vigilante: 'body', fitness: 'body', combat: 'body',
  mind: 'mind', detective: 'mind', intel: 'mind', study: 'mind',
  wealth: 'wealth', empire: 'wealth', money: 'wealth', wayne: 'wealth',
  allies: 'allies', family: 'allies', team: 'allies',
  soul: 'soul', vow: 'soul',
  project: 'project', machine: 'project', batmobile: 'project', tech: 'project',
}
// !tokens → threat level.
export const THREAT_TOKENS = {
  arkham: 'ARKHAM', max: 'ARKHAM',
  rogue: 'HIGH', high: 'HIGH', major: 'HIGH',
  street: 'LOW', low: 'LOW', minor: 'LOW',
  medium: 'MEDIUM', standard: 'MEDIUM',
}
// schedule keywords (lowercased) → relative day offset
export const SCHEDULE_TOKENS = { today: 0, tonight: 0, tomorrow: 1 }
// recurrence keywords
export const RECUR_TOKENS = { daily: 'DAILY', everyday: 'DAILY', weekly: 'WEEKLY' }

// ── The Long Halloween — 365-day completion heatmap intensity ──────────
// buckets by daily XP; arkham days glow crimson regardless of volume.
export const HEATMAP_LEVELS = [
  { min: 0, color: '#120505', label: 'dark' },        // empty
  { min: 1, color: '#3a0a07', label: 'faint' },       // low — dried blood
  { min: 25, color: '#7a160e', label: 'active' },     // mid
  { min: 55, color: '#c0291a', label: 'strong' },     // high
  { min: 90, color: '#ff3422', label: 'relentless' }, // neon red
]
export const HEATMAP_ARKHAM = '#ff2b2b' // an Arkham-level night — glowing red

// ── Two-Face — the coin toss when a 7-day streak shatters ──────────────
export const TWOFACE_STREAK = 7
export const TWOFACE = {
  cleanText: 'The clean half landed up. Harvey forgives you tonight. Your record stands.',
  scarredText: 'The scarred half. Chance is the only fair judge — and it just robbed you blind.',
  scarredXp: 30,
  scarredCoins: 12,
}

/* ═══════════════════════════════════════════════════════════════════
   GCPD DISPATCH GRID — the weekly patrol schedule.
   Days run Mon→Sun; the vertical axis is the patrol window in 30/60-min
   blocks. Slots key on (weekday, minutesFromMidnight) so the routine
   repeats every week.
   ═══════════════════════════════════════════════════════════════════ */
// JS getDay(): 0=Sun … 6=Sat. The grid presents Monday-first.
export const DISPATCH_DAYS = [
  { wd: 1, label: 'MON' },
  { wd: 2, label: 'TUE' },
  { wd: 3, label: 'WED' },
  { wd: 4, label: 'THU' },
  { wd: 5, label: 'FRI' },
  { wd: 6, label: 'SAT' },
  { wd: 0, label: 'SUN' },
]
export const DISPATCH_START_HOUR = 5 // 05:00
export const DISPATCH_END_HOUR = 24 // 24:00 (midnight)
export const GRANULARITIES = [
  { label: '30 MIN', minutes: 30 },
  { label: '1 HOUR', minutes: 60 },
]
// slot identity → repeats weekly
export const slotKey = (wd, mins) => `${wd}:${mins}`
export const fmtSlot = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`

export const ORACLE_OVERRIDE = [
  'ORACLE OVERRIDE. Your patrol window is open — move, Batman.',
  'The schedule is law. This block is live. Begin the objective NOW.',
  'Dispatch confirms: your slot just opened. Gotham will not wait.',
]

/* ═══════════════════════════════════════════════════════════════════
   THE BAT-FAMILY NETWORK — delegation roster.
   icon = lucide-react component name (resolved in SidekickRoster.jsx).
   ═══════════════════════════════════════════════════════════════════ */
export const SIDEKICKS = [
  { id: 'nightwing', name: 'Nightwing', handle: 'DICK GRAYSON', color: '#2f6df6', icon: 'Bird', line: 'On it. Acrobatics included, free of charge.' },
  { id: 'batgirl', name: 'Batgirl', handle: 'BARBARA / CASS', color: '#7d2ff6', icon: 'Sparkles', line: 'Consider it handled — quietly.' },
  { id: 'redhood', name: 'Red Hood', handle: 'JASON TODD', color: '#d11f1f', icon: 'Skull', line: 'Fine. My way, though.' },
  { id: 'robin', name: 'Robin', handle: 'DAMIAN WAYNE', color: '#21a83a', icon: 'Bird', line: 'Tt. Trivial. It is as good as done.' },
  { id: 'oracle', name: 'Oracle', handle: 'THE NETWORK', color: '#1fb6b6', icon: 'Radio', line: 'Routed and logged. I see everything.' },
]
export const SIDEKICK_BY_ID = Object.fromEntries(SIDEKICKS.map((s) => [s.id, s]))

/* ═══════════════════════════════════════════════════════════════════
   THE ARKHAM MUTATION PROTOCOL — overdue cases metastasise into Rogues.
   A case left >24h overdue mutates and applies a live OS-wide debuff
   until it is defeated (completed).
   ═══════════════════════════════════════════════════════════════════ */
export const MUTATION_AGE_MS = 24 * 60 * 60 * 1000 // 24h overdue → mutation
export const MUTATIONS = {
  freeze: {
    id: 'freeze', rogue: 'Mr. Freeze', color: '#7ad7ff', cls: 'mutate-freeze',
    debuff: 'CRYO-FIELD: all motion slowed 3×.',
    taunt: 'You left it to rot — now everything freezes. Tonight, revenge is best served cold.',
  },
  riddler: {
    id: 'riddler', rogue: 'The Riddler', color: '#39ff14', cls: 'mutate-riddler',
    debuff: 'CIPHER: three backlog titles scrambled.',
    taunt: 'Riddle me this: what rots if ignored and scrambles your mind? This case.',
  },
  scarecrow: {
    id: 'scarecrow', rogue: 'Scarecrow', color: '#c9a73a', cls: 'mutate-scarecrow',
    debuff: 'FEAR-TOXIN: jump-scares every 2 min.',
    taunt: 'Your procrastination smells of fear. Let me amplify it.',
  },
}
export const MUTATION_IDS = ['freeze', 'riddler', 'scarecrow']
export const SCARECROW_INTERVAL_MS = 2 * 60 * 1000 // jump-scare cadence
export const SCRAMBLE_CHARS = '?@#$%&!§¿※†‡▓░▒'
