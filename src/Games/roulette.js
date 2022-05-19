const { MessageButton, MessageEmbed, MessageActionRow } = require("discord.js")
module.exports = class RussianRoulette{
    constructor(interaction,opponent){
        this.interaction = interaction
        this.opponent = opponent
    }
    async start(){
        const players = [this.interaction.user,this.opponent].sort(() => Math.random() - 0.5)
        let i = 0
        let turn = players[i]
        const Embed = new MessageEmbed()
            .setTitle("Russian Roulette")
            .setColor("Blurple")
            .setDescription(`${turn.username} is the gunner.`)
        const Button = new MessageButton()
            .setLabel("Pull the trigger!")
            .setStyle("Danger")
            .setCustomId("pull")
        this.interaction.reply({embeds:[Embed],components:[new MessageActionRow().addComponents([Button])]})
        const msg = await this.interaction.fetchReply()
        const input = msg.createMessageComponentCollector(m => m.user.id == turn.id && m.component.customId == "pull")
        input.on("collect",(inp) => {
            if(inp.user.id == turn.id){
            const random = Math.floor(Math.random()*6)
            console.log(random)
            if(random !== 5){
                if(i == 0) i = 1
                else i = 0
                turn = players[i]
                Embed.setDescription(`${turn.username} is the gunner.`)
                inp.update({ embeds: [Embed], components: [new MessageActionRow().addComponents([Button])] })
            }else{
                Embed.setDescription(`${turn.username} **was** the gunner.\n\n**You died.**`)
                .setColor("Red")
                inp.update({ embeds: [Embed], components: [] })
                input.stop()
                return turn.id
            }
        } 
        })
    }
}
