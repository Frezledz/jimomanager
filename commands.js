const {SlashCommandBuilder} = require("@discordjs/builders");
const commands = [
    (new SlashCommandBuilder().setName("ping").setDescription("Return With pong.")).toJSON(),
    (new SlashCommandBuilder().setName("auth").setDescription("認証を開始します。認証チャンネルでのみ利用可能です。")).toJSON(),
];