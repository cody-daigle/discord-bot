import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('hello')
  .setDescription('Says hello back to you');

export async function execute(interaction) {
  await interaction.reply(`Hey there, ${interaction.user.username}!`);
}
