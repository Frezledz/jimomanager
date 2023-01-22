const fs = require("fs");
const {randomBytes} = require("crypto");
const secret = require("dotenv").config().parsed;
const {request} = require("./https.js");
const { Client, GatewayIntentBits,REST,EmbedBuilder,ButtonBuilder, ButtonStyle,Events,ActionRowBuilder,Routes,Partials} = require('discord.js');
const client = new Client({
  partials: [
    Partials.Message, // for message
    Partials.Channel, // for text channel
    Partials.GuildMember, // for guild member
    Partials.Reaction, // for message reaction
    Partials.GuildScheduledEvent, // for guild events
    Partials.User, // for discord user
    Partials.ThreadMember, // for thread member
  ],
  intents: [
    GatewayIntentBits.Guilds, // for guild related things
    GatewayIntentBits.GuildMembers, // for guild members related things
    GatewayIntentBits.GuildBans, // for manage guild bans
    GatewayIntentBits.GuildEmojisAndStickers, // for manage emojis and stickers
    GatewayIntentBits.GuildIntegrations, // for discord Integrations
    GatewayIntentBits.GuildWebhooks, // for discord webhooks
    GatewayIntentBits.GuildInvites, // for guild invite managing
    GatewayIntentBits.GuildVoiceStates, // for voice related things
    GatewayIntentBits.GuildPresences, // for user presence things
    GatewayIntentBits.GuildMessages, // for guild messages things
    GatewayIntentBits.GuildMessageReactions, // for message reactions things
    GatewayIntentBits.GuildMessageTyping, // for message typing things
    GatewayIntentBits.DirectMessages, // for dm messages
    GatewayIntentBits.DirectMessageReactions, // for dm message reaction
    GatewayIntentBits.DirectMessageTyping, // for dm message typinh
    GatewayIntentBits.MessageContent, // enable if you need message content things
  ],
});
const rest = new REST({ version: "10" }).setToken(secret.BOT_TOKEN);


client.on("ready", () => {
  console.log(`${client.user.username}`);
})

client.on("interactionCreate", async (interaction) => {
  
  if(interaction.isChatInputCommand()){
    const cmd = interaction.commandName;
    if(cmd=="auth"){
        if(interaction.channelId=="1066042904772100176"){
          const embed = new EmbedBuilder().setTitle("認証").setURL("https://scratch.mit.edu/studios/29958336/")
          .setDescription("ScratchアカウントとDiscordアカウントを結びつけ、JIMOのランクに応じてロールを付与します。\n認証を開始するにはボタンを押してください...");
          const button =new ActionRowBuilder().addComponents( new ButtonBuilder().setCustomId("auth").setLabel("認証").setStyle(ButtonStyle.Primary))
          interaction.channel.send({ embeds: [embed], components: [button] });
          await interaction.reply("o");
          await interaction.deleteReply();
        }else {
          interaction.reply("<#1066042904772100176> 内でのみ認証を行うことができます。");
        }
  
      }else{
        if(interaction.channelId=="1066044411575799818"){ 
          if(cmd=="ping"){
            interaction.reply(`pong! Time took : ${Date.now() - interaction.createdTimestamp}ms`);
        };

      }
  }
}
if(interaction.customId==="auth"){
  await interaction.deferReply({ ephemeral: true });
  await interaction.editReply("DMを確認してください。");
  const dm = await interaction.user.send("Scratchのユーザー名を入力してください。");
    const filter = m => (/^[\x2d-\x7a]*$/).test(m);
    const collector = dm.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] }).then(async collected=>{
      const scratchname = collected.first().content;
      const messageone = await dm.channel.send(`${scratchname}さんを検索中です...`);
      request(`/users/${scratchname}/`).then(()=>{
        const id = randomBytes(32).toString("hex");
        const buttontwo = new ActionRowBuilder().addComponents( new ButtonBuilder().setCustomId("authed").setLabel("貼り付けた！").setStyle(ButtonStyle.Primary))
        messageone.edit({ content: `アカウントが見つかりました。\nあなたのプロフィールの"私が取り組んでいるところ"に、以下の文字列を貼り付けてください。`, embeds: [{
          description: `\`\`\`\n${id}\n\`\`\``
        }], components: [buttontwo] })
      }).catch(res=>{
        console.log(res);
        messageone.edit("Scratchアカウントが見つかりませんでした。");return 0;})

    }).catch(()=>{dm.channel.send("タイムアウトしました。また後で試してください。");return 0;});

}
});



const {SlashCommandBuilder} = require("@discordjs/builders");
const main = ()=>{//Register slash commands and run
  const commands = [
      (new SlashCommandBuilder().setName("ping").setDescription("Return With pong.")).toJSON(),
      //  (new SlashCommandBuilder().setName("auth").setDescription("認証を開始します。認証チャンネルでのみ利用可能です。")).toJSON(),
      (new SlashCommandBuilder().setName("userinfo").setDescription("ユーザーの情報を検索します。")
      .addUserOption(option =>
        option.setName('user')
          .setDescription('ユーザーを指定してください。')
          .setRequired(false)
          )).toJSON(),
      (new SlashCommandBuilder().setName("searchdiscordaccount").setDescription("スクラッチのユーザー名からDiscordアカウントを検索します。")
      .addStringOption(option =>
        option.setName('user')
          .setDescription('スクラッチのユーザー名を指定してください。')
          .setRequired(true)
          )).toJSON(),
  ];
  rest.put(Routes.applicationGuildCommands(secret.CLIENT_ID,secret.GUILD_ID),{body:commands}).then(()=>
  client.login(secret.BOT_TOKEN)
  );

};
main();
/*
Master,Advanced,Good,visitor
*/