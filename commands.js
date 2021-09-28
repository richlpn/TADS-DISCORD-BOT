const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

const ytdl = require('ytdl-core');

class musicPlayer {

    constructor(client) {
        this.client = client;

        this.queue = new Map();

        this.player = createAudioPlayer();


    }
    async musicPlay(msg, musicLink) {
        let channel = msg.member.voice.channel;

        if (!channel) return msg.reply('você precisa estar em um canal de voz');

        let queueConstructor = this.queue.get(msg.guild.id)

        let song;

        let songInfo

        try {
            songInfo = await ytdl.getInfo(musicLink);

            song = {
                titulo: songInfo.videoDetails.title,

                url: songInfo.videoDetails.video_url

            }

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

            queueConstructor.songs.push(song);

        } catch (error) {
            console.log(error)
            return await msg.channel.send("Muscia não encontrada")
        }
        await msg.reply(`${song.titulo} foi adcionada a fila`);

        try {

            queueConstructor.connection = joinVoiceChannel({

                channelId: channel.id,

                guildId: channel.guild.id,

                adapterCreator: channel.guild.voiceAdapterCreator
            })
            if (AudioPlayerStatus !== 'playing') {
                console.log('playing')
                this.play(msg.guild)
            }

            return true;

        } catch (error) {
            console.log(error)
            this.queue.delete(msg.guild.id)
            return msg.reply(`Um erro ocorreu ${songInfo.titulo} foi removido\n${error}`)
        }
    }
    play(server) {
        let serverQueue = this.queue.get(server.id)
        let music = serverQueue.songs[0]


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