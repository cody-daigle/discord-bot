import { SlashCommandBuilder } from 'discord.js';
import { getCharacter } from '../lib/characters.js';
import { CLASSES } from '../lib/artifaktClasses.js';
import { getMonster, listMonsters, adjustMonsterHeart } from '../lib/monsters.js';
import { rollDie } from '../lib/dice.js';

export const data = new SlashCommandBuilder()
  .setName('attack')
  .setDescription('Attack a tracked monster with your character')
  .addStringOption((option) =>
    option.setName('target').setDescription('Which monster to attack').setRequired(true).setAutocomplete(true),
  );

export const autocomplete = async (interaction) => {
  const focused = interaction.options.getFocused();
  const matches = await listMonsters(interaction.guildId, focused);
  await interaction.respond(matches.slice(0, 25).map((name) => ({ name, value: name })));
};

export const execute = async (interaction) => {
  const targetName = interaction.options.getString('target', true);

  const character = await getCharacter(interaction.guildId, interaction.user.id);
  if (!character) {
    await interaction.reply({ content: "You don't have a character yet. Use `/character create`.", ephemeral: true });
    return;
  }

  const monster = await getMonster(interaction.guildId, targetName);
  if (!monster) {
    await interaction.reply({ content: `No tracked monster named "${targetName}". Ask your Builder to \`/monster spawn\` it.`, ephemeral: true });
    return;
  }

  const classData = CLASSES[character.class];
  const roll = rollDie(20);
  const isNat20 = roll === 20;
  const isNat1 = roll === 1;
  const hit = isNat20 || (!isNat1 && roll >= monster.defense);

  if (!hit) {
    await interaction.reply(
      `🎲 **${character.name}** rolls **${roll}** vs ${monster.label}'s Defense ${monster.defense} — **Miss!**`,
    );
    return;
  }

  const damage = isNat20 ? classData.attackDie : rollDie(classData.attackDie);
  const updatedMonster = await adjustMonsterHeart(interaction.guildId, targetName, 'remove', damage);
  const defeated = updatedMonster.heartCurrent <= 0;

  await interaction.reply(
    `🎲 **${character.name}** rolls **${roll}** vs ${monster.label}'s Defense ${monster.defense} — **Hit!**${isNat20 ? ' (Natural 20 — max damage!)' : ''}\n` +
      `⚔️ ${classData.attackName} deals **${damage}** damage. ${monster.label} is now at ${updatedMonster.heartCurrent}/${updatedMonster.heartMax} Heart.` +
      (defeated ? `\n💀 **${monster.label} is defeated!**` : ''),
  );
};
