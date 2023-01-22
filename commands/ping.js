const {SlashCommandBuilder} = require("@discordjs/builders");
const pingcmd = new SlashCommandBuilder()
.setName("Ping")
.setDescription("Check whether bot is working.")

const pingfunc = (interaction)=>{
    
    interaction.reply(`Pong!`);
}
module.exports={pingcmd,pingfunc};