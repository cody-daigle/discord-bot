import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} from 'discord.js';
import { proofreadStory, ProofreadError } from '../lib/proofreader.js';

// Discord's hard limits for a modal text input and an embed description
const MAX_STORY_LENGTH = 4000;
const MAX_EMBED_DESCRIPTION = 4096;

export const data = new SlashCommandBuilder()
  .setName('proofread')
  .setDescription('Check a short story for spelling and grammar errors before you post it');

function formatIssue(issue, index) {
  const change = issue.correction === null ? `"${issue.original}"` : `"${issue.original}" -> "${issue.correction}"`;
  const note = issue.applied ? '' : ' (not changed in the corrected copy)';
  return `${index + 1}. [${issue.category}] ${change}${note}\n   ${issue.explanation}`;
}

// fits as many issues as the embed allows; returns the text and how many were left out
function buildIssueList(issues) {
  const lines = [];
  let length = 0;
  for (const issue of issues) {
    const change = issue.applied
      ? `~~${issue.original}~~ → **${issue.correction}**`
      : `**${issue.original}**${issue.correction === null ? '' : ` (maybe *${issue.correction}*?)`}`;
    const line = `**${issue.category}** · ${change}\n-# ${issue.explanation}`;
    // leave room for the "and N more" line
    if (length + line.length + 1 > MAX_EMBED_DESCRIPTION - 80) break;
    lines.push(line);
    length += line.length + 1;
  }
  return { text: lines.join('\n'), omitted: issues.length - lines.length };
}

export const execute = async (interaction) => {
  // unique per invocation so a stale modal can't be picked up by a later /proofread
  const modalId = `proofread-${interaction.id}`;

  const storyInput = new TextInputBuilder()
    .setCustomId('story')
    .setLabel('Your story')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder(`Paste up to ${MAX_STORY_LENGTH.toLocaleString()} characters. Run it again for the next section.`)
    .setMaxLength(MAX_STORY_LENGTH)
    .setRequired(true);

  const modal = new ModalBuilder()
    .setCustomId(modalId)
    .setTitle('Proofread a story')
    .addComponents(new ActionRowBuilder().addComponents(storyInput));

  await interaction.showModal(modal);

  let submission;
  try {
    submission = await interaction.awaitModalSubmit({
      filter: (i) => i.customId === modalId,
      time: 15 * 60 * 1000,
    });
  } catch {
    // modal was dismissed or timed out; there is nothing left to reply to
    return;
  }

  const story = submission.fields.getTextInputValue('story').trim();
  if (!story) {
    await submission.reply({ content: 'That story was empty.', ephemeral: true });
    return;
  }

  // only the author sees their draft and the results
  await submission.deferReply({ ephemeral: true });

  let result;
  try {
    result = await proofreadStory(story);
  } catch (error) {
    if (!(error instanceof ProofreadError)) console.error('proofread failed:', error);
    await submission.editReply(
      error instanceof ProofreadError ? error.message : 'Something went wrong while proofreading. Try again.',
    );
    return;
  }

  const { correctedText, issues } = result;

  if (issues.length === 0) {
    await submission.editReply('✅ No spelling or grammar errors found. Your story is ready to post.');
    return;
  }

  const { text, omitted } = buildIssueList(issues);
  const files = [new AttachmentBuilder(Buffer.from(correctedText, 'utf8'), { name: 'story-corrected.txt' })];

  let description = text;
  if (omitted > 0) {
    description += `\n*…and ${omitted} more in the attached report.*`;
    const report = issues.map(formatIssue).join('\n\n');
    files.push(new AttachmentBuilder(Buffer.from(report, 'utf8'), { name: 'proofread-report.txt' }));
  }

  const embed = new EmbedBuilder()
    .setTitle(`📝 Found ${issues.length} issue${issues.length === 1 ? '' : 's'}`)
    .setDescription(description)
    .setFooter({ text: 'The corrected story is attached. Suggestions are automated, so review them before posting.' });

  await submission.editReply({ embeds: [embed], files });
};
