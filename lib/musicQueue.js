import { createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, StreamType } from '@discordjs/voice';
import { spawn } from 'node:child_process';
import { ensureVoiceConnection } from './voiceConnection.js';

// The shared store: one GuildMusicPlayer per guild ID.
// All CRUD operations on server music state happen against this Map.
const guildPlayers = new Map();

function streamAudio(url) {
  const proc = spawn('yt-dlp', ['-f', 'bestaudio', '-o', '-', '--no-playlist', '--quiet', '--no-warnings', url]);
  proc.stderr.on('data', () => {});
  proc.on('error', (error) => console.error('yt-dlp process error:', error));
  return proc;
}

class GuildMusicPlayer {
  constructor(guildId, connection) {
    this.guildId = guildId;
    this.connection = connection;
    this.player = createAudioPlayer();
    this.queue = [];
    this.current = null;
    this.process = null;

    connection.subscribe(this.player);

    this.player.on(AudioPlayerStatus.Idle, () => {
      this.current = null;
      this.playNext();
    });

    this.player.on('error', (error) => {
      console.error(error);
      this.current = null;
      this.playNext();
    });
  }

  /** Adds a track to the queue. Returns true if it started playing immediately. */
  enqueue(track) {
    // CREATE: append the new track to the end of this guild's queue array.
    this.queue.push(track);
    if (!this.current) {
      this.playNext();
      return true;
    }
    return false;
  }

  playNext() {
    // READ + DELETE: pull the first track off the front of the queue array.
    // shift() both returns it and removes it in one step.
    const next = this.queue.shift();
    if (!next) {
      this.current = null;
      return;
    }

    // UPDATE: this guild's "now playing" state moves to the track we just took.
    this.current = next;
    this.process = streamAudio(next.url);
    const resource = createAudioResource(this.process.stdout, { inputType: StreamType.Arbitrary });
    this.player.play(resource);
  }

  skip() {
    this.process?.kill();
    this.player.stop();
  }

  stop() {
    // UPDATE: empty out the queue array (drop everything still waiting).
    this.queue = [];
    this.process?.kill();
    this.player.stop();
    if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
      this.connection.destroy();
    }
    // DELETE: remove this guild's entry from the shared Map entirely,
    // so the next /play has to CREATE a fresh one.
    guildPlayers.delete(this.guildId);
  }
}

export function getGuildPlayer(guildId) {
  // READ: fetch this guild's player, or undefined if none exists yet.
  return guildPlayers.get(guildId);
}

export async function getOrCreateGuildPlayer(voiceChannel) {
  // READ: check whether this guild already has a player before making a new one.
  const existing = guildPlayers.get(voiceChannel.guild.id);
  if (existing) return existing;

  const connection = await ensureVoiceConnection(voiceChannel);
  if (!connection) return null;

  // CREATE: build the new player and store it in the Map under this guild's ID.
  const guildPlayer = new GuildMusicPlayer(voiceChannel.guild.id, connection);
  guildPlayers.set(voiceChannel.guild.id, guildPlayer);
  return guildPlayer;
}
