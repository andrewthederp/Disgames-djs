const numbers = new RegExp(/^[0-9]+$/)
const symbols = new RegExp(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)
fs = require("fs")
path = require("path")
words = fs.readFileSync(path.resolve(__dirname,"words.txt"),{encoding:'utf8', flag:'r'}).split("\n").filter(w => w.length == 5 && !numbers.test(w) && !symbols.test(w)).map(w => w.replace("\r","")).map(w => w.toUpperCase())
const { EmbedBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,ButtonBuilder, InteractionCollector, ComponentType} = require("discord.js")



module.exports = class Wordle{
    constructor(interaction, player, word){
        if(!interaction || !player) throw new TypeError("Interaction or player missing")
        this.interaction = interaction
        this.player = player
        if(!word){
            this.word = words[Math.floor(Math.random()*words.length)]
        } else {
            this.word = word
        }
        this.guesses = []
        this.tries = 0
    }

    remove(wrd, letter){
        // wrd = wrd.split("")
        wrd[wrd.indexOf(letter)] = ""
        return wrd
    }

    filter_(guess){
        const arr = ['','','','','']
        let word_copy = [...this.word.split('')]
        const guessLetters = guess.split("")

        for(let i = 0; i < guessLetters.length; i++){
            const letter = guessLetters[i]
            if(letter == word_copy[i]){
                word_copy = this.remove(word_copy,letter)
                arr[i] = '🟩'
            }
        }

        for(let i = 0; i < guessLetters.length; i++){
            const letter = guessLetters[i]
            if(word_copy.includes(letter)){
                word_copy = this.remove(word_copy,letter)
                arr[i] = '🟨'
            }
        }

        for(let i = 0; i < arr.length; i++){
            const letter = arr[i]
            if(letter == "") arr[i] = '🟥'
        }

        return arr.join('')
    }

    win(arr){
        return arr == '🟩🟩🟩🟩🟩' // ._ .
    }

    make_embed(){
        let string = ''
        const Embed = new EmbedBuilder()
        .setTitle('Wordle!')
        .setColor(0x5865F2)
        for(let guess in this.guesses){
            const dct = this.guesses[guess]
            string += `${dct['guess'].split('').map(l=>`:regional_indicator_${l.toLowerCase()}:`).join('')}\n${dct['filter_word']}\n\n`
        }
        if(string){
            Embed.setDescription(string)
        }
        
        return Embed
    }

    async start(){
        const Modal = new ModalBuilder()
        .setCustomId("worlde")
        .setTitle("Worlde")
        const text = new TextInputBuilder()
        .setStyle(TextInputStyle.Short)
        .setMaxLength(5)
        .setMinLength(5)
        .setLabel(`Your guess`)
        .setCustomId(`guess`)
        const act = new ActionRowBuilder().addComponents([text]);
        Modal.addComponents([act])

        const button = new ButtonBuilder()
        .setLabel("click to guess")
        .setStyle("Primary")
        .setCustomId("click")

        const stop = new ButtonBuilder()
        .setLabel("STOP")
        .setStyle("Danger")
        .setCustomId("stop")

        const Embed = this.make_embed()
        const row = [new ActionRowBuilder().addComponents([button, stop])]
        await this.interaction.reply({embeds: [Embed],components: row})

        const msg = await this.interaction.fetchReply()
        const collector = msg.createMessageComponentCollector({filter: f => f.user.id == this.player.id && f.message.id == msg.id ,componentType: ComponentType.Button, time: 600_000} )

        collector.on("collect",async btn => {
            if(btn.customId=='stop'){
                collector.stop()
                btn.update({ content:'Wordle ended', components:[] })
                return
            } else if(btn.customId=='click'){
                btn.showModal(Modal).then(async() =>{
                    const input = new InteractionCollector(this.interaction.client,{time: 60_000})
                    input.on('collect', async i => {
                        if(!i.fields){
                            input.stop()
                        } else {
                            const guess = i.fields?.getTextInputValue("guess").toUpperCase()
                            for(obj in this.guesses){
                                if(this.guesses[obj]['guess']==guess){
                                    btn.reply({ content:`You already guessed ${guess.toLowerCase()}`})
                                    input.stop()
                                }
                            }
                            if(!words.includes(guess)){
                                btn.reply({ content:`${guess.toLowerCase()} is not in the word list`})
                                input.stop()
                            }else {
                                this.tries++
                                // let guess = i.fields?.getTextInputValue("guess").toUpperCase()
                                // console.log(guess)
                                const filter_word = this.filter_(guess)
                                this.guesses.push({'guess':guess, 'filter_word':filter_word})
                                const embed = this.make_embed()
                                if(this.win(filter_word)){
                                    await i.update({content:'You won!! :tada:', embeds:[embed]})
                                    input.stop()
                                    collector.stop()
                                    return
                                } else if(this.tries==5 && !this.win(filter_word)){
                                    await i.update({content:'You lost :pensive:', embeds:[embed]})
                                    input.stop()
                                    collector.stop()
                                    return
                                }else {
                                    await i.update({embeds:[embed]})
                                }

                            }
                        }

                    })
                })
            }
        })
    }
}
