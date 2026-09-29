import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJsonFile, writeJsonFile } from './jsonStore.js';
import { CLASSES } from './artifaktClasses.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data', 'characters');

function filePath(guildId) {
  return path.join(DATA_DIR, `${guildId}.json`);
}

export async function getCharacter(guildId, userId) {
  const characters = await readJsonFile(filePath(guildId), {});
  return characters[userId] ?? null;
}

export async function createCharacter(guildId, userId, name, classKey) {
  const classData = CLASSES[classKey];
  if (!classData) throw new Error('Unknown class.');

  const characters = await readJsonFile(filePath(guildId), {});
  characters[userId] = {
    name,
    class: classKey,
    heartCurrent: classData.heart,
    heartMax: classData.heart,
  };
  await writeJsonFile(filePath(guildId), characters);
  return characters[userId];
}

/** Adjusts a character's current Heart, clamped between 0 and their max. Returns null if they have no character. */
export async function adjustHeart(guildId, userId, action, amount) {
  const characters = await readJsonFile(filePath(guildId), {});
  const character = characters[userId];
  if (!character) return null;

  if (action === 'set') character.heartCurrent = amount;
  else if (action === 'add') character.heartCurrent += amount;
  else character.heartCurrent -= amount;
  character.heartCurrent = Math.max(0, Math.min(character.heartMax, character.heartCurrent));

  await writeJsonFile(filePath(guildId), characters);
  return character;
}
