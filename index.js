const fs = require("fs");
const {randomBytes} = require("crypto");
const { default: axios } = require("axios");
const secret = require("dotenv").config().parsed;
const {httprequest} = require("./https.js");
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
  
      }else if(interaction.channelId=="1066044411575799818"){ 
        if(cmd=="ping"){
          interaction.reply(`pong! Time took : ${Date.now() - interaction.createdTimestamp}ms`);
        };
        if(cmd=="userinfo"){
          interaction.deferReply().then(()=>{
            
            const user = interaction.options.get("user").user;
            const rawdata = JSON.parse(fs.readFileSync("db.json"));
            if(user.id in rawdata){
              const data = rawdata[user.id];
              const embed = new EmbedBuilder().setTitle(`${user.username}'s datas`).addFields(
                { name: 'Scratch username', value: data.scratch },
                { name: 'rank', value: data.rank },
              )
              interaction.channel.send({ embeds: [embed]});
              interaction.editReply("Ready!");
              
            }else{
              interaction.editReply("このユーザーは認証を行っていません。");
            }
          })

        }
        if(cmd=="getdiscorduser"){
          const user = interaction.options.get("user").value;
          if((/^[\x2d-\x7a]*$/).test(user)){
            interaction.deferReply().then(()=>{
              const data = JSON.parse(fs.readFileSync("db.json"));
              const keys = Object.keys(data);
              let disocrdid="未登録";
              for(let i=0;i<keys.length;i++){
                  if(data[keys[i]].scratch==user){
                      if(data[keys[i]].public){
                        disocrdid= data[keys[i]].name;
                      }
                      break;
                  }
              }
              
              const embed = new EmbedBuilder().setTitle(`${user}'s discord id`).addFields(
                { name: 'id', value: disocrdid }
              );
              interaction.channel.send({ embeds: [embed]});
              interaction.editReply("Ready!");
              
  
            })
          }else{
            interaction.reply("正しい形式で入力してください。");
          }
        }

      }
}

if(interaction.customId==="auth"){
  await interaction.deferReply({ ephemeral: true });
  
  let dm;
  try{
    dm = await interaction.user.send("Scratchのユーザー名を入力してください。");
  } catch{
    await interaction.editReply("DMにメッセージを送信できません。");
    return;
  }
  await interaction.editReply("DMを確認してください。");
    const filter = m => (/^[\x2d-\x7a]*$/).test(m);
    const collector = dm.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] }).then(async collected=>{
      const scratchname = collected.first().content;
      const messageone = await dm.channel.send(`${scratchname}さんを検索中です...`);
      httprequest(`/users/${scratchname}/`).then(()=>{
        const id = randomBytes(32).toString("hex");
        const buttontwo = new ActionRowBuilder().addComponents( new ButtonBuilder().setCustomId("authed").setLabel("貼り付けた！").setStyle(ButtonStyle.Primary))
        messageone.edit({ content: `アカウントが見つかりました。\nあなたのプロフィールの"私が取り組んでいること"に、以下の文字列を貼り付けてください。制限時間は60秒、5度試行できます。`, embeds: [{
          description: `\`\`\`\n${id}\n\`\`\``
        }], components: [buttontwo] });
        /**/
        {
          const filt = (interaction) => interaction.customId === 'authed';
          let count=5;
          const collector = messageone.createMessageComponentCollector({filt,time:30000});
          collector.on("collect",async o=>{
            await o.deferReply();
            //
            axios({url: `https://api.scratch.mit.edu/users/${scratchname}/?timestamp=${new Date().getTime()}`,method:"get"}).then(res=>res.data).catch(()=>{
              o.editReply("エラーが発生しました。");
              count--;
              if(count<=1){
                o.editReply(`試行可能回数を超えました。後でやり直してください。`);
                collector.stop();
                return;
              }
            }).then((res)=>{
              if(res.profile.status.includes(id)){
                o.editReply(`認証が完了しました。${scratchname}さん、ようこそ！`);
                collector.stop();
                const rawdata = fs.readFileSync("db.json");
                let parsed = JSON.parse(rawdata);
                const userid = interaction.user.id.toString();
                let rank;
                getrank(scratchname).then(res=>{
                  rank=res;
                  return;
                }).catch(()=>{
                  rank="Visitor";
                  return;
                }).then(()=>{
                  parsed[userid]={"scratch":scratchname,"rank":rank,"name":interaction.user.tag,"public":true};
                  const tmp = interaction.member.roles;
                  tmp.add(getrole(interaction,rank));
                  tmp.add(getrole(interaction,"Authorized"));
                  const jsoned = JSON.stringify(parsed);
                  if(jsoned!=""){
                    fs.writeFile("db.json",jsoned,(err)=>{});
                  }
                });
              }else{
                count--;
                if(count<=1){
                  o.editReply(`試行可能回数を超えました。後でやり直してください。`);
                  collector.stop();
                  return;
                }
                o.editReply(`文字列の確認ができませんでした。あと${count}回試行できます。`)

              }
            })
          });
          collector.on(
            
            "end",()=>{dm.channel.send(`認証を終了します。`);});
            
        }

      }
      ).catch(res=>{
        if(res=="error"){
          messageone.edit("ボットにエラーが発生しました。");return 0;
        }else if(res==404){
          messageone.edit("Scratchアカウントが見つかりませんでした。");return 0;
        }else{
          messageone.edit(`${res}エラーが発生しました。`);return 0;

        }
      })

    }).catch(()=>{dm.channel.send("タイムアウトしました。");return 0;});

}

});

const getrole = (interaction,name)=>{
  return interaction.guild.roles.cache.find(role => role.name === name);
}

const {SlashCommandBuilder} = require("@discordjs/builders");
const main = ()=>{//Register slash commands and run
  const commands = [
      (new SlashCommandBuilder().setName("ping").setDescription("Return With pong.")).toJSON(),
      //  (new SlashCommandBuilder().setName("auth").setDescription("認証を開始します。認証チャンネルでのみ利用可能です。")).toJSON(),
      (new SlashCommandBuilder().setName("userinfo").setDescription("ユーザーの情報を検索します。")
      .addUserOption(option =>
        option.setName('user')
          .setDescription('ユーザーを指定してください。')
          .setRequired(true)
          )).toJSON(),
      (new SlashCommandBuilder().setName("getdiscorduser").setDescription("スクラッチのユーザー名からDiscordアカウントを検索します。")
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
Master,Advanced,Good,Visitor
*/
const http = require("http");
http.createServer(function(req, res) {
  res.write("online");
  res.end();
}).listen(8080);

const getrank = (username)=>{
  return new Promise((resolve,reject)=>{
      axios({url: `https://api.scratch.mit.edu/studios/29958336`,method:"get"}).then(res=>res.data).catch(res=>reject(res)).then(res=>{
          const raw = res.description.split("\n");
          let i=0;
          let ii=0;
          let needstr =[[ "• – • Master intro makers • – •","• – • Advanced intro makers • – •","• – • Good intro makers • – •"],[null,"Master","Advanced","Good"]];
          while(true){
              
              if(i>raw.length-1){
                  resolve("Visitor");
                  break;
              }
              const tmp =raw[i].toLowerCase();
              if(ii<3){
                  if(tmp.includes(needstr[0][ii].toLowerCase())){
                      ii++;
                  }
              }
              if(tmp.includes(username.toLowerCase())&&ii!=0){
                  resolve(needstr[1][ii]);
                  break;
                  
              }
              i++;
          }

      });

  })
};