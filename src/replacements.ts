import { HexColorString, Message } from "discord.js-selfbot-v13";
import { hexColorsAreEqual, isValidHexColor } from "./utils";

export interface ReplacementConfig {
   replace: string;
   with: string;
   where?: ReplacementLocation;
};

enum ReplacementLocation {
   EVERYWHERE = "everywhere",
   MESSAGE_CONTENT = "message_content",
   EMBED_AUTHOR = "embed_author",
   EMBED_AUTHOR_URL = "embed_author_url",
   EMBED_AUTHOR_ICON_URL = "embed_author_icon_url",
   EMBED_TITLE = "embed_title",
   EMBED_DESCRIPTION = "embed_description",
   EMBED_URL = "embed_url",
   EMBED_FIELD_NAME = "embed_field_name",
   EMBED_FIELD_VALUE = "embed_field_value",
   EMBED_IMAGE_URL = "embed_image_url",
   EMBED_THUMBNAIL_URL = "embed_thumbnail_url",
   EMBED_FOOTER = "embed_footer",
   EMBED_FOOTER_ICON_URL = "embed_footer_icon_url",
   EMBED_COLOR = "embed_color"
}

class Replacement {
   private replace: string;
   private with: string;
   private applyCallback: (message: Message) => void;

   public constructor(replacementConfig: ReplacementConfig) {
      this.replace = replacementConfig.replace;
      this.with = replacementConfig.with;
      this.applyCallback = this.createApplyCallback(replacementConfig.where);
   }

   public apply(message: Message): void {
      this.applyCallback(message);
   }

   private createApplyCallback(where: ReplacementLocation | undefined): (message: Message) => void {
      switch (where) {
         case undefined:
         case ReplacementLocation.EVERYWHERE:
            return this.replaceEverywhere;
         case ReplacementLocation.MESSAGE_CONTENT:
            return this.replaceContent;
         case ReplacementLocation.EMBED_AUTHOR:
            return this.replaceEmbedAuthor;
         case ReplacementLocation.EMBED_AUTHOR_URL:
            return this.replaceEmbedAuthorUrl;
         case ReplacementLocation.EMBED_AUTHOR_ICON_URL:
            return this.replaceEmbedAuthorIconUrl;
         case ReplacementLocation.EMBED_TITLE:
            return this.replaceEmbedTitle;
         case ReplacementLocation.EMBED_DESCRIPTION:
            return this.replaceEmbedDescription;
         case ReplacementLocation.EMBED_URL:
            return this.replaceEmbedUrl;
         case ReplacementLocation.EMBED_FIELD_NAME:
            return this.replaceEmbedFieldName;
         case ReplacementLocation.EMBED_FIELD_VALUE:
            return this.replaceEmbedFieldValue;
         case ReplacementLocation.EMBED_IMAGE_URL:
            return this.replaceEmbedImageUrl;
         case ReplacementLocation.EMBED_THUMBNAIL_URL:
            return this.replaceEmbedThumbnailUrl;
         case ReplacementLocation.EMBED_FOOTER:
            return this.replaceEmbedFooter;
         case ReplacementLocation.EMBED_FOOTER_ICON_URL:
            return this.replaceEmbedFooterIconUrl;
         case ReplacementLocation.EMBED_COLOR:
            if (!isValidHexColor(this.replace)) {
               throw new Error(`Invalid color in config.yml (only hex is supported): replace: "${this.replace}".`);
            }
            if (!isValidHexColor(this.with)) {
               throw new Error(`Invalid color in config.yml (only hex is supported): with: "${this.with}".`);
            }
            return this.replaceEmbedColor;
         default:
            throw new Error(`Invalid option in config.yml: where: "${where}"`);
      }
   }

