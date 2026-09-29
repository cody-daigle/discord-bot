import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { listClips, deleteClip, clipExists, getClipOwner } from '../lib/clips.js';

export const data = new SlashCommandBuilder()
  .setName('deleteclip')
  .setDescription('Delete a recorded voice clip')
  .addStringOption((option) =>
    option.setName('name').setDescription('Which clip to delete').setRequired(true).setAutocomplete(true),
  );

export const autocomplete = async (interaction) => {
  const focused = interaction.options.getFocused();
  const matches = await listClips(interaction.guildId, focused);
  await interaction.respond(matches.slice(0, 25).map((name) => ({ name, value: name })));
};

export const execute = async (interaction) => {
  const name = interaction.options.getString('name', true);

  if (!(await clipExists(interaction.guildId, name))) {
    await interaction.reply({ content: `No clip named "${name}" found.`, ephemeral: true });
    return;
  }

  const ownerId = await getClipOwner(interaction.guildId, name);
  const isOwner = ownerId === interaction.user.id;
  const isModerator = interaction.member.permissions.has(PermissionFlagsBits.ManageMessages);

  if (!isOwner && !isModerator) {
    await interaction.reply({
      content: 'Only the person who recorded this clip, or a moderator, can delete it.',
      ephemeral: true,
    });
    return;
  }

  const deleted = await deleteClip(interaction.guildId, name);
  await interaction.reply(deleted ? `🗑️ Deleted clip **${name}**.` : `Could not delete "${name}".`);
};
