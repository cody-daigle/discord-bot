import { EmbedBuilder } from 'discord.js';

export const BRICK_QUEST_URL = 'https://claude.ai/artifact/2EYgMotVSerq9abEWANRJU';

function embed(color, title, description) {
  return new EmbedBuilder().setColor(color).setTitle(title).setDescription(description ?? null);
}

export const OVERVIEW_EMBED = embed(
  '#D62B1F',
  '🧱 Artifakt: Brickquest — Rulebook',
  "A tiny adventure game played across LEGO locations you build and connect — pick a class, roll a d20 to act, roll your class's weapon die to hit hard.\n\n" +
    '*Ages 5–7 · 2–5 players · 30–45 min per quest*\n\n' +
    'Split into two books: **📖 Book One — The Hero\'s Guide** (for every player) and **🗺️ Book Two — The Builder\'s Guide** (for whoever runs the monsters). ' +
    'Builders: read Book Two before your players do, so the reveals land!\n\n' +
    '**Pick a section below** to read its rules. There is no adding numbers together anywhere in this game — every roll is just "is the die big enough?"',
);

export const SECTIONS = [
  // ---------- Book One: The Hero's Guide ----------
  {
    id: 'need',
    label: 'What You Need',
    emoji: '🎒',
    description: 'Book One · Minifigs & dice',
    embed: embed('#2B6CB0', '🎒 What You Need').addFields(
      {
        name: 'From your LEGO bin',
        value: '• 1 minifig per player (your **Hero**)\n• A stack of small bricks per player for **Heart** (HP) — 5 to 8 to start',
      },
      {
        name: 'Dice — one set per hero',
        value:
          '• **1 d20** — every hero rolls this to see if an action succeeds\n' +
          '• **1 d6** — Cleric, Priest, Druid, Monk, Rogue, Bard, Hunter\n' +
          '• **1 d10** — Warrior, Mage, Engineer\n' +
          "• *Druid's Attack die becomes d10 while shapeshifted with the Power effect (Bear)*",
      },
    ),
  },
  {
    id: 'classes',
    label: 'Choose Your Class',
    emoji: '⚔️',
    description: 'Book One · 10 classes, 4 roles',
    embed: embed(
      '#D62B1F',
      '⚔️ Choose Your Class',
      'Ten classes, four roles — like Tank, Healer, or Damage in a video game party. Every class has a **Trick** (always-on passive) and a **Skill** (a bigger active move).',
    ).addFields(
      {
        name: '🟥 Warrior — Tank',
        value:
          '❤️ 8 · 🛡️ 10 · ⚔️ Cleave (d10)\n**Trick:** Ignore Pain — once per fight, ignore a hit completely.\n**Skill:** Rage — after 3 consecutive hits, roll an extra d10 and remove that many additional Heart bricks.',
      },
      {
        name: '🟨 Cleric — Healer',
        value:
          '❤️ 7 · 🛡️ 8 · ⚔️ Mace Strike (d6)\n**Trick:** Heal — once per fight, restore 1 Heart brick to an ally instead of attacking.\n**Skill:** AoE — once per fight, roll your damage die once and remove that many bricks from every monster in your location.',
      },
      {
        name: '🌸 Priest — Healer',
        value:
          '❤️ 6 · 🛡️ 7 · ⚔️ Smite (d6)\n**Trick:** Heal — once per fight, restore 1 Heart brick to an ally instead of attacking.\n**Skill:** Party Shield — once per fight, block one hit for every ally.',
      },
      {
        name: '🟧 Druid — Hybrid',
        value:
          '❤️ 7 · 🛡️ 7 · ⚔️ Bramble Lash (d6; Maul as Bear / Claw as Panther)\n**Trick:** Wild Shape — once per fight, become Bear (Power: Attack becomes d10) or Panther (Grace: next attack auto-hits). Lasts until you shift back.\n**Skill:** Vine Snare — once per fight, root a monster; it skips its next attack, then loses 1 Heart brick when the vines break.',
      },
      {
        name: '🟦 Monk — Hybrid',
        value:
          '❤️ 7 · 🛡️ 8 · ⚔️ Palm Strike (d6)\n**Trick:** Harmony & Discord — on a hit, choose: deal damage, or heal an ally 1 Heart brick instead.\n**Skill:** Adept — once per fight, dodge one otherwise-fatal blow completely.',
      },
      {
        name: '🟡 Rogue — Melee DPS',
        value:
          '❤️ 6 · 🛡️ 7 · ⚔️ Twin Blades (d6)\n**Trick:** Sneak Attack — your first hit each fight always succeeds.\n**Skill:** Cheat Death — once per fight, if you\'d hit 0 Heart bricks, stay at 1 instead.',
      },
      {
        name: '🟣 Bard — Support',
        value:
          '❤️ 6 · 🛡️ 7 · ⚔️ Songbook Smack (d6)\n**Trick:** Ballad: Inspire — once per fight, let an ally reroll any one roll.\n**Skill:** Ballad: Fury — once per fight, every ally\'s next hit deals max damage automatically.',
      },
      {
        name: '🟢 Hunter — Ranged DPS',
        value:
          '❤️ 6 · 🛡️ 8 · ⚔️ Training Bow (d6)\n**Trick:** Steady Aim — reroll one missed attack per fight.\n**Skill:** Rapid Fire — recover 1 saved arrow per monster defeated (max 2); spend one to roll your damage die twice.',
      },
      {
        name: '🔧 Engineer — Ranged Support',
        value:
          '❤️ 6 · 🛡️ 8 · ⚔️ Gearshot (d10)\n**Trick:** Rummage — collect 1 part each time you defeat a monster or search successfully.\n**Skill:** Deploy — after 3 parts, build a robot (Atk d6 / Def 8 / ❤️ 3): Damage Bot or Support Bot.',
      },
      {
        name: '🔵 Mage — Ranged DPS',
        value:
          '❤️ 5 · 🛡️ 7 · ⚔️ Fireball (d10)\n**Trick:** Spectral Shift — once per fight, redirect a hit to another hero in your location; you skip your next turn.\n**Skill:** Comet Strike — once per fight, roll vs. one monster\'s Defense; a hit also Frost-Splashes every other monster your roll would also beat, freezing them for 1 turn.',
      },
    ),
  },
  {
    id: 'turn',
    label: 'How a Turn Works',
    emoji: '🔁',
    description: 'Book One · Move, Act, Roll',
    embed: embed('#2E8B57', '🔁 How a Turn Works', 'On your turn, do these three things in order.').addFields(
      {
        name: '1. Move',
        value: 'Step your minifig onto a connected plate next door — one location per turn.',
      },
      {
        name: '2. Act',
        value:
          'Pick one: **Attack** a monster in your location, **Search** the location, **Rest** (skip fighting, put 1 brick back on your Heart stack), or **Use** your class\'s Trick or Skill.',
      },
      {
        name: '3. Roll',
        value: 'If your action needs a roll, roll your d20 and check it against the Target Number.',
      },
      {
        name: '🏹 Ranged classes',
        value: 'Hunters, Mages, and Engineers can Attack a monster in an adjacent connected location without moving there first.',
      },
      {
        name: '⛺ Making Camp',
        value:
          "When your whole party stands on a Camp plate and spends a turn making camp, everyone's Heart stack refills to max. Bigger than a solo Rest (+1 brick) — this is a whole-party event, placed by the Builder.",
      },
    ),
  },
  {
    id: 'combat',
    label: 'Fighting Monsters',
    emoji: '🎲',
    description: 'Book One · The one rule',
    embed: embed(
      '#B8230F',
      '🎲 Fighting Monsters',
      'Every roll in Artifakt: Brickquest — attacking, dodging, searching — works the exact same way.\n\n**The one rule:** Roll your d20 → is it equal to or bigger than the Target Number? If yes, you succeed!',
    ).addFields(
      { name: 'Easy — Target 8', value: 'Easy monsters, easy searches', inline: true },
      { name: 'Normal — Target 12', value: 'Most monsters, most searches & dodges', inline: true },
      { name: 'Boss — Target 15', value: 'Boss fights', inline: true },
      {
        name: 'When you attack',
        value: "Roll your d20. Beat the monster's Defense → hit! Roll your class damage die (d6/d10) and remove that many Heart bricks from it.",
      },
      {
        name: 'When a monster attacks',
        value: "The Builder rolls a d20. If it beats your Defense, you're hit — the Builder rolls the monster's damage die and you lose that many Heart bricks.",
      },
      {
        name: '⚠️ Natural 20 / Natural 1',
        value: 'Natural 20 = automatic hit, max damage, no damage roll needed. Natural 1 = automatic miss. Always.',
      },
    ),
  },
  {
    id: 'rewards',
    label: 'Leveling Up',
    emoji: '⭐',
    description: 'Book One · Between-quest rewards',
    embed: embed(
      '#B8860B',
      '⭐ Leveling Up Between Quests',
      'Artifakt: Brickquest is a campaign — your hero keeps everything they earn, quest after quest. Build a **Hero Board** at home and stack every Trophy Brick you earn next to your minifig — that stack *is* your character sheet.\n\nAfter you finish a quest (win or lose), each player picks **one** reward:',
    ).addFields(
      { name: '❤️ Heart Brick', value: '+1 to your max Heart stack (max 12)' },
      {
        name: '⚔️ Master Weapon Brick',
        value: 'd6 classes upgrade to d10; d10 classes roll two dice and keep the best. Once per hero — reflavor the weapon however you like.',
      },
      { name: '🤝 Companion', value: 'A helper minifig — once per quest, auto-win one roll. 1 at a time.' },
      { name: '✨ Flair Brick', value: 'A cape, hat, or weapon reskin — looks awesome, no rules effect. As many as you want!' },
    ),
  },
  {
    id: 'reference',
    label: 'Quick Reference',
    emoji: '📋',
    description: 'Book One · One-page cheat sheet',
    embed: embed('#1C2541', '📋 Quick Reference').addFields(
      { name: 'Every turn', value: '1. Move → 2. Act (Attack/Search/Rest/Trick/Skill) → 3. Roll if needed.' },
      { name: 'Every roll', value: 'Roll a d20 → beat the Target Number? Hit → roll your damage die (d6/d10) to remove Heart bricks.' },
      { name: 'Target Numbers', value: '**8** Easy (searching, easy monsters) · **12** Normal (most monsters, most Defense/traps) · **15** Boss fights' },
      {
        name: 'Class Defense',
        value: 'Warrior 10 · Cleric/Monk/Hunter/Engineer 8 · Priest/Druid/Rogue/Bard/Mage 7',
      },
      { name: '⚠️ Always', value: 'Natural 20 = auto-hit, max damage. Natural 1 = auto-miss.' },
    ),
  },
  // ---------- Book Two: The Builder's Guide ----------
  {
    id: 'builder-need',
    label: 'What the Builder Needs',
    emoji: '🗺️',
    description: 'Book Two · Builder-only toolkit',
    embed: embed(
      '#7B5EA7',
      '🗺️ What the Builder Needs',
      "One player takes on the Builder role instead of playing a Hero — like a Dungeon Master, they run every monster, build the world, and hand out rewards. The Builder isn't limited to the monsters and rooms in this book — everything here is a toolkit for inventing any scenario you want.",
    ).addFields(
      {
        name: 'From your LEGO bin',
        value:
          '• One **12×12 plate** per location, snapped edge-to-edge with a stud-wide doorway gap\n' +
          '• Spare 1×1 bricks in red/yellow/green/blue, handed out as **Trophy Bricks**\n' +
          '• One minifig or brick per monster type, as an encounter marker\n' +
          '• A small **green Camp plate** with a campfire + sleeping bags',
      },
      {
        name: "Dice — the Builder's own set",
        value:
          '• **1 d20** — rolled every time a monster attacks or a search/dodge needs a check\n' +
          '• **d4, d6, d8, and d10** — a full set of monster damage dice, so any monster you invent can be as gentle or as fearsome as you like',
      },
      {
        name: 'No math here either',
        value: 'There is no adding numbers together anywhere in this game, for Heroes and Builder alike — just "is the die big enough?"',
      },
    ),
  },
  {
    id: 'monsters',
    label: 'Meet the Monsters',
    emoji: '👾',
    description: 'Book Two · 5 monsters + Builder Notes',
    embed: embed(
      '#4A5570',
      '👾 Meet the Monsters',
      'Five monsters to start. Build each one out of the color bricks shown, or use any minifig as a stand-in. Builder Notes give quick tips for running each one at the table.',
    ).addFields(
      {
        name: '🟢 Slimy Steve — Slime',
        value:
          '❤️ 4 · 🛡️ 8 · ⚔️ d6\n*"Slow, squishy, and always where you least expect it."*\n**Builder Note:** Not currently placed on the Brickholm Road — free to drop into any custom room. A good very-first fight for a brand-new player.',
      },
      {
        name: '🌿 Vine',
        value:
          '❤️ 3 · 🛡️ 8 · ⚔️ d4\n*"Just a friendly little tangle... that really wants a hug."*\n**Builder Note:** Doesn\'t move or chase — heroes have to come to it. Great for teaching the attack loop with almost no real danger.',
      },
      {
        name: '🐿️ Squirrel Boss — Forest Boss',
        value:
          '❤️ 6 · 🛡️ 12 · ⚔️ d4\n*"Guards the grove fiercely. Attacks with acorns. It\'s fine."*\n**Builder Note:** All bark, no real bite — Defense 12 makes it feel tense to hit, but its d4 keeps outcomes gentle. Read it fierce, play it soft.',
      },
      {
        name: '💀 Bones McGraw — Skeleton',
        value:
          '❤️ 8 · 🛡️ 12 · ⚔️ d6\n*"Rattles when he walks. Rattles louder when he\'s mad."*\n**Builder Note:** In the Brickholm Road, he only shows up if the Graveyard search fails. If every hero searches successfully, skip the fight and let them pass.',
      },
      {
        name: '🐉 Ember the Dragon — Boss',
        value:
          '❤️ 14 · 🛡️ 15 · ⚔️ d8\n**Roar:** any time Ember rolls a natural 20, every hero in her location loses 1 extra Heart brick on top of her regular hit.\n**Builder Note:** Let Roar happen on its own instead of forcing it. If a hero drops to their last Heart brick, consider targeting someone else next turn — the goal is a tense finish, not a wipe.',
      },
    ),
  },
  {
    id: 'treasure',
    label: 'Treasure & Traps',
    emoji: '💰',
    description: 'Book Two · Search the room',
    embed: embed(
      '#B8860B',
      '💰 Treasure & Traps',
      'Some locations hide something. The Builder places one encounter tile face-down before anyone enters.',
    ).addFields(
      {
        name: 'Searching a location',
        value: 'Use your Search action, roll a d20 against Target Number 8. Succeed and the Builder flips the tile.',
      },
      {
        name: 'What you might find',
        value: '**Treasure** — take a Trophy Brick now.\n**Trap** — roll a d20 again at Target 12 to dodge it, or lose 1 Heart brick.',
      },
    ),
  },
  {
    id: 'dungeon',
    label: 'Starter Adventure',
    emoji: '🏰',
    description: 'Book Two · The Brickholm Road',
    embed: embed(
      '#7B5EA7',
      '🏰 Starter Adventure: The Brickholm Road',
      'Build these five 12×12 locations and snap them together in order, with a stud-wide doorway gap between each.',
    ).addFields(
      { name: '1. The Tavern', value: 'Empty and safe — gather your heroes here before you set out.' },
      {
        name: '2. Enchanted Forest',
        value: 'A Vine is waiting, and the Squirrel Boss guards the way through. Both hit gently (d4) — defeat them to move on, or duck into the grove first.',
      },
      { name: 'Hidden Grove (optional)', value: 'Search it (d20, Target 8) for a Trophy Brick — or spring a trap.' },
      {
        name: '3. Old Graveyard',
        value: 'Search here (d20, Target 8) — fail, and Bones McGraw rises from the ground to fight you before you can pass.',
      },
      { name: '4. Castle Keep', value: 'Ember the Dragon, the boss. Beat her and the quest is won — everyone picks a reward!' },
      {
        name: 'Build your own world',
        value:
          'Any 12×12 plate can become any location. Rough blueprints: **Tan** → Tavern (bar + café tables). **Green** → Forest (trees + a log for cover). **Grey** → Ruins (broken walls + gravestones). **Black** → Ashcave (rock spires + torch). **Blue** → Sunken Crossing (stepping stones — treat as a hazard: d20 vs Target 12 or lose 1 Heart brick crossing it).',
      },
    ),
  },
];
