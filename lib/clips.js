import { EndBehaviorType } from '@discordjs/voice';
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import ffmpegPath from 'ffmpeg-static';
import prism from 'prism-media';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIPS_DIR = path.join(__dirname, '..', 'clips');

function sanitizeClipName(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

function guildClipsDir(guildId) {
  return path.join(CLIPS_DIR, guildId);
}

export function getClipPath(guildId, name) {
  const safeName = sanitizeClipName(name);
  if (!safeName) return null;
  return path.join(guildClipsDir(guildId), `${safeName}.ogg`);
}

export async function clipExists(guildId, name) {
  const clipPath = getClipPath(guildId, name);
  if (!clipPath) return false;
  try {
    await fs.access(clipPath);
    return true;
  } catch {
    return false;
  }
}

function metadataPath(guildId) {
  return path.join(guildClipsDir(guildId), '_metadata.json');
}

async function readMetadata(guildId) {
  try {
    return JSON.parse(await fs.readFile(metadataPath(guildId), 'utf8'));
  } catch {
    return {};
  }
}

async function writeMetadata(guildId, metadata) {
  await fs.mkdir(guildClipsDir(guildId), { recursive: true });
  await fs.writeFile(metadataPath(guildId), JSON.stringify(metadata, null, 2));
}

/** Records which user ran /record for a clip, so only they (or a moderator) can delete it later. */
export async function setClipOwner(guildId, name, userId) {
  const safeName = sanitizeClipName(name);
  if (!safeName) return;
  const metadata = await readMetadata(guildId);
  metadata[safeName] = { recordedBy: userId, recordedAt: new Date().toISOString() };
  await writeMetadata(guildId, metadata);
}

/** Returns the user id who recorded a clip, or null if unknown (e.g. clips saved before this existed). */
export async function getClipOwner(guildId, name) {
  const safeName = sanitizeClipName(name);
  if (!safeName) return null;
  const metadata = await readMetadata(guildId);
  return metadata[safeName]?.recordedBy ?? null;
}

/** Deletes a saved clip and its ownership record. Returns false if it didn't exist. */
export async function deleteClip(guildId, name) {
  const clipPath = getClipPath(guildId, name);
  if (!clipPath) return false;
  try {
    await fs.unlink(clipPath);
  } catch {
    return false;
  }

  const safeName = sanitizeClipName(name);
  const metadata = await readMetadata(guildId);
  if (safeName in metadata) {
    delete metadata[safeName];
    await writeMetadata(guildId, metadata);
  }
  return true;
}

export async function listClips(guildId, prefix = '') {
  try {
    const files = await fs.readdir(guildClipsDir(guildId));
    const lowerPrefix = prefix.toLowerCase();
    return files
      .filter((file) => file.endsWith('.ogg'))
      .map((file) => file.slice(0, -'.ogg'.length))
      .filter((name) => name.includes(lowerPrefix))
      .sort();
  } catch {
    return [];
  }
}

export const NO_SPEECH_ERROR = 'NO_SPEECH';

/**
 * Records a single user's voice, saving it as an Ogg/Opus file.
 *
 * Subscribes to their audio stream immediately (not after detecting speech) —
 * @discordjs/voice's AfterSilence end-behavior only starts its silence timer once
 * a real packet arrives, so subscribing early is safe and never cuts off early
 * speech the way "wait for the speaking event, then subscribe" would: by the time
 * that event fires, the packet that triggered it has already gone unrecorded.
 * A separate timer aborts the whole recording if the user never speaks at all.
 */
export function recordUserClip(connection, userId, guildId, name, { silenceMs = 1200, maxMs = 30_000, startTimeoutMs = 20_000 } = {}) {
  const clipPath = getClipPath(guildId, name);
  if (!clipPath) throw new Error('Invalid clip name.');

  // Subscribing is the very first thing this function does, with no `await`
  // ahead of it — so it runs synchronously the instant the caller invokes this,
  // before anything else (including telling the user "go ahead and talk") can happen.
  const opusStream = connection.receiver.subscribe(userId, {
    end: { behavior: EndBehaviorType.AfterSilence, duration: silenceMs },
  });

  const onSpeakingStart = (speakingUserId) => {
    if (speakingUserId === userId) clearTimeout(startTimer);
  };
  connection.receiver.speaking.on('start', onSpeakingStart);

  const startTimer = setTimeout(() => opusStream.destroy(new Error(NO_SPEECH_ERROR)), startTimeoutMs);
  const maxTimer = setTimeout(() => opusStream.destroy(), maxMs);

  const decoder = new prism.opus.Decoder({ rate: 48_000, channels: 2, frameSize: 960 });
  const ffmpeg = spawn(ffmpegPath, [
    '-f', 's16le', '-ar', '48000', '-ac', '2', '-i', 'pipe:0',
    '-f', 'ogg', '-acodec', 'libopus',
    'pipe:1',
  ]);
  ffmpeg.stderr.on('data', () => {});

  // Both legs of the pipe must run concurrently: ffmpeg streams stdout out as
  // it reads stdin, so awaiting the input leg alone would let ffmpeg's stdout
  // buffer fill up and stall the whole process. The output leg waits on mkdir
  // (parallel, not blocking the subscribe above), the input leg starts at once.
  return Promise.all([
    pipeline(opusStream, decoder, ffmpeg.stdin),
    fs.mkdir(path.dirname(clipPath), { recursive: true }).then(() => pipeline(ffmpeg.stdout, createWriteStream(clipPath))),
  ]).finally(() => {
    clearTimeout(startTimer);
    clearTimeout(maxTimer);
    connection.receiver.speaking.off('start', onSpeakingStart);
  });
}
