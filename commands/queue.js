import { SlashCommandBuilder } from 'discord.js';
import { getGuildPlayer } from '../lib/musicQueue.js';

export const data = new SlashCommandBuilder().setName('queue').setDescription('Show the current song and up-next queue');

export const execute = async (interaction) => {
  const guildPlayer = getGuildPlayer(interaction.guildId);
  if (!guildPlayer?.current) {
    await interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });
    return;
  }

  const upNext = guildPlayer.queue.map((track, index) => `${index + 1}. ${track.title}`).join('\n');

  await interaction.reply(
    `🎵 Now playing: **${guildPlayer.current.title}**` + (upNext ? `\n\n**Up next:**\n${upNext}` : '\n\nQueue is empty.'),
  );
};
