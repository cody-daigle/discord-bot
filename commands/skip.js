import { SlashCommandBuilder } from 'discord.js';
import { getGuildPlayer } from '../lib/musicQueue.js';

export const data = new SlashCommandBuilder().setName('skip').setDescription('Skip the current song');

export const execute = async (interaction) => {
  const guildPlayer = getGuildPlayer(interaction.guildId);
  if (!guildPlayer?.current) {
    await interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });
    return;
  }

  const skipped = guildPlayer.current.title;
  guildPlayer.skip();
  await interaction.reply(`⏭️ Skipped **${skipped}**`);
};
