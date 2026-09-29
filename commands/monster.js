import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { MONSTER_TEMPLATES } from '../lib/monsterTemplates.js';
import { spawnMonster, getMonster, listMonsters, adjustMonsterHeart, removeMonster } from '../lib/monsters.js';

const TEMPLATE_CHOICES = Object.entries(MONSTER_TEMPLATES).map(([key, template]) => ({ name: template.label, value: key }));

export const data = new SlashCommandBuilder()
  .setName('monster')
  .setDescription('Builder tools for tracking monster encounters')
  .addSubcommand((sub) =>
    sub
      .setName('spawn')
      .setDescription('Add a tracked monster to the encounter')
      .addStringOption((option) => option.setName('name').setDescription('Name for this monster instance').setRequired(true))
      .addStringOption((option) =>
        option.setName('template').setDescription("Use a rulebook monster's stats").setRequired(false).addChoices(...TEMPLATE_CHOICES),
      )
      .addIntegerOption((option) =>
        option.setName('heart').setDescription('Heart (HP), overrides template').setRequired(false).setMinValue(1),
      )
      .addIntegerOption((option) =>
        option.setName('defense').setDescription('Defense, overrides template').setRequired(false).setMinValue(1),
      )
      .addIntegerOption((option) =>
        option
          .setName('damage')
          .setDescription('Damage die, overrides template')
          .setRequired(false)
          .addChoices({ name: 'd4', value: 4 }, { name: 'd6', value: 6 }, { name: 'd8', value: 8 }, { name: 'd10', value: 10 }),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('sheet')
      .setDescription('View a tracked monster')
      .addStringOption((option) => option.setName('name').setDescription('Which monster').setRequired(true).setAutocomplete(true)),
  )
  .addSubcommand((sub) =>
    sub
      .setName('hp')
      .setDescription("Adjust a monster's Heart")
      .addStringOption((option) => option.setName('name').setDescription('Which monster').setRequired(true).setAutocomplete(true))
      .addStringOption((option) =>
        option
          .setName('action')
          .setDescription('What to do')
          .setRequired(true)
          .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }, { name: 'Set', value: 'set' }),
      )
      .addIntegerOption((option) =>
        option.setName('amount').setDescription('How many Heart bricks').setRequired(true).setMinValue(0),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('remove')
      .setDescription('Stop tracking a monster')
      .addStringOption((option) => option.setName('name').setDescription('Which monster').setRequired(true).setAutocomplete(true)),
  )
  .addSubcommand((sub) => sub.setName('list').setDescription('List all tracked monsters'));

export const autocomplete = async (interaction) => {
  const focused = interaction.options.getFocused();
  const matches = await listMonsters(interaction.guildId, focused);
  await interaction.respond(matches.slice(0, 25).map((name) => ({ name, value: name })));
};

function requireBuilder(interaction) {
  return interaction.member.permissions.has(PermissionFlagsBits.ManageMessages);
}

export const execute = async (interaction) => {
  const sub = interaction.options.getSubcommand();

  if (sub === 'list') {
    const names = await listMonsters(interaction.guildId);
    if (names.length === 0) {
      await interaction.reply('No monsters are currently being tracked.');
      return;
    }
    const monsters = await Promise.all(names.map((name) => getMonster(interaction.guildId, name)));
    const lines = monsters.map((monster) => `• **${monster.label}** — ${monster.heartCurrent}/${monster.heartMax} Heart, Defense ${monster.defense}`);
    await interaction.reply(lines.join('\n'));
    return;
  }

  if (sub === 'sheet') {
    const name = interaction.options.getString('name', true);
    const monster = await getMonster(interaction.guildId, name);
    if (!monster) {
      await interaction.reply({ content: `No tracked monster named "${name}".`, ephemeral: true });
      return;
    }
    await interaction.reply(
      `**${monster.label}**\n❤️ ${monster.heartCurrent}/${monster.heartMax} · 🛡️ Defense ${monster.defense} · ⚔️ d${monster.damageDie}`,
    );
    return;
  }

  if (sub === 'spawn') {
    if (!requireBuilder(interaction)) {
      await interaction.reply({ content: 'Only a moderator (Builder) can spawn monsters.', ephemeral: true });
      return;
    }

    const name = interaction.options.getString('name', true);
    const templateKey = interaction.options.getString('template');
    const template = templateKey ? MONSTER_TEMPLATES[templateKey] : null;
    const heart = interaction.options.getInteger('heart') ?? template?.heart;
    const defense = interaction.options.getInteger('defense') ?? template?.defense;
    const damageDie = interaction.options.getInteger('damage') ?? template?.damageDie;

    if (!heart || !defense || !damageDie) {
      await interaction.reply({ content: 'Provide a template, or all of heart/defense/damage for a custom monster.', ephemeral: true });
      return;
    }

    const monster = await spawnMonster(interaction.guildId, name, { heart, defense, damageDie, label: template?.label ?? name });
    await interaction.reply(
      `🧟 Spawned **${monster.label}** — ${monster.heartCurrent}/${monster.heartMax} Heart, Defense ${monster.defense}, d${monster.damageDie} damage.`,
    );
    return;
  }

  if (sub === 'hp') {
    if (!requireBuilder(interaction)) {
      await interaction.reply({ content: 'Only a moderator (Builder) can adjust monster Heart.', ephemeral: true });
      return;
    }

    const name = interaction.options.getString('name', true);
    const action = interaction.options.getString('action', true);
    const amount = interaction.options.getInteger('amount', true);
    const monster = await adjustMonsterHeart(interaction.guildId, name, action, amount);
    if (!monster) {
      await interaction.reply({ content: `No tracked monster named "${name}".`, ephemeral: true });
      return;
    }

    const defeated = monster.heartCurrent <= 0;
    await interaction.reply(`❤️ **${monster.label}** is now at ${monster.heartCurrent}/${monster.heartMax} Heart.${defeated ? ' 💀 Defeated!' : ''}`);
    return;
  }

  // remove
  if (!requireBuilder(interaction)) {
    await interaction.reply({ content: 'Only a moderator (Builder) can remove monsters.', ephemeral: true });
    return;
  }

  const name = interaction.options.getString('name', true);
  const removed = await removeMonster(interaction.guildId, name);
  await interaction.reply({ content: removed ? `🗑️ Removed **${name}** from tracking.` : `No tracked monster named "${name}".`, ephemeral: !removed });
};
