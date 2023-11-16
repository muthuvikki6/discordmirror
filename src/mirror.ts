import { Message, MessagePayload, WebhookClient, WebhookMessageOptions } from "discord.js-selfbot-v13";
import { containsOnlyAttachments, isGif, memberHasRole } from "./utils";
import { MirrorReplacements, ReplacementConfig } from "./replacements";

interface MirrorConfigRequirements {
   minEmbedsCount?: number;   
   minContentLength?: number;   
   minAttachmentsCount?: number;   
}

interface MirrorConfigOptions {
   useWebhookProfile?: boolean;
   removeAttachments?: boolean;
   mirrorMessagesFromBots?: boolean;
   mirrorReplyMessages?: boolean;
   mirrorMessagesOnEdit?: boolean;
}

export interface MirrorConfig {
   channelIds: string[];
   webhookUrls: string[];
   ignoredUserIds?: string[];
   ignoredRoleIds?: string[];
   requirements?: MirrorConfigRequirements;
   options?: MirrorConfigOptions;
   replacements?: Record<number, ReplacementConfig>;
}

class MirrorRequirements {
   public minEmbedsCount: number;
   public minContentLength: number;
   public minAttachmentsCount: number;

   public constructor({
      minEmbedsCount = 0,
      minContentLength = 0,
      minAttachmentsCount = 0,
   }: MirrorConfigRequirements) {
      this.minEmbedsCount = minEmbedsCount;
      this.minContentLength = minContentLength;
      this.minAttachmentsCount = minAttachmentsCount;
   }
}

class MirrorOptions {
   public useWebhookProfile: boolean;
   public removeAttachments: boolean;
   public mirrorMessagesFromBots: boolean;
   public mirrorReplyMessages: boolean;
   public mirrorMessagesOnEdit: boolean;

   public constructor({
      useWebhookProfile = false,
      removeAttachments = false,
      mirrorMessagesFromBots = true,
      mirrorReplyMessages = true,
      mirrorMessagesOnEdit = false
   }: MirrorConfigOptions) {
      this.useWebhookProfile = useWebhookProfile;
      this.removeAttachments = removeAttachments;
      this.mirrorMessagesFromBots = mirrorMessagesFromBots;
      this.mirrorReplyMessages = mirrorReplyMessages;
      this.mirrorMessagesOnEdit = mirrorMessagesOnEdit;
   }
}
 
export class Mirror {
   private webhooks: WebhookClient[] = [];
   private ignoredUserIds: Set<string>;
   private ignoredRoleIds: string[];
   private mirrorRequirements: MirrorRequirements;
   private mirrorOptions: MirrorOptions;
   private replacements: MirrorReplacements;

   public constructor(mirrorConfig: MirrorConfig) {
      this.loadWebhooks(mirrorConfig.webhookUrls)
      this.ignoredUserIds = new Set(mirrorConfig.ignoredUserIds);
      this.ignoredRoleIds = mirrorConfig.ignoredRoleIds ?? [];
      this.mirrorRequirements = new MirrorRequirements(mirrorConfig.requirements ?? {})
      this.mirrorOptions = new MirrorOptions(mirrorConfig.options ?? {})
      this.replacements = new MirrorReplacements(mirrorConfig.replacements)
   }

   public messageMeetsMirrorCriteria(message: Message): boolean {
      return this.messageMeetsOptions(message) && this.messageMeetsRequirements(message);
   }

   public stripMessage(message: Message): boolean {
      if (this.mirrorOptions.removeAttachments) {
         if (containsOnlyAttachments(message)) {
            return false;
         }
         message.attachments.clear();
      }
      if (isGif(message)) {
         message.embeds.pop();
      }
      return true;
   }

   public applyReplacements(message: Message): void {
      this.replacements.apply(message);
   }

   public dispatchMessage(message: Message, callback: (message: Message) => void): void {
      for (const webhook of this.webhooks) {
         const payloads = this.createMessagePayloads(message);
         const payload = payloads.shift();

         webhook.send(payload!)
            .then(() => callback(message))
            .catch(error => console.log(error));

         for (const payload of payloads) {
            setTimeout(() => {
               webhook.send(payload).catch(error => console.log(error));
            }, 500);
         }
      }
   }

   private createMessagePayloads(message: Message): (MessagePayload | WebhookMessageOptions)[] {
      const maxContentLength = message.author.premiumSince ? 4000 : 2000;
      const payloads: (MessagePayload | WebhookMessageOptions)[] = [];
      const payload: MessagePayload | WebhookMessageOptions = {
         files: [...message.attachments.values()],
         embeds: message.embeds
      };
      if (message.content.length) {
         payload.content = message.content.substring(0, maxContentLength);
      }
      if (!this.mirrorOptions.useWebhookProfile) {
         payload.username = message.author.username;
         payload.avatarURL = message.author?.avatarURL() ?? undefined;
      }
      payloads.push(payload);

      for (let i = 0; i < Math.floor(message.content.length / maxContentLength); i++) {
         const payload: MessagePayload | WebhookMessageOptions = {
            content: message.content.substring((i + 1) * maxContentLength, (i + 2) * maxContentLength)
         }
         if (!this.mirrorOptions.useWebhookProfile) {
            payload.username = message.author.username;
            payload.avatarURL = message.author.avatarURL() ?? undefined;
         }
         payloads.push(payload);
      }
      return payloads;
   }

   private messageMeetsOptions(message: Message): boolean {
      return (
         (this.mirrorOptions.mirrorMessagesFromBots || message.author.bot) &&
         (this.mirrorOptions.mirrorReplyMessages || message.reference == null) &&
         (this.mirrorOptions.mirrorMessagesOnEdit || message.editedAt == null)
      );
   }

   private messageMeetsRequirements(message: Message): boolean {
      return (
         message.content.length >= this.mirrorRequirements.minContentLength &&
         message.embeds.length >= this.mirrorRequirements.minEmbedsCount &&
         message.attachments.size >= this.mirrorRequirements.minAttachmentsCount &&
         !(message.author.id in this.ignoredUserIds) &&
         (message.member == null || !memberHasRole(message.member, ...this.ignoredRoleIds))
      );
   }

   private loadWebhooks(webhookUrls: string[]): void {
      for (const webhookUrl of webhookUrls) {
         this.webhooks.push(new WebhookClient({url: webhookUrl}));
      }
   }
}