const {$fetch} = require("ohmyfetch")
const { MessageEmbed, MessageButton, TextInputComponent,MessageActionRow,Modal, TextInputStyle, InteractionCollector} = require("discord.js")

module.exports = class MadLibs {
    constructor(interaction,min,max) {
        this.interaction = interaction
        this.url = `http://madlibz.herokuapp.com/api/random?minlength=${min||5}&maxlength=${max||25}`
    }

    async start() {
        const {title, blanks, value} = await $fetch(this.url,{ parseResponse: JSON.parse })
        const answers = []
        let i = 0
        const button = new MessageButton()
        .setLabel("Play")
        .setStyle("PRIMARY")
        .setCustomId("btuon")
        const stop = new MessageButton()
        .setLabel("STOP")
        .setStyle("DANGER")
        .setCustomId("stop")
        this.interaction.reply({ content: "Click the button below to get the 1st question", components: [new MessageActionRow().addComponents([button, stop])]})
        const collector =(await this.interaction.fetchReply()).createMessageComponentCollector({ time: 600_000 })
        collector.on("collect",async (m) => {
            if(m.user.id == this.interaction.user.id){
                if(m.customId=='stop'){
                    collector.stop()
                    m.update({ content:'Ended', components:[] })
                    return
                }

                if(blanks.length !== i){
                    const question = blanks[i]
                    const ana =  ["a","e","i","o","u"].includes(question[0]) ? "an" : "a"
                    const text = new TextInputComponent()
                    .setLabel(`Enter ${ana} ${question}`)
                    .setStyle(TextInputStyle.Short)
                    .setCustomId("answer")
                    const act  = new MessageActionRow()
                    .addComponents([text])
                    const Modal = new Modal()
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
                                const options = { content: `Click the button below to get the ${i + 1}${i + 1 == 2 ? "nd" : i + 1 == 3 ? "rd" : "th"} question`, components: [new MessageActionRow().addComponents([button,stop])]}

                                if(blanks.length == i) {
                                    options.content = "Click the button to see your result"
                                    options.components = [new MessageActionRow().addComponents([button.setLabel("Result")])]}
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
                    const embed = new MessageEmbed()
                    .setTitle(title)
                    .setDescription(str)
                    .setColor(0x5865F2)
                    m.update({ content: "", components: [], embeds: [embed]})
                }
            } else {
                m.reply({ content:"this is not your game", ephemeral:true })
            }
        })
    }
}
