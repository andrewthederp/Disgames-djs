const { Aki } = require("aki-api")
const {MessageButton,MessageEmbed,MessageActionRow} = require("discord.js")
module.exports = class Akinator{
    constructor(interaction,options){
        if(!interaction) throw new TypeError("Interaction missing")
        if(!options) options = {}
        if(!options.region) options.region = "people"
        if(!options.childMode) options.childMode = false
        this.interaction = interaction
        this.region = options.region
        this.childMode = options.childMode
    }

    async start(){
        const regions = {"people": "en", "animals": "en_animals", "objects": "en_objects"};
        const region = regions[this.region.toLowerCase()]
        const {childMode} = this
        const proxy = undefined
        const aki = new Aki({region, proxy,childMode})
        const {interaction: int} = this
        int.deferReply()
        
        let i = 0
        await aki.start()
        this.game(aki, int,i)
    }

    async game(aki, int,i){
        i++
        const Embed = new MessageEmbed().setTitle(`Question ${i}`).setDescription(aki.question).setColor(0x7289da).setFooter({text:`Progress: ${aki.progress}`})
        const buttons = []
        aki.answers.forEach(answer => {
            const answers = {"yes": "0","no": "1", "idk": "2","don't know": "2", "probably": "3", "probably not": "ik"};
            buttons.push(new MessageButton().setLabel(answer).setStyle("PRIMARY").setCustomId(answers[answer.toLowerCase()]))
        })
        const actionRow = new MessageActionRow().addComponents(buttons)
        int.editReply({embeds: [Embed],components: [actionRow]})
        const message = await int.fetchReply()
        const collector = message.createMessageComponentCollector(m => m.user.id === int.user.id,{time: 60000})
        collector.on("collect", async m => {
            if(m.user.id == int.user.id){
                m.deferUpdate()
                const answer = parseInt(m.component.customId)
                await aki.step(answer)
                if(aki.progress >= 70 || aki.currentStep >= 80){
                    await aki.win()
                    const guess = aki.answers[0]
                    if(guess){
                        Embed.setTitle(guess.name)
                        Embed.setDescription(guess.description)
                        Embed.setImage(guess.absolute_picture_path)

                    }else{
                        Embed.setTitle("You win!")
                        Embed.setDescription("I couldn't guess the answer, play again?")
                    }
                    return int.editReply({embeds: [Embed],components: []})
                }else this.game(aki, int,i)
            } else {
                m.reply({ content:"this is not your game", ephemeral:true })
                this.game(aki, int,i-1)
            }
            collector.stop()
        })
    }
}
