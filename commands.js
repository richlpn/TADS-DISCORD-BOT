const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

const ytdl = require('ytdl-core');

class musicPlayer {

    constructor(client) {
        this.client = client;

        this.queue = new Map();

        this.player = createAudioPlayer();


    }
    async GetMusic(Link){
        try {
            songInfo = await ytdl.getInfo(Link);

            song = {
                titulo: songInfo.videoDetails.title,

                url: songInfo.videoDetails.video_url
            }

            } catch (error) {
                console.log(error)
                return null;
            }
            return song;

    }
    async CreateConstructor(msg,link) {

        let queueConstructor = this.queue.get(msg.guild.id)

            if (queueConstructor === undefined) {

                queueConstructor = {
                    textChannel: msg.channel,
                    VoiceChannel: channel,
                    connection: null,
                    songs: [],
                    volume: 5,
                    playing: true,
                }

                this.queue.set(msg.guild.id, queueConstructor);

            }
            let song = this.GetMusic(link)
            if(song === null){
                await await msg.reply("Link Invalido!!!")
                return null    
            }
            await msg.reply(`${song.titulo} foi adcionada a fila`);
            queueConstructor.songs.push(song)
            return queueConstructor;

    }
    async musicPlay(msg, musicLink) {
        let channel = msg.member.voice.channel;

        if (!channel) return msg.reply('você precisa estar em um canal de voz');

        let currentConstructor = this.CreateConstructor(msg,musicLink);

        if(currentConstructor !== null)return       

        try {

            currentConstructor.connection = joinVoiceChannel({

                channelId: channel.id,

                guildId: channel.guild.id,

                adapterCreator: channel.guild.voiceAdapterCreator
            })
            if (currentConstructor.songs.lenght > 0) {
                await msg.reply("Playing")
                // this.play(msg.guild)
            }

        } catch (error) {
            console.log(error)
            this.queue.delete(msg.guild.id)
            return msg.reply(`Um erro ocorreu ${songInfo.titulo} foi removido\n${error}`)
        }
    }
    async play(server) {
        let serverQueue = this.queue.get(server.id)
        let music = serverQueue.songs[0]

        await serverQueue.textChannel.send(`Tocando ${music.titulo}`)
        if (!music) {

            serverQueue.VoiceChannel.leave()

            this.queue.delete(server.id)

            return
        }

        let resource = createAudioResource(ytdl(music.url), { inlineVolume: true })

        resource.volume.setVolume(0.2)

        serverQueue.connection.subscribe(this.player)

        this.player.play(resource)
        this.player.on(AudioPlayerStatus.Idle, (e) => {
            this.queue.get(server.id).songs.splice(0, 1)
            this.play(server)
        })

        return
    }
}

module.exports = { musicPlayer }