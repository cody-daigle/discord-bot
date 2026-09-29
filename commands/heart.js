import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getCharacter, adjustHeart } from '../lib/characters.js';

export const data = new SlashCommandBuilder()
  .setName('heart')
  .setDescription("Adjust a character's Heart (HP)")
  .addStringOption((option) =>
    option
      .setName('action')
      .setDescription('What to do')
      .setRequired(true)
      .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }, { name: 'Set', value: 'set' }),
  )
  .addIntegerOption((option) =>
    option.setName('amount').setDescription('How many Heart bricks').setRequired(true).setMinValue(0),
  )
  .addUserOption((option) =>
    option.setName('user').setDescription("Whose Heart to adjust (defaults to you)").setRequired(false),
  );

export const execute = async (interaction) => {
  const targetUser = interaction.options.getUser('user') ?? interaction.user;
  const action = interaction.options.getString('action', true);
  const amount = interaction.options.getInteger('amount', true);

  if (targetUser.id !== interaction.user.id && !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    await interaction.reply({ content: "Only a moderator (Builder) can adjust someone else's Heart.", ephemeral: true });
    return;
  }

  const character = await getCharacter(interaction.guildId, targetUser.id);
  if (!character) {
    await interaction.reply({ content: `${targetUser.username} doesn't have a character yet.`, ephemeral: true });
    return;
  }

  const updated = await adjustHeart(interaction.guildId, targetUser.id, action, amount);
  const resting = updated.heartCurrent === 0;
  await interaction.reply(
    `❤️ **${updated.name}** is now at ${updated.heartCurrent}/${updated.heartMax} Heart.` +
      (resting ? ' 💀 Resting — sit out a round, then return with 2 Heart bricks.' : ''),
  );
};
