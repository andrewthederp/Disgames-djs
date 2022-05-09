const {$fetch} = require("ohmyfetch")
const { EmbedBuilder, ButtonBuilder, TextInputBuilder,ActionRowBuilder,ModalBuilder, TextInputStyle, InteractionCollector} = require("discord.js")
module.exports = class MadLibs {
    constructor(interaction,min,max) {
        this.interaction = interaction
        this.url = `http://madlibz.herokuapp.com/api/random?minlength=${min||5}&maxlength=${max||25}`
    }
    async start() {
        const {title, blanks, value} = await $fetch(this.url,{ parseResponse: JSON.parse })
        const answers = []
        let i = 0
        const button = new ButtonBuilder()
        .setLabel("Play")
        .setStyle("Primary")
        .setCustomId("btuon")
        const stop = new ButtonBuilder()
        .setLabel("STOP")
        .setStyle("Danger")
        .setCustomId("stop")
        this.interaction.reply({ content: "Click the button below to get the 1st question", components: [new ActionRowBuilder().addComponents([button, stop])]})
        const collector =(await this.interaction.fetchReply()).createMessageComponentCollector(m => m.user.id == this.interaction.message.user.id)
        collector.on("collect",async (m) => {
            if(m.customId=='stop'){
                collector.stop()
                m.update({ content:'Ended', components:[] })
                return
            }

            if(blanks.length !== i){
                const question = blanks[i]
            const aan =  ["a","e","i","o","u"].includes(question[0]) ? "an" : "a"
            const text = new TextInputBuilder()
            .setLabel(`Enter ${aan} ${question}`)
            .setStyle(TextInputStyle.Short)
            .setCustomId("answer")
            const act  = new ActionRowBuilder()
            .addComponents([text])
            const Modal = new ModalBuilder()
            .setTitle(title)
            .setCustomId("madlibs")
            .addComponents([act])
            m.showModal(Modal).then(() => {
                const input = new InteractionCollector(this.interaction.client,h => h.user.id == this.interaction.user.id)
                input.on("collect",(j) => {
                    if(!j.fields){
                        input.stop()
                    } else {
                        const c = j.fields.getTextInputValue("answer")
                        if(c) answers.push(c)
                        i++
                        const options = { content: `Click the button below to get the ${i + 1}${i + 1 == 2 ? "nd" : i + 1 == 3 ? "rd" : "th"} question`, components: [new ActionRowBuilder().addComponents([button,stop])]}

                        if(blanks.length == i) {
                            options.content = "Click the button to see your result"
                            options.components = [new ActionRowBuilder().addComponents([button.setLabel("Result")])]}
                        j.update(options)
                    }
                })
            })
        }else{
            let str = ''
            value.pop()
            for(let p = 0; p < value.length; p++){
                str += value[p]
                if(answers[p]) str += answers[p]
            }
            const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(str)
            .setColor(0x5865F2)
            m.update({ content: "", components: [], embeds: [embed]})
        }
    })
    
    }
}