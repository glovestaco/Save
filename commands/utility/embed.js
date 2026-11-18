const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Manage custom embeds.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new custom embed using a modal.')
    ),
  async execute(interaction, client) {
    if (interaction.options.getSubcommand() === 'create') {
      const modal = new ModalBuilder()
        .setCustomId('embed_create_modal')
        .setTitle('Create Advanced Custom Embed');

      // Up to 5 fields per modal due to 5 ActionRow limit.
      // Each TextInputBuilder needs its own ActionRowBuilder.

      const titleInput = new TextInputBuilder()
        .setCustomId('embed_title')
        .setLabel("Title")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("The main title of the embed.")
        .setRequired(false);

      const descriptionInput = new TextInputBuilder()
        .setCustomId('embed_description')
        .setLabel("Description")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("The main content of the embed. Supports markdown.")
        .setRequired(false);

      const urlInput = new TextInputBuilder()
        .setCustomId('embed_url')
        .setLabel("Title URL")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("URL the title should link to (e.g., https://example.com)")
        .setRequired(false);

      const colorInput = new TextInputBuilder()
        .setCustomId('embed_color')
        .setLabel("Color (Hex Code)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("e.g., #3498db or 3498db. Defaults to bot's accent if invalid.")
        .setRequired(false)
        .setMinLength(6)
        .setMaxLength(7); // #RRGGBB or RRGGBB

      // For the next set of fields, we'd need another modal if we exceed 5.
      // However, the user wants an "advanced" embed in one go.
      // We can have 5 text inputs. Let's pick the most common advanced ones.
      // If more are needed, it would require a multi-step process or a different UI.

      // Field Set 1: Title, Description, URL, Color
      // Field Set 2: Author Name, Author Icon URL, Author URL (This is 3, too many with current 5)
      // Field Set 3: Footer Text, Footer Icon URL
      // Field Set 4: Thumbnail URL
      // Field Set 5: Image URL
      // Field Set 6: Timestamp (boolean - not a text input, modal doesn't support booleans directly)

      // Given 5 text input limit:
      // 1. Title
      // 2. Description
      // 3. Color
      // 4. Footer Text
      // 5. Thumbnail URL or Image URL (Let's pick Image URL as it's often larger)
      //
      // To get more, the user might need to use a JSON input or a different command structure.
      // For "advanced one" with a single modal, we are limited.
      // Let's refine the selection for 5 inputs:
      // Title, Description, Color, Footer Text, Image URL.
      // Author, Thumbnail, Footer Icon, Author URL, Title URL are common but exceed 5.

      // Re-evaluating based on what "advanced" usually means for embeds:
      // Title (Short)
      // Description (Paragraph)
      // Color (Short)
      // Footer Text (Short)
      // Image URL (Short) - For the main image.

      // For a truly "advanced" one with all fields, a modal isn't the best UI
      // due to the 5 text input limit.
      // I will provide the most common 5 and the user can request more via a different method later.
      // The plan listed more; I will implement the top 5 text inputs.

      const footerTextInput = new TextInputBuilder()
        .setCustomId('embed_footer_text')
        .setLabel("Footer Text")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Text for the embed footer.")
        .setRequired(false);
      
      // Adding more inputs as planned, using multiple ActionRows:
      const authorNameInput = new TextInputBuilder()
        .setCustomId('embed_author_name')
        .setLabel("Author Name")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Name of the author.")
        .setRequired(false);

      // The plan had many fields. A modal can only have 5 TextInput components.
      // The user wants: thumbnail, footer, description, title, author fields.
      // Title (1), Description (2), Footer Text (3), Author Name (4).
      // This leaves one slot. Let's use it for Thumbnail URL.
      // Other fields like color, image, author icon/url, footer icon, title url
      // will have to be omitted from this single modal.

      const thumbnailInput = new TextInputBuilder()
          .setCustomId('embed_thumbnail_url')
          .setLabel("Thumbnail URL")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("URL for the embed thumbnail (image on right).")
          .setRequired(false);

      // ActionRows
      const firstRow = new ActionRowBuilder().addComponents(titleInput);
      const secondRow = new ActionRowBuilder().addComponents(descriptionInput);
      const thirdRow = new ActionRowBuilder().addComponents(authorNameInput);
      const fourthRow = new ActionRowBuilder().addComponents(thumbnailInput);
      const fifthRow = new ActionRowBuilder().addComponents(footerTextInput);
      // Color, Image URL, Author Icon URL, Author URL, Title URL, Footer Icon URL, Timestamp
      // are not included due to the 5 text input limit of modals.
      // The handler will need to be aware of which fields are actually present.

      modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);

      await interaction.showModal(modal);
    }
  },
};
