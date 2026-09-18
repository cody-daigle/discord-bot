import { SlashCommandBuilder } from 'discord.js';
import { getGuildPlayer } from '../lib/musicQueue.js';

export const data = new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Stop playback, clear the queue, and leave the voice channel');

export const execute = async (interaction) => {
  // READ: look up this server's player in the shared guildPlayers Map by guild ID.
  const guildPlayer = getGuildPlayer(interaction.guildId);
  if (!guildPlayer) {
    // Nothing was ever created for this guild, so there's nothing to stop.
    await interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });
    return;
  }

  // DELETE: guildPlayer.stop() clears the queue, kills the audio process,
  // destroys the voice connection, and removes this guild's entry from the Map.
  guildPlayer.stop();
  await interaction.reply('⏹️ Stopped playback and cleared the queue.');
};
