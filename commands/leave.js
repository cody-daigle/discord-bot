import { SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { getGuildPlayer } from '../lib/musicQueue.js';

export const data = new SlashCommandBuilder()
  .setName('leave')
  .setDescription('Disconnect the bot from voice');

export const execute = async (interaction) => {
  const guildPlayer = getGuildPlayer(interaction.guildId);
  if (guildPlayer) {
    guildPlayer.stop();
    await interaction.reply('👋 Left the voice channel.');
    return;
  }

  const connection = getVoiceConnection(interaction.guildId);
  if (!connection) {
    await interaction.reply({ content: "I'm not in a voice channel.", ephemeral: true });
    return;
  }

  if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
    connection.destroy();
  }
  await interaction.reply('👋 Left the voice channel.');
};
