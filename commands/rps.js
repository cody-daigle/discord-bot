// required imports from Discord Developer library
import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';

const CHOICES = ['rock', 'paper', 'scissors'];
const EMOJI = { rock: '🪨', paper: '📄', scissors: '✂️' };
const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

// compare player/bot choices
function getResult(player, bot) {
  // if player and bot picked the same => 'tie'
  if (player === bot) return 'tie';
  // otherwise compare BEATS[player] choice to bot choice => return win/loss
  return BEATS[player] === bot ? 'win' : 'lose';
}

// registers '/rps' as a slash command for the discord bot
export const data = new SlashCommandBuilder()
  .setName('rps')
  .setDescription('Play rock paper scissors against the bot');

export const execute = async (interaction) => {
  const row = new ActionRowBuilder().addComponents(
    CHOICES.map((choice) =>
      new ButtonBuilder()
        .setCustomId(choice)
        .setLabel(choice[0].toUpperCase() + choice.slice(1))
        .setEmoji(EMOJI[choice])
        .setStyle(ButtonStyle.Primary),
    ),
  );

  await interaction.reply({ content: 'Choose your move:', components: [row] });
  const message = await interaction.fetchReply();

  try {
    const confirmation = await message.awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id,
      componentType: ComponentType.Button,
      time: 15_000,
    });

    const playerChoice = confirmation.customId;
    const botChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    const result = getResult(playerChoice, botChoice);
    const resultText = {
      win: 'You win!',
      lose: 'You lose!',
      tie: "It's a tie!",
    }[result];

    await confirmation.update({
      content: `You chose ${EMOJI[playerChoice]} ${playerChoice} — I chose ${EMOJI[botChoice]} ${botChoice}. ${resultText}`,
      components: [],
    });
  } catch {
    await interaction.editReply({
      content: 'No response in time, game cancelled.',
      components: [],
    });
  }
};
