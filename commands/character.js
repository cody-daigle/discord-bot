import { SlashCommandBuilder } from 'discord.js';
import { CLASSES } from '../lib/artifaktClasses.js';
import { getCharacter, createCharacter } from '../lib/characters.js';

const CLASS_CHOICES = Object.entries(CLASSES).map(([key, data]) => ({ name: `${data.label} (${data.role})`, value: key }));

export const data = new SlashCommandBuilder()
  .setName('character')
  .setDescription('Manage your Artifakt: Brickquest character')
  .addSubcommand((sub) =>
    sub
      .setName('create')
      .setDescription('Create (or replace) your character')
      .addStringOption((option) => option.setName('name').setDescription("Your minifig's name").setRequired(true))
      .addStringOption((option) =>
        option.setName('class').setDescription('Your class').setRequired(true).addChoices(...CLASS_CHOICES),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('sheet')
      .setDescription("View a character's sheet")
      .addUserOption((option) =>
        option.setName('user').setDescription('Whose sheet to view (defaults to you)').setRequired(false),
      ),
  );

function heartBar(current, max) {
  return `${'❤️'.repeat(current)}${'🖤'.repeat(Math.max(0, max - current))} (${current}/${max})`;
}

export const execute = async (interaction) => {
  const sub = interaction.options.getSubcommand();

  if (sub === 'create') {
    const name = interaction.options.getString('name', true);
    const classKey = interaction.options.getString('class', true);
    const classData = CLASSES[classKey];

    const character = await createCharacter(interaction.guildId, interaction.user.id, name, classKey);
    await interaction.reply(
      `🧱 Created **${name}** the ${classData.label}!\n` +
        `${heartBar(character.heartCurrent, character.heartMax)} · 🛡️ Defense ${classData.defense} · ⚔️ ${classData.attackName} (d${classData.attackDie})`,
    );
    return;
  }

  // sheet
  const targetUser = interaction.options.getUser('user') ?? interaction.user;
  const character = await getCharacter(interaction.guildId, targetUser.id);
  if (!character) {
    await interaction.reply({
      content: `${targetUser.id === interaction.user.id ? "You don't" : `${targetUser.username} doesn't`} have a character yet. Use \`/character create\`.`,
      ephemeral: true,
    });
    return;
  }

  const classData = CLASSES[character.class];
  await interaction.reply(
    `**${character.name}** — ${classData.label} (${classData.role})\n` +
      `${heartBar(character.heartCurrent, character.heartMax)} · 🛡️ Defense ${classData.defense} · ⚔️ ${classData.attackName} (d${classData.attackDie})\n` +
      `**Trick:** ${classData.trick}\n**Skill:** ${classData.skill}`,
  );
};
