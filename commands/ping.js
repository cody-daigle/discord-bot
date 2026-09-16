import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with the bot\'s latency');

export async function execute(interaction) {
  await interaction.reply('Pinging...');
  const latency = Date.now() - interaction.createdTimestamp;
  await interaction.editReply(`Pong! Latency: ${latency}ms | API: ${Math.round(interaction.client.ws.ping)}ms`);
}
