const secret = require("dotenv").config().parsed;
const ping = require("./commands/ping.js");
const { Client, GatewayIntentBits,REST,Routes} = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});
const rest = new REST({ version: "10" }).setToken(secret.BOT_TOKEN);


client.on("ready", () => {
  console.log(`${client.user.username}`)
})

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const cmd = interaction.commandName;
    if (cmd === "ping") {
      ping.pingfunc(interaction);
    }
  }
})
async function main() {
  const commands = [ping.pingcmd.toJSON()];
  await rest.put(Routes.applicationGuildCommands(secret.CLIENT_ID,secret.GUILD_ID), {
    body: commands,
  });
  console.log("started refreshing application (/) commands");  
    client.login(secret.BOT_TOKEN);
}

main();