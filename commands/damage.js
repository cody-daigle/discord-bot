import { SlashCommandBuilder } from 'discord.js';
import { getCharacter } from '../lib/characters.js';
import { CLASSES } from '../lib/artifaktClasses.js';
import { rollDie } from '../lib/dice.js';

export const data = new SlashCommandBuilder().setName('damage').setDescription("Roll your class's damage die");

export const execute = async (interaction) => {
  const character = await getCharacter(interaction.guildId, interaction.user.id);
  if (!character) {
    await interaction.reply({ content: "You don't have a character yet. Use `/character create`.", ephemeral: true });
    return;
  }

  const classData = CLASSES[character.class];
  const result = rollDie(classData.attackDie);
  await interaction.reply(`⚔️ **${character.name}** rolls ${classData.attackName} (d${classData.attackDie}): **${result}** damage!`);
};
