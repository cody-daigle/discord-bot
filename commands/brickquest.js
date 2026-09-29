import {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';
import { SECTIONS, OVERVIEW_EMBED, BRICK_QUEST_URL } from '../lib/brickQuestContent.js';

export const data = new SlashCommandBuilder()
  .setName('brickquest')
  .setDescription('Browse the Artifakt: Brickquest rulebook');

function buildComponents(selectedId) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('brickquest-section')
    .setPlaceholder('Choose a rulebook section...')
    .addOptions(
      SECTIONS.map((section) => ({
        label: section.label,
        value: section.id,
        description: section.description,
        emoji: section.emoji,
        default: section.id === selectedId,
      })),
    );

  const linkButton = new ButtonBuilder()
    .setLabel('Open full rulebook & character sheet')
    .setStyle(ButtonStyle.Link)
    .setURL(BRICK_QUEST_URL);

  return [new ActionRowBuilder().addComponents(menu), new ActionRowBuilder().addComponents(linkButton)];
}

export const execute = async (interaction) => {
  await interaction.reply({
    embeds: [OVERVIEW_EMBED],
    components: buildComponents(null),
  });

  const message = await interaction.fetchReply();
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter: (i) => i.user.id === interaction.user.id,
    time: 15 * 60 * 1000,
  });

  collector.on('collect', async (selectInteraction) => {
    try {
      const section = SECTIONS.find((s) => s.id === selectInteraction.values[0]);
      await selectInteraction.update({
        embeds: [section.embed],
        components: buildComponents(section.id),
      });
    } catch (error) {
      console.error('brickquest dropdown update failed:', error);
    }
  });

  collector.on('end', () => {
    interaction.editReply({ components: [] }).catch(() => {});
  });
};
