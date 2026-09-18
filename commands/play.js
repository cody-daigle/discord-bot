import { SlashCommandBuilder } from 'discord.js';
import { spawn } from 'node:child_process';
import { getOrCreateGuildPlayer } from '../lib/musicQueue.js';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play a song in your voice channel by searching YouTube')
  .addStringOption((option) =>
    option
      .setName('song')
      .setDescription('Name of the song to search for')
      .setRequired(true),
  );

// READ (external): this doesn't touch our own Map, it reads a search result from YouTube.
function searchYouTube(query) {
  return new Promise((resolve, reject) => {
    // "ytsearch1:" tells yt-dlp to search YouTube and only return the top match.
    const proc = spawn('yt-dlp', [
      '--no-playlist',
      '--dump-json',
      `ytsearch1:${query}`,
    ]);
    let stdout = ''; // collects yt-dlp's JSON output as it streams in
    let stderr = ''; // collects any error output, used in the rejection message below
    proc.stdout.on('data', (chunk) => (stdout += chunk));
    proc.stderr.on('data', (chunk) => (stderr += chunk));
    proc.on('error', reject); // e.g. the yt-dlp binary isn't installed or on PATH
    proc.on('close', (code) => {
      // --dump-json prints one JSON object per line; we only asked for 1 result.
      const firstLine = stdout.split('\n').find((line) => line.trim());
      if (code !== 0 || !firstLine) {
        reject(new Error(stderr.trim() || 'yt-dlp search failed'));
        return;
      }
      try {
        // Parsed video metadata: gives us .title and .webpage_url for later.
        resolve(JSON.parse(firstLine));
      } catch (error) {
        reject(error);
      }
    });
  });
}

export const execute = async (interaction) => {
  // READ: get the voice channel the person running the command is currently sitting in.
  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    await interaction.reply({
      content: 'You need to be in a voice channel to play music.',
      ephemeral: true,
    });
    return;
  }

  // Acknowledge the interaction right away — searching YouTube and joining voice can
  // both take longer than Discord's 3-second window for an initial response.
  await interaction.deferReply();

  // READ: pull the required "song" text the user typed as this command's argument.
  const query = interaction.options.getString('song', true);

  let video;
  try {
    // READ (external): look the song up on YouTube; see searchYouTube() above.
    video = await searchYouTube(query);
  } catch (error) {
    console.error('YouTube search failed:', error);
    await interaction.editReply(
      `Search failed for "${query}": ${error.message}`,
    );
    return;
  }

  // READ-OR-CREATE: if this guild already has a player in the Map, reuse it (READ);
  // otherwise join the voice channel and CREATE a new one and store it in the Map.
  // Returns null if joining the voice channel timed out.
  const guildPlayer = await getOrCreateGuildPlayer(voiceChannel);
  if (!guildPlayer) {
    await interaction.editReply('Could not join the voice channel in time.');
    return;
  }

  // CREATE: push this song onto the guild's queue array (see enqueue() in musicQueue.js).
  const startedImmediately = guildPlayer.enqueue({
    title: video.title,
    url: video.webpage_url,
  });

  await interaction.editReply(
    startedImmediately ?
      `🎵 Now playing **${video.title}**`
    // READ: check how many tracks are still waiting, to report this song's queue position.
    : `➕ Added **${video.title}** to the queue (position ${guildPlayer.queue.length})`,
  );
};
