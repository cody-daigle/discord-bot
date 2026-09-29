import { SlashCommandBuilder } from 'discord.js';
import { createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } from '@discordjs/voice';
import { createReadStream } from 'node:fs';
import { ensureVoiceConnection } from '../lib/voiceConnection.js';
import { getGuildPlayer } from '../lib/musicQueue.js';
import { getClipPath, clipExists, listClips } from '../lib/clips.js';

export const data = new SlashCommandBuilder()
  .setName('clip')
  .setDescription('Play back a recorded voice clip')
  .addStringOption((option) =>
    option.setName('name').setDescription('Which clip to play').setRequired(true).setAutocomplete(true),
  );

export const autocomplete = async (interaction) => {
  const focused = interaction.options.getFocused();
  const matches = await listClips(interaction.guildId, focused);
  await interaction.respond(matches.slice(0, 25).map((name) => ({ name, value: name })));
};

export const execute = async (interaction) => {
  const name = interaction.options.getString('name', true);

  if (!(await clipExists(interaction.guildId, name))) {
    await interaction.reply({ content: `No clip named "${name}" found. Record one with \`/record\`.`, ephemeral: true });
    return;
  }

  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    await interaction.reply({ content: 'You need to be in a voice channel to play a clip.', ephemeral: true });
    return;
  }

  await interaction.deferReply();

  const connection = await ensureVoiceConnection(voiceChannel);
  if (!connection) {
    await interaction.editReply('Could not join the voice channel in time.');
    return;
  }

  const clipPlayer = createAudioPlayer();
  const resource = createAudioResource(createReadStream(getClipPath(interaction.guildId, name)), {
    inputType: StreamType.Arbitrary,
  });

  connection.subscribe(clipPlayer);
  clipPlayer.play(resource);

  clipPlayer.on(AudioPlayerStatus.Idle, () => {
    // Hand the connection back to the music player, if one was active, so /play can keep going.
    const guildPlayer = getGuildPlayer(interaction.guildId);
    if (guildPlayer) connection.subscribe(guildPlayer.player);
  });

  clipPlayer.on('error', (error) => {
    console.error('Clip playback failed:', error);
  });

  await interaction.editReply(`▶️ Playing clip **${name}**`);
};
