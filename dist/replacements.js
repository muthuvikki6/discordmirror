"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MirrorReplacements = void 0;
const utils_1 = require("./utils");
;
var ReplacementLocation;
(function (ReplacementLocation) {
    ReplacementLocation["EVERYWHERE"] = "everywhere";
    ReplacementLocation["MESSAGE_CONTENT"] = "message_content";
    ReplacementLocation["EMBED_AUTHOR"] = "embed_author";
    ReplacementLocation["EMBED_AUTHOR_URL"] = "embed_author_url";
    ReplacementLocation["EMBED_AUTHOR_ICON_URL"] = "embed_author_icon_url";
    ReplacementLocation["EMBED_TITLE"] = "embed_title";
    ReplacementLocation["EMBED_DESCRIPTION"] = "embed_description";
    ReplacementLocation["EMBED_URL"] = "embed_url";
    ReplacementLocation["EMBED_FIELD_NAME"] = "embed_field_name";
    ReplacementLocation["EMBED_FIELD_VALUE"] = "embed_field_value";
    ReplacementLocation["EMBED_IMAGE_URL"] = "embed_image_url";
    ReplacementLocation["EMBED_THUMBNAIL_URL"] = "embed_thumbnail_url";
    ReplacementLocation["EMBED_FOOTER"] = "embed_footer";
    ReplacementLocation["EMBED_FOOTER_ICON_URL"] = "embed_footer_icon_url";
    ReplacementLocation["EMBED_COLOR"] = "embed_color";
})(ReplacementLocation || (ReplacementLocation = {}));
class Replacement {
    constructor(replacementConfig) {
        this.replace = replacementConfig.replace;
        this.with = replacementConfig.with;
        this.applyCallback = this.createApplyCallback(replacementConfig.where);
    }
    apply(message) {
        this.applyCallback(message);
    }
    createApplyCallback(where) {
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
                if (!(0, utils_1.isValidHexColor)(this.replace)) {
                    throw new Error(`Invalid color in config.yml (only hex is supported): replace: "${this.replace}".`);
                }
                if (!(0, utils_1.isValidHexColor)(this.with)) {
                    throw new Error(`Invalid color in config.yml (only hex is supported): with: "${this.with}".`);
                }
                return this.replaceEmbedColor;
            default:
                throw new Error(`Invalid option in config.yml: where: "${where}"`);
        }
    }
    replaceEverywhere(message) {
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
    replaceContent(message) {
        message.content = message.content.replace(this.replace, this.with);
    }
    replaceEmbedAuthor(message) {
        for (const embed of message.embeds) {
            if (embed.author) {
                embed.author.name = embed.author.name.replace(this.replace, this.with);
            }
        }
    }
    replaceEmbedAuthorUrl(message) {
        var _a;
        for (const embed of message.embeds) {
            if ((_a = embed.author) === null || _a === void 0 ? void 0 : _a.url) {
                embed.author.url = embed.author.url.replace(this.replace, this.with);
            }
        }
    }
    replaceEmbedAuthorIconUrl(message) {
        var _a;
        for (const embed of message.embeds) {
            if ((_a = embed.author) === null || _a === void 0 ? void 0 : _a.iconURL) {
                embed.author.iconURL = embed.author.iconURL.replace(this.replace, this.with);
            }
        }
    }
    replaceEmbedTitle(message) {
        for (const embed of message.embeds) {
            if (embed.title) {
                embed.title = embed.title.replace(this.replace, this.with);
            }
        }
    }
    replaceEmbedDescription(message) {
        for (const embed of message.embeds) {
            if (embed.description) {
                embed.description = embed.description.replace(this.replace, this.with);
            }
        }
    }
    replaceEmbedUrl(message) {
        for (const embed of message.embeds) {
            if (embed.url) {
                embed.url = embed.url.replace(this.replace, this.with);
            }
        }
    }
    replaceEmbedColor(message) {
        var _a;
        for (const embed of message.embeds) {
            const embedColor = (_a = embed.hexColor) !== null && _a !== void 0 ? _a : "#000000";
            if ((0, utils_1.hexColorsAreEqual)(embedColor, this.replace)) {
                embed.setColor(this.with);
            }
        }
    }
    replaceEmbedFieldName(message) {
        for (const embed of message.embeds) {
            for (const field of embed.fields) {
                field.name = field.name.replace(this.replace, this.with);
            }
        }
    }
    replaceEmbedFieldValue(message) {
        for (const embed of message.embeds) {
            for (const field of embed.fields) {
                field.value = field.value.replace(this.replace, this.with);
            }
        }
    }
    replaceEmbedImageUrl(message) {
        var _a;
        for (const embed of message.embeds) {
            if ((_a = embed.image) === null || _a === void 0 ? void 0 : _a.url) {
                embed.image.url = embed.image.url.replace(this.replace, this.with);
            }
        }
    }
    replaceEmbedThumbnailUrl(message) {
        var _a;
        for (const embed of message.embeds) {
            if ((_a = embed.thumbnail) === null || _a === void 0 ? void 0 : _a.url) {
                embed.thumbnail.url = embed.thumbnail.url.replace(this.replace, this.with);
            }
        }
    }
    replaceEmbedFooter(message) {
        var _a;
        for (const embed of message.embeds) {
            if ((_a = embed.footer) === null || _a === void 0 ? void 0 : _a.text) {
                embed.footer.text = embed.footer.text.replace(this.replace, this.with);
            }
        }
    }
    replaceEmbedFooterIconUrl(message) {
        var _a;
        for (const embed of message.embeds) {
            if ((_a = embed.footer) === null || _a === void 0 ? void 0 : _a.iconURL) {
                embed.footer.iconURL = embed.footer.iconURL.replace(this.replace, this.with);
            }
        }
    }
}
class MirrorReplacements {
    constructor(replacementsConfig) {
        this.replacements = [];
        if (!replacementsConfig) {
            return;
        }
        this.replacements = Object.values(replacementsConfig).map((config) => new Replacement(config));
    }
    apply(message) {
        for (const replacement of this.replacements) {
            replacement.apply(message);
        }
    }
}
exports.MirrorReplacements = MirrorReplacements;
