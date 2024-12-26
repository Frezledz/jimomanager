const fs = require("fs");
const { randomBytes } = require("crypto");
const { default: axios } = require("axios");
const secret = require("dotenv").config().parsed;
const { httprequest } = require("./https.js");
const cron = require('node-cron');
/*Dictionary機能について
permission
0 : No one else can edit it (requires above Master role)
1 : Anyone can edit it


"カテゴリ名":{"description":"カテゴリの説明","elements":{
    "用語":{"description":"説明","media":"画像、動画","reference":"参考プロジェクト","writer":"書いた人","permission":0}
    }
}
*/


const { Client, GatewayIntentBits, REST, EmbedBuilder, ButtonBuilder, ButtonStyle, Events, ActionRowBuilder, Routes, Partials } = require('discord.js');
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

let notif_users;

const notification = async () => {
  const sc_not = client.channels.cache.find(channel => channel.id === "1233355655381778453");
  let scdata = JSON.parse(fs.readFileSync("scratch.json"));
  notif_users = Object.keys(scdata);
  for (let i = 0; i < notif_users.length; i++) {
    const name = notif_users[i];
    let olddata = scdata[name].raw;
    const res = await axios({ url: `https://api.scratch.mit.edu/users/${name}/projects/?timestamp=${new Date().getTime()}`, method: "get" });
    res.data.forEach(element => {
      const id = element.id;
      if (olddata.indexOf(id) == -1) {
        console.log(`sending ${name}'s new project ${id}...`);
        const embed = new EmbedBuilder().setTitle(element.title).setURL(`https://scratch.mit.edu/projects/${id}/`)
          .setImage(`https://cdn2.scratch.mit.edu/get_image/project/${id}_480x360.png`);
        sc_not.send({
          embeds: [embed],
          content: `<@&1233704362379968542>\n# [${name}](https://scratch.mit.edu/users/${name})さんの新作です！ `
        });
        olddata.push(id);
      }
    });
    scdata[name].raw = olddata;
  }
  fs.writeFile("scratch.json", JSON.stringify(scdata), (err) => { });
}


