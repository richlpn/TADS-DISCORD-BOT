const { Client, Intents } = require('discord.js');

const { BOT_ID } = require('./config.json');

const { musicPlayer } = require('./commands.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

let musicHandler;
client.on('ready', () => {
    console.log('Ready!!!');
    musicHandler = new musicPlayer(client);
})
client.on('message', async (msg) => {
    if (msg.author.bot) return;

    let commands = msg.content.split(" ");
    if (msg.content === '!ola') {
        return msg.reply(`ola **${msg.author}`)
    }
    else if (commands[0] === '!add') {
        musicHandler.musicPlay(msg, commands[1])

    }
    else if (msg.content === '!pause') {
        player.pause()
    }
    else if (msg.content === '!play') {
        player.unpause()
    }
    else if (msg.content === "!test") {
        try{

            musicHandler.addSong(msg, commands[1])
        }catch(error){
            console.log(error)
        }
    }
})

try {
    client.login(BOT_ID)
} catch (error) {
    console.log(error)
}