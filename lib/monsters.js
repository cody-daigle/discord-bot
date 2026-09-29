import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJsonFile, writeJsonFile } from './jsonStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data', 'monsters');

function filePath(guildId) {
  return path.join(DATA_DIR, `${guildId}.json`);
}

function sanitizeName(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

export async function listMonsters(guildId, prefix = '') {
  const monsters = await readJsonFile(filePath(guildId), {});
  const lowerPrefix = prefix.toLowerCase();
  return Object.keys(monsters)
    .filter((key) => key.includes(lowerPrefix))
    .sort();
}

export async function getMonster(guildId, name) {
  const monsters = await readJsonFile(filePath(guildId), {});
  return monsters[sanitizeName(name)] ?? null;
}

export async function spawnMonster(guildId, name, { heart, defense, damageDie, label }) {
  const key = sanitizeName(name);
  if (!key) throw new Error('Invalid monster name.');

  const monsters = await readJsonFile(filePath(guildId), {});
  monsters[key] = { label: label ?? name, heartCurrent: heart, heartMax: heart, defense, damageDie };
  await writeJsonFile(filePath(guildId), monsters);
  return monsters[key];
}

/** Adjusts a monster's current Heart, clamped between 0 and its max. Returns null if it isn't tracked. */
export async function adjustMonsterHeart(guildId, name, action, amount) {
  const key = sanitizeName(name);
  const monsters = await readJsonFile(filePath(guildId), {});
  const monster = monsters[key];
  if (!monster) return null;

  if (action === 'set') monster.heartCurrent = amount;
  else if (action === 'add') monster.heartCurrent += amount;
  else monster.heartCurrent -= amount;
  monster.heartCurrent = Math.max(0, Math.min(monster.heartMax, monster.heartCurrent));

  await writeJsonFile(filePath(guildId), monsters);
  return monster;
}

export async function removeMonster(guildId, name) {
  const key = sanitizeName(name);
  const monsters = await readJsonFile(filePath(guildId), {});
  if (!(key in monsters)) return false;

  delete monsters[key];
  await writeJsonFile(filePath(guildId), monsters);
  return true;
}