client.on("ready", async () => {
  console.log(`${client.user.username}`);
  {
    const sc_not = client.channels.cache.find(channel => channel.id === "1234329748797259887");
  }
  const date = new Date();
  //Administration logs
  const logchannel = client.channels.cache.find(channel => channel.id === "1078441016538972190");

  logchannel.send(`Rebooted. time:${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()} (UTC)`);
  cron.schedule('0 0 0 * * *', () => {
    logchannel.send({ files: ['./db.json', './scratch.json'] });
  });
  cron.schedule('*/10 * * * *', () => {
    notification();
  });
  //Scrath notification
})

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const cmd = interaction.commandName;
    if (cmd == "auth") {
      if (interaction.channelId == "1066042904772100176") {
        const embed = new EmbedBuilder().setTitle("認証").setURL("https://scratch.mit.edu/studios/29958336/")
          .setDescription("ScratchアカウントとDiscordアカウントを結びつけ、JIMOのランクに応じてロールを付与します。\n認証を開始するにはボタンを押してください...");
        const button = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("auth").setLabel("認証").setStyle(ButtonStyle.Primary))
        interaction.channel.send({ embeds: [embed], components: [button] });
        await interaction.reply("o");
        await interaction.deleteReply();
      } else {
        interaction.reply("<#1066042904772100176> 内でのみ認証を行うことができます。");
      }

    } else if (interaction.channelId == "1066044411575799818" || interaction.channelId == "1321814892029935686") {
      if (cmd == "ping") {
        interaction.reply(`pong! Time took : ${Date.now() - interaction.createdTimestamp}ms`);
      };
      if (cmd == "userinfo") {
        interaction.deferReply().then(() => {

          const user = interaction.options.get("user").user;
          const rawdata = JSON.parse(fs.readFileSync("db.json"));
          if (user.id in rawdata) {
            const data = rawdata[user.id];
            const embed = new EmbedBuilder().setTitle(`${user.username}'s datas`).addFields(
              { name: 'Scratch username', value: data.scratch },
              { name: 'rank', value: data.rank },
            )
            interaction.channel.send({ embeds: [embed] });
            interaction.editReply("Ready!");

          } else {
            interaction.editReply("このユーザーは認証を行っていません。");
          }
        })

      }
      if (cmd == "getdiscorduser") {
        const user = interaction.options.get("user").value;
        if ((/^[\x2d-\x7a]*$/).test(user)) {
          interaction.deferReply().then(() => {
            const data = JSON.parse(fs.readFileSync("db.json"));
            const keys = Object.keys(data);
            let disocrdid = "未登録";
            for (let i = 0; i < keys.length; i++) {
              if (data[keys[i]].scratch == user) {
                if (data[keys[i]].public) {
                  disocrdid = data[keys[i]].name;
                }
                break;
              }
            }

            const embed = new EmbedBuilder().setTitle(`${user}'s discord id`).addFields(
              { name: 'id', value: disocrdid }
            );
            interaction.channel.send({ embeds: [embed] });
            interaction.editReply("Ready!");


          })
        } else {
          interaction.reply("正しい形式で入力してください。");
        }
      }
      if (cmd == "update") {
        interaction.deferReply().then(() => {

          const rawdata = JSON.parse(fs.readFileSync("db.json"));
          const uid = interaction.user.id.toString();
          if (uid in rawdata) {
            const name = rawdata[uid].scratch;
            const roles = interaction.member.roles;
            getrank(name).then(res => {
              roles.remove(getrole(interaction, "Master"));
              roles.remove(getrole(interaction, "Advanced"));
              roles.remove(getrole(interaction, "Visitor"));
              roles.remove(getrole(interaction, "Good"));
              setTimeout(() => {
                roles.add(getrole(interaction, res));
                console.log(`${interaction.user.displayName} updated role to ${res}`);

              }, 1000);
              rawdata[uid].rank = res;
              rawdata[uid].name = interaction.user.tag;
              const jsoned = JSON.stringify(rawdata);
              fs.writeFile("db.json", jsoned, (err) => { });
              interaction.editReply(`ランクを${res}に、ユーザー名を${interaction.user.tag}に変更しました。`);
            })

          } else {
            interaction.editReply("このユーザーは認証を行っていません。");
          }
        })

      }
      if (cmd == "notification") {
        interaction.deferReply().then(async () => {
          //check permission
          const option = interaction.options.get("option").value;
          if (option == "list") {
            //Only list command can be run by anyone!

            const scdata = JSON.parse(fs.readFileSync("scratch.json"));
            const keys = Object.keys(scdata);
            const embed = new EmbedBuilder().setTitle("Notification list").setDescription("**notification user count**: " + keys.length)
            for (let i = 0; i < keys.length; i++) {
              embed.addFields({ name: `${i}`, value: keys[i] });
            }
            interaction.editReply("ready!");
            interaction.channel.send({ embeds: [embed] });

          }
          else if (interaction.member.roles.cache.has("1065679401188081694")) {
            let name;
            try {
              name = interaction.options.get("username").value;
            } catch (error) {
              name = null;
            }
            //Requires name option to be filled
            if (name !== null) {
              let scdata = JSON.parse(fs.readFileSync("scratch.json"));
              if (option == "add") {
                if (Object.keys(scdata).indexOf(name) === -1) {
                  axios.get(`https://api.scratch.mit.edu/users/${name}`).then(async () => {
                    interaction.editReply("User found! now fetching datas...")
                    let ids = [];
                    let offset = 0;
                    while (true) {
                      const res = (await axios.get(`https://api.scratch.mit.edu/users/${name}/projects/?limit=40&offset=${offset}&timestamp=${new Date().getTime()}`)).data;
                      if (res.length === 0) {
                        break;
                      }
                      res.forEach(element => {
                        ids.push(element.id);
                      });
                      offset += 40;
                    }
                    //generate json
                    scdata[name] = { "raw": ids };
                    fs.writeFile("scratch.json", JSON.stringify(scdata), (err) => { });
                    console.log(`added ${name}`);
                    interaction.editReply(`${name} was successfully added to the list!`);

                  }).catch(() => {
                    interaction.editReply("User not found or something went wrong.");

                  })

                } else {
                  interaction.editReply(`${name} is already added to the list.`);
                }

              }
              if (option == "remove") {
                if (Object.keys(scdata).indexOf(name) !== -1) {
                  delete scdata[name];
                  fs.writeFile("scratch.json", JSON.stringify(scdata), (err) => { });
                  console.log(`deleted ${name}`);
                  interaction.editReply(`successfully deleted ${name}.`);
                } else {
                  interaction.editReply(`${name} is not on the list.`);
                }
              }

            } else {
              interaction.editReply("Username was not specified! :(");
            }

          } else {
            interaction.editReply("Only server moderator can run this command");
          }

        })
      }

    } else if (cmd == "dictionary_edit") {
      if (interaction.channelId == "1165606524127805460") {
        interaction.deferReply().then(() => {

          //interaction.editReply("hello world!\nhttps://uploads.scratch.mit.edu/get_image/project/499025389_480x360.png");
          const mode = interaction.options.get("mode").value;
          const category = interaction.options.get("category").value;
          const name = interaction.options.get("name").value;
          const db = JSON.parse(fs.readFileSync("dictionary.json"));
          let media;
          let reference;
          let permission;

          try {

          } catch (error) {

          }
          if (mode === "add") {

          }
        })
      } else {
        interaction.reply(`<#1165606524127805460> でのみこのコマンドを実行できます。`);
      }
    }
  }

  if (interaction.customId === "auth") {
    await interaction.deferReply({ ephemeral: true });

    let dm;
    try {
      dm = await interaction.user.send("Scratchのユーザー名を入力してください。");
    } catch {
      await interaction.editReply("DMにメッセージを送信できません。");
      return;
    }
    await interaction.editReply("DMを確認してください。");
    const filter = m => (/^[\x2d-\x7a]*$/).test(m);
    const collector = dm.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] }).then(async collected => {
      const scratchname = collected.first().content;
      const messageone = await dm.channel.send(`${scratchname}さんを検索中です...`);
      httprequest(`/users/${scratchname}/`).then(() => {
        const id = randomBytes(32).toString("hex");
        const buttontwo = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("authed").setLabel("貼り付けた！").setStyle(ButtonStyle.Primary))
        console.log(`${scratchname} is authorizing...`);
        messageone.edit({
          content: `アカウントが見つかりました。\nあなたのプロフィールの"私が取り組んでいること"に、以下の文字列を貼り付けてください。制限時間は60秒、5度試行できます。`, embeds: [{
            description: `\`\`\`\n${id}\n\`\`\``
          }], components: [buttontwo]
        });
        /**/
        {
          const filt = (interaction) => interaction.customId === 'authed';
          let count = 5;
          const collector = messageone.createMessageComponentCollector({ filt, time: 30000 });
          collector.on("collect", async o => {
            await o.deferReply();
            //
            axios({ url: `https://api.scratch.mit.edu/users/${scratchname}/?timestamp=${new Date().getTime()}`, method: "get" }).then(res => res.data).catch(() => {
              o.editReply("エラーが発生しました。");
              count--;
              if (count <= 1) {
                o.editReply(`試行可能回数を超えました。後でやり直してください。`);
                collector.stop();
                return;
              }
            }).then((res) => {
              if (res.profile.status.includes(id)) {
                o.editReply(`認証が完了しました。${scratchname}さん、ようこそ！`);
                collector.stop();
                console.log(`${scratchname} finished authorizing`);
                const rawdata = fs.readFileSync("db.json");
                let parsed = JSON.parse(rawdata);
                const userid = interaction.user.id.toString();
                let rank;
                getrank(scratchname).then(res => {
                  rank = res;
                  return;
                }).catch(() => {
                  rank = "Visitor";
                  return;
                }).then(() => {
                  parsed[userid] = { "scratch": scratchname, "rank": rank, "name": interaction.user.tag, "public": true };
                  const tmp = interaction.member.roles;
                  tmp.add(getrole(interaction, rank));
                  tmp.add(getrole(interaction, "Authorized"));
                  const jsoned = JSON.stringify(parsed);
                  if (jsoned != "") {
                    fs.writeFile("db.json", jsoned, (err) => { });
                  }
                });
              } else {
                count--;
                if (count <= 1) {
                  o.editReply(`試行可能回数を超えました。後でやり直してください。`);
                  collector.stop();
                  return;
                }
                o.editReply(`文字列の確認ができませんでした。あと${count}回試行できます。`)

              }
            })
          });
          collector.on(

            "end", () => { dm.channel.send(`認証を終了します。`); });

        }

      }
      ).catch(res => {
        if (res == "error") {
          messageone.edit("ボットにエラーが発生しました。"); return 0;
        } else if (res == 404) {
          messageone.edit("Scratchアカウントが見つかりませんでした。"); return 0;
        } else {
          messageone.edit(`${res}エラーが発生しました。`); return 0;

        }
      })

    }).catch(() => { dm.channel.send("タイムアウトしました。"); return 0; });

  }

});

