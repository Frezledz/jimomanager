const fs = require("fs");
const {randomBytes} = require("crypto");
const secret = require("dotenv").config().parsed;
const { Client, GatewayIntentBits,REST,EmbedBuilder,ButtonBuilder, ButtonStyle,Events,ActionRowBuilder,Routes} = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});
const rest = new REST({ version: "10" }).setToken(secret.BOT_TOKEN);


client.on("ready", () => {
  console.log(`${client.user.username}`);
})

client.on("interactionCreate", async (message) => {
  if(message.isChatInputCommand()){
    const cmd = message.commandName;
    if(cmd=="auth"){
        if(message.channelId=="1066042904772100176"){
          const embed = new EmbedBuilder().setTitle("認証").setURL("https://scratch.mit.edu/studios/29958336/")
          .setDescription("ScratchアカウントとDiscordアカウントを結びつけ、JIMOのランクに応じてロールを付与します。\n認証を開始するにはボタンを押してください...");
          const button =new ActionRowBuilder().addComponents( new ButtonBuilder().setCustomId("auth").setLabel("認証").setStyle(ButtonStyle.Primary))
          message.channel.send({ embeds: [embed], components: [button] });
          await message.reply("o");
          await message.deleteReply();
        }else {
          message.reply("<#1066042904772100176> 内でのみ認証を行うことができます。");
        }
  
      }else{
        if(message.channelId=="1066044411575799818"){ 
          if(cmd=="ping"){
            message.reply(`pong! Time took : ${Date.now() - message.createdTimestamp}ms`);
        };

      }
  }
}
if(message.customId==="auth"){
  await message.deferReply({ ephemeral: true });
  const filter = m => m.content.includes('discord');
  message.user.send("Scratchのユーザー名を入力してください。").then((msg)=>{
    const filter = m => m.author.id ===  message.author.id;
    message.channel.awaitMessages(filter,{max:1,time:10000}).then(async(collected)=>{
      if(collected.first().content == 'cancel'){
        message.reply('Command cancelled.')}
    })
  })

}
});

const {SlashCommandBuilder} = require("@discordjs/builders");

const main = ()=>{
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