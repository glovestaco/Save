const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reportbug')
    .setDescription('Report a bug with the bot.'),
  async execute(interaction, client) {
    const modal = new ModalBuilder()
      .setCustomId('bug_report_modal')
      .setTitle('Submit Bug Report');

    const commandInput = new TextInputBuilder()
      .setCustomId('bug_report_command')
      .setLabel("Command with Bug (if applicable)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("e.g., /help or /userinfo")
      .setRequired(false);

    const descriptionInput = new TextInputBuilder()
      .setCustomId('bug_report_description')
      .setLabel("Bug Description")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Please describe the bug in detail.")
      .setRequired(true);

    const stepsToReproduceInput = new TextInputBuilder()
      .setCustomId('bug_report_steps')
      .setLabel("Steps to Reproduce")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("List the steps to make the bug occur.")
      .setRequired(true);

    const expectedBehaviorInput = new TextInputBuilder()
      .setCustomId('bug_report_expected')
      .setLabel("Expected Behavior (Optional)")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("What did you expect to happen?")
      .setRequired(false);

    const actualBehaviorInput = new TextInputBuilder()
      .setCustomId('bug_report_actual')
      .setLabel("Actual Behavior (Optional)")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("What actually happened?")
      .setRequired(false);

    // ActionRows for each text input
    const firstRow = new ActionRowBuilder().addComponents(commandInput);
    const secondRow = new ActionRowBuilder().addComponents(descriptionInput);
    const thirdRow = new ActionRowBuilder().addComponents(stepsToReproduceInput);
    const fourthRow = new ActionRowBuilder().addComponents(expectedBehaviorInput);
    const fifthRow = new ActionRowBuilder().addComponents(actualBehaviorInput);

    modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);

    await interaction.showModal(modal);
  },
};
