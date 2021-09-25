const { Client, Intents } = require('discord.js');
const { getVoiceConnection, joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource } = require('@discordjs/voice');

const video = require('ytdl-core');

const { BOT_ID } = require('./config.json');
const queue = new Map();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });


client.on('ready', () => {
    console.log('Ready!!!');
})
client.on('message', async (msg) => {
    if (msg.author.bot) return;

    let commands = msg.content.split(" ");

    let channel = msg.member.voice.channel;

    if (!channel) return msg.reply('você precisa estar em um caanal de voz')
    if (msg.content === 'ola') {
        return msg.reply(`ola **${msg.author}`)
    }
    else if (commands[0] === 'add') {
        let songInfo = await video.getInfo(commands[1]);
        let song = {
            titulo: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url
        }
        const queueConstructor = {
            textChannel: msg.channel,
            VoiceChannel: channel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
        }
        await msg.reply(`${song.titulo} foi adcionada a fila`);
        queue.set(msg.guild.id, queueConstructor);
        queueConstructor.songs.push(song);
        try {

            queueConstructor.connection =  joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            })
            play(msg.guild, queueConstructor.songs[0])
        } catch (error) {
            console.log(error)
            queue.delete(msg.guild.id)
            return await msg.reply(error)
        }
    }
})
function play(server, music) {
    let serverQueue = queue.get(server.id)
    if (!music) {
        serverQueue.VoiceChannel.leave()
        queue.delete(server.id)
        return
    }
    // let resource = createAudioResource(video(music.url), { inlineVolume: true })
    // const player = createAudioPlayer();
    // console.log(resource.volume.setVolume(0.2))
    // serverQueue.connection.subscribe(player)
    // player.play(resource)
    // player.on('error', error => console.log)
    let stream = video(music.url, {
        filter:
            'audioonly'
    });

    let DJ = serverQueue.conn.playStream(stream);

    DJ.on('end', end => {
        VoiceChannel.leave();
    })
}
try {
    client.login(BOT_ID)
} catch (error) {
    console.log(error)
}