   private replaceEverywhere(message: Message): void {
      this.replaceContent(message);
      this.replaceEmbedAuthor(message);
      this.replaceEmbedAuthorUrl(message);
      this.replaceEmbedAuthorIconUrl(message);
      this.replaceEmbedDescription(message);
      this.replaceEmbedFieldName(message);
      this.replaceEmbedFieldValue(message);
      this.replaceEmbedImageUrl(message);
      this.replaceEmbedThumbnailUrl(message);
      this.replaceEmbedFooter(message);
      this.replaceEmbedFooterIconUrl(message);
      this.replaceEmbedColor(message);
   }

   private replaceContent(message: Message): void {
      message.content = message.content.replace(this.replace, this.with);
   }

   private replaceEmbedAuthor(message: Message): void {
      for (const embed of message.embeds) {
         if (embed.author) {
            embed.author.name = embed.author.name.replace(this.replace, this.with);
         }
      }
   }

   private replaceEmbedAuthorUrl(message: Message): void {
      for (const embed of message.embeds) {
         if (embed.author?.url) {
            embed.author.url = embed.author.url.replace(this.replace, this.with);
         }
      }
   }

   private replaceEmbedAuthorIconUrl(message: Message): void {
      for (const embed of message.embeds) {
         if (embed.author?.iconURL) {
            embed.author.iconURL = embed.author.iconURL.replace(this.replace, this.with);
         }
      }
   }

   private replaceEmbedTitle(message: Message): void {
      for (const embed of message.embeds) {
         if (embed.title) {
            embed.title = embed.title.replace(this.replace, this.with);
         }
      }
   }

   private replaceEmbedDescription(message: Message): void {
      for (const embed of message.embeds) {
         if (embed.description) {
            embed.description = embed.description.replace(this.replace, this.with);
         }
      }
   }

   private replaceEmbedUrl(message: Message): void {
      for (const embed of message.embeds) {
         if (embed.url) {
            embed.url = embed.url.replace(this.replace, this.with);
         }
      }
   }

   private replaceEmbedColor(message: Message): void {
      for (const embed of message.embeds) {
         const embedColor = embed.hexColor ?? "#000000";
         if (hexColorsAreEqual(embedColor, this.replace)) {
            embed.setColor(this.with as HexColorString);
         }
      }
   }

   private replaceEmbedFieldName(message: Message): void {
      for (const embed of message.embeds) {
         for (const field of embed.fields) {
            field.name = field.name.replace(this.replace, this.with);
         }
      }
   }

   private replaceEmbedFieldValue(message: Message): void {
      for (const embed of message.embeds) {
         for (const field of embed.fields) {
            field.value = field.value.replace(this.replace, this.with);
         }
      }
   }

   private replaceEmbedImageUrl(message: Message): void {
      for (const embed of message.embeds) {
         if (embed.image?.url) {
            embed.image.url = embed.image.url.replace(this.replace, this.with);
         }
      }
   }

   private replaceEmbedThumbnailUrl(message: Message): void {
      for (const embed of message.embeds) {
         if (embed.thumbnail?.url) {
            embed.thumbnail.url = embed.thumbnail.url.replace(this.replace, this.with);
         }
      }
   }

   private replaceEmbedFooter(message: Message): void {
      for (const embed of message.embeds) {
         if (embed.footer?.text) {
            embed.footer.text = embed.footer.text.replace(this.replace, this.with);
         }
      }
   }

   private replaceEmbedFooterIconUrl(message: Message): void {
      for (const embed of message.embeds) {
         if (embed.footer?.iconURL) {
            embed.footer.iconURL = embed.footer.iconURL.replace(this.replace, this.with);
         }
      }
   }
}

export class MirrorReplacements {
   private replacements: Replacement[] = [];

   public constructor(replacementsConfig: Record<number, ReplacementConfig> | undefined) {
      if (!replacementsConfig) {
         return;
      }
      this.replacements = Object.values(replacementsConfig).map((config) => new Replacement(config));
   }

   public apply(message: Message): void {
      for (const replacement of this.replacements) {
         replacement.apply(message);
      }
   }
}