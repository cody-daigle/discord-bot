import { SlashCommandBuilder } from 'discord.js';
import { ensureVoiceConnection } from '../lib/voiceConnection.js';

export const data = new SlashCommandBuilder()
  .setName('join')
  .setDescription('Bring the bot into your voice channel ahead of time (e.g. before recording)');

export const execute = async (interaction) => {
  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    await interaction.reply({ content: 'You need to be in a voice channel first.', ephemeral: true });
    return;
  }

  await interaction.deferReply();

  const connection = await ensureVoiceConnection(voiceChannel);
  if (!connection) {
    await interaction.editReply('Could not join the voice channel in time.');
    return;
  }

  await interaction.editReply(`👋 Joined **${voiceChannel.name}** — ready to go, including \`/record\` with no join delay.`);
};
