"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mirror = void 0;
const discord_js_selfbot_v13_1 = require("discord.js-selfbot-v13");
const utils_1 = require("./utils");
const replacements_1 = require("./replacements");
class MirrorRequirements {
    constructor({ minEmbedsCount = 0, minContentLength = 0, minAttachmentsCount = 0, }) {
        this.minEmbedsCount = minEmbedsCount;
        this.minContentLength = minContentLength;
        this.minAttachmentsCount = minAttachmentsCount;
    }
}
class MirrorOptions {
    constructor({ useWebhookProfile = false, removeAttachments = false, mirrorMessagesFromBots = true, mirrorReplyMessages = true, mirrorMessagesOnEdit = false }) {
        this.useWebhookProfile = useWebhookProfile;
        this.removeAttachments = removeAttachments;
        this.mirrorMessagesFromBots = mirrorMessagesFromBots;
        this.mirrorReplyMessages = mirrorReplyMessages;
        this.mirrorMessagesOnEdit = mirrorMessagesOnEdit;
    }
}
class Mirror {
    constructor(mirrorConfig) {
        var _a, _b, _c;
        this.webhooks = [];
        this.loadWebhooks(mirrorConfig.webhookUrls);
        this.ignoredUserIds = new Set(mirrorConfig.ignoredUserIds);
        this.ignoredRoleIds = (_a = mirrorConfig.ignoredRoleIds) !== null && _a !== void 0 ? _a : [];
        this.mirrorRequirements = new MirrorRequirements((_b = mirrorConfig.requirements) !== null && _b !== void 0 ? _b : {});
        this.mirrorOptions = new MirrorOptions((_c = mirrorConfig.options) !== null && _c !== void 0 ? _c : {});
        this.replacements = new replacements_1.MirrorReplacements(mirrorConfig.replacements);
    }
    messageMeetsMirrorCriteria(message) {
        return this.messageMeetsOptions(message) && this.messageMeetsRequirements(message);
    }
    stripMessage(message) {
        if (this.mirrorOptions.removeAttachments) {
            if ((0, utils_1.containsOnlyAttachments)(message)) {
                return false;
            }
            message.attachments.clear();
        }
        if ((0, utils_1.isGif)(message)) {
            message.embeds.pop();
        }
        return true;
    }
    applyReplacements(message) {
        this.replacements.apply(message);
    }
    dispatchMessage(message, callback) {
        for (const webhook of this.webhooks) {
            const payloads = this.createMessagePayloads(message);
            const payload = payloads.shift();
            webhook.send(payload)
                .then(() => callback(message))
                .catch(error => console.log(error));
            for (const payload of payloads) {
                setTimeout(() => {
                    webhook.send(payload).catch(error => console.log(error));
                }, 500);
            }
        }
    }
    createMessagePayloads(message) {
        var _a, _b, _c;
        const maxContentLength = message.author.premiumSince ? 4000 : 2000;
        const payloads = [];
        const payload = {
            files: [...message.attachments.values()],
            embeds: message.embeds
        };
        if (message.content.length) {
            payload.content = message.content.substring(0, maxContentLength);
        }
        if (!this.mirrorOptions.useWebhookProfile) {
            payload.username = message.author.username;
            payload.avatarURL = (_b = (_a = message.author) === null || _a === void 0 ? void 0 : _a.avatarURL()) !== null && _b !== void 0 ? _b : undefined;
        }
        payloads.push(payload);
        for (let i = 0; i < Math.floor(message.content.length / maxContentLength); i++) {
            const payload = {
                content: message.content.substring((i + 1) * maxContentLength, (i + 2) * maxContentLength)
            };
            if (!this.mirrorOptions.useWebhookProfile) {
                payload.username = message.author.username;
                payload.avatarURL = (_c = message.author.avatarURL()) !== null && _c !== void 0 ? _c : undefined;
            }
            payloads.push(payload);
        }
        return payloads;
    }
    messageMeetsOptions(message) {
        return ((this.mirrorOptions.mirrorMessagesFromBots || message.author.bot) &&
            (this.mirrorOptions.mirrorReplyMessages || message.reference == null) &&
            (this.mirrorOptions.mirrorMessagesOnEdit || message.editedAt == null));
    }
    messageMeetsRequirements(message) {
        return (message.content.length >= this.mirrorRequirements.minContentLength &&
            message.embeds.length >= this.mirrorRequirements.minEmbedsCount &&
            message.attachments.size >= this.mirrorRequirements.minAttachmentsCount &&
            !(message.author.id in this.ignoredUserIds) &&
            (message.member == null || !(0, utils_1.memberHasRole)(message.member, ...this.ignoredRoleIds)));
    }
    loadWebhooks(webhookUrls) {
        for (const webhookUrl of webhookUrls) {
            this.webhooks.push(new discord_js_selfbot_v13_1.WebhookClient({ url: webhookUrl }));
        }
    }
}
exports.Mirror = Mirror;
