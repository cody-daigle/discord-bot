import { SlashCommandBuilder } from 'discord.js';
import { ensureVoiceConnection } from '../lib/voiceConnection.js';
import { recordUserClip, getClipPath, setClipOwner, NO_SPEECH_ERROR } from '../lib/clips.js';

const SPEAK_TIMEOUT_MS = 20_000;
const MAX_CLIP_MS = 30_000;
const SILENCE_MS = 1_200;

export const data = new SlashCommandBuilder()
  .setName('record')
  .setDescription('Record a short voice clip from someone in your voice channel')
  .addStringOption((option) => option.setName('name').setDescription('Name to save the clip as').setRequired(true))
  .addUserOption((option) => option.setName('user').setDescription('Who to record (defaults to you)').setRequired(false));

export const execute = async (interaction) => {
  const targetUser = interaction.options.getUser('user') ?? interaction.user;
  const name = interaction.options.getString('name', true);

  if (!getClipPath(interaction.guildId, name)) {
    await interaction.reply({ content: 'That name has no usable characters — try letters, numbers, or dashes.', ephemeral: true });
    return;
  }

  const targetMember = await interaction.guild.members.fetch(targetUser.id);
  const voiceChannel = targetMember.voice.channel;
  if (!voiceChannel) {
    await interaction.reply({
      content: `${targetUser.id === interaction.user.id ? 'You need' : `${targetUser.username} needs`} to be in a voice channel to record.`,
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  const connection = await ensureVoiceConnection(voiceChannel);
  if (!connection) {
    await interaction.editReply('Could not join the voice channel in time.');
    return;
  }

  // Subscribing happens inside recordUserClip before this message is even sent,
  // so there's no gap between "ready" and actually capturing audio.
  const recordingPromise = recordUserClip(connection, targetUser.id, interaction.guildId, name, {
    silenceMs: SILENCE_MS,
    maxMs: MAX_CLIP_MS,
    startTimeoutMs: SPEAK_TIMEOUT_MS,
  });

  await interaction.editReply(`🔴 Ready — **${targetUser.username}** can talk now (stops automatically after a pause)`);

  try {
    await recordingPromise;
  } catch (error) {
    if (error.message === NO_SPEECH_ERROR) {
      await interaction.editReply(`No speech detected from **${targetUser.username}** in time. Try again.`);
    } else {
      console.error('Recording failed:', error);
      await interaction.editReply('Recording failed — see the bot logs for details.');
    }
    return;
  }

  await setClipOwner(interaction.guildId, name, interaction.user.id);

  await interaction.editReply(`✅ Saved clip **${name}** from **${targetUser.username}**. Play it back with \`/clip name:${name}\`.`);
};
