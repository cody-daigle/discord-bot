import { SlashCommandBuilder } from 'discord.js';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  entersState,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  StreamType,
} from '@discordjs/voice';
import { YouTube } from 'youtube-sr';
import ytdl from '@distube/ytdl-core';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play a song in your voice channel by searching YouTube')
  .addStringOption((option) =>
    option.setName('song').setDescription('Name of the song to search for').setRequired(true),
  );

export const execute = async (interaction) => {
  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    await interaction.reply({ content: 'You need to be in a voice channel to play music.', ephemeral: true });
    return;
  }

  await interaction.deferReply();

  const query = interaction.options.getString('song', true);
  const video = await YouTube.searchOne(query, 'video').catch(() => null);
  if (!video) {
    await interaction.editReply(`No YouTube results found for "${query}".`);
    return;
  }

  let connection = getVoiceConnection(interaction.guildId);
  if (!connection) {
    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    } catch (error) {
      connection.destroy();
      console.error(error);
      await interaction.editReply('Could not join the voice channel in time.');
      return;
    }
  }

  const player = createAudioPlayer();
  const stream = ytdl(video.url, { filter: 'audioonly', highWaterMark: 1 << 25 });
  const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });

  player.on('error', (error) => {
    console.error(error);
    connection.destroy();
  });
  player.on(AudioPlayerStatus.Idle, () => {
    connection.destroy();
  });

  connection.subscribe(player);
  player.play(resource);

  await interaction.editReply(`🎵 Now playing **${video.title}**`);
};
