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
import { spawn } from 'node:child_process';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play a song in your voice channel by searching YouTube')
  .addStringOption((option) =>
    option.setName('song').setDescription('Name of the song to search for').setRequired(true),
  );

function searchYouTube(query) {
  return new Promise((resolve, reject) => {
    const proc = spawn('yt-dlp', ['--no-playlist', '--dump-json', `ytsearch1:${query}`]);
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (chunk) => (stdout += chunk));
    proc.stderr.on('data', (chunk) => (stderr += chunk));
    proc.on('error', reject);
    proc.on('close', (code) => {
      const firstLine = stdout.split('\n').find((line) => line.trim());
      if (code !== 0 || !firstLine) {
        reject(new Error(stderr.trim() || 'yt-dlp search failed'));
        return;
      }
      try {
        resolve(JSON.parse(firstLine));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function streamAudio(url) {
  const proc = spawn('yt-dlp', ['-f', 'bestaudio', '-o', '-', '--no-playlist', '--quiet', '--no-warnings', url]);
  proc.stderr.on('data', () => {});
  return proc;
}

export const execute = async (interaction) => {
  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    await interaction.reply({ content: 'You need to be in a voice channel to play music.', ephemeral: true });
    return;
  }

  await interaction.deferReply();

  const query = interaction.options.getString('song', true);

  let video;
  try {
    video = await searchYouTube(query);
  } catch (error) {
    console.error('YouTube search failed:', error);
    await interaction.editReply(`Search failed for "${query}": ${error.message}`);
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
  const ytdlpProcess = streamAudio(video.webpage_url);
  ytdlpProcess.on('error', (error) => {
    console.error('yt-dlp process error:', error);
  });

  const resource = createAudioResource(ytdlpProcess.stdout, { inputType: StreamType.Arbitrary });

  const leaveVoiceChannel = () => {
    ytdlpProcess.kill();
    if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
      connection.destroy();
    }
  };

  player.on('error', (error) => {
    console.error(error);
    leaveVoiceChannel();
    interaction.editReply(`Playback failed: ${error.message}`).catch(() => {});
  });
  player.on(AudioPlayerStatus.Idle, () => {
    leaveVoiceChannel();
  });

  connection.subscribe(player);
  player.play(resource);

  await interaction.editReply(`🎵 Now playing **${video.title}**`);
};
