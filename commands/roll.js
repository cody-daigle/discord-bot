import { SlashCommandBuilder } from 'discord.js';
import { rollDie } from '../lib/dice.js';

export const data = new SlashCommandBuilder()
  .setName('roll')
  .setDescription('Roll a die')
  .addIntegerOption((option) =>
    option
      .setName('sides')
      .setDescription('Number of sides (defaults to d20)')
      .setRequired(false)
      .addChoices(
        { name: 'd4', value: 4 },
        { name: 'd6', value: 6 },
        { name: 'd8', value: 8 },
        { name: 'd10', value: 10 },
        { name: 'd20', value: 20 },
      ),
  );

export const execute = async (interaction) => {
  const sides = interaction.options.getInteger('sides') ?? 20;
  const result = rollDie(sides);

  let suffix = '';
  if (sides === 20 && result === 20) suffix = ' — **Natural 20!** Auto-hit, max damage.';
  else if (sides === 20 && result === 1) suffix = ' — **Natural 1.** Auto-miss.';

  await interaction.reply(`🎲 **${interaction.user.username}** rolled a d${sides}: **${result}**${suffix}`);
};