const getrole = (interaction, name) => {
  return interaction.guild.roles.cache.find(role => role.name === name);
}

const { SlashCommandBuilder } = require("@discordjs/builders");
const main = () => {//Register slash commands and run
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
    (new SlashCommandBuilder().setName("update").setDescription("JIMOで昇格、ユーザー名の変更などしたら実行しましょう")).toJSON(),

    (new SlashCommandBuilder().setName("notification").setDescription("イントロ通知の管理用")
      .addStringOption(option =>
        option.setName('option')
          .setDescription('option')
          .setRequired(true)
          .addChoices(
            { name: "add", value: "add" },
            { name: "remove", value: "remove" },
            { name: "list", value: "list" }
          )
      )
      .addStringOption(option =>
        option.setName("username")
          .setDescription("Enter scratch username unless you are running 'list' option")
          .setRequired(false)
      )
    ).toJSON(),
    (new SlashCommandBuilder().setName("dictionary_edit").setDescription("イントロ辞典の用語追加、編集")
      .addStringOption(option =>
        option.setName("mode")
          .setRequired(true)
          .setDescription("mode")
          .addChoices(
            { name: "add", value: "add" },
            { name: "edit", value: "edit" },
          )
      )

      .addStringOption(option =>
        option.setName("category")
          .setDescription("どのカテゴリーですか？")
          .setRequired(true)
          .addChoices(
            { name: "style", value: "style" },
            { name: "design", value: "design" },
            { name: "effect", value: "effect" },
            { name: "tech", value: "tech" },
            { name: "contest", value: "contest" },
            { name: "jimo", value: "jimo" },
            { name: "other", value: "other" },
          )
      )
      .addStringOption(option =>
        option.setName("name")
          .setDescription("用語名")
          .setRequired(true)
      )
      .addStringOption(option =>
        option.setName("media")
          .setDescription("参考動画、写真等(任意)")
          .setRequired(false)
      )
      .addStringOption(option =>
        option.setName("reference")
          .setDescription("一例として、プロジェクトへのリンク等")
          .setRequired(false)
      )
      .addStringOption(option =>
        option.setName("permission")
          .setDescription("この用語の編集権限(任意)")
          .setRequired(false)
          .addChoices(
            { name: "自分だけ編集できる(Master以上のみ)", value: "0" },
            { name: "Advanced以上なら編集可能", value: "1" },
          )
      )
    ).toJSON(),



  ];
  rest.put(Routes.applicationGuildCommands(secret.CLIENT_ID, secret.GUILD_ID), { body: commands }).then(() =>
    client.login(secret.BOT_TOKEN)
  );

};
main();
/*
Master,Advanced,Good,Visitor
*/
const http = require("http");
http.createServer(function (req, res) {
  res.write("online");
  res.end();
}).listen(8080);


const getrank = (username) => {
  return new Promise((resolve, reject) => {
    axios({ url: secret.ASHIBARA_LINK, method: "get" }).then(res => res.data).catch(res => reject(res)).then(res => {
      const raw = res.split("\n");
      let i = 0;
      let ii = 0;
      let needstr = [["• – • Master intro makers • – •", "• – • Advanced intro makers • – •", "• – • Good intro makers • – •"], [null, "Master", "Advanced", "Good"]];
      while (true) {

        if (i > raw.length - 1) {
          resolve("Visitor");
          break;
        }
        const tmp = raw[i].toLowerCase();
        if (ii < 3) {
          if (tmp.includes(needstr[0][ii].toLowerCase())) {
            ii++;
          }
        }
        if (tmp.includes(username.toLowerCase()) && ii != 0) {
          resolve(needstr[1][ii]);
          break;

        }
        i++;
      }

    });

  })
};
