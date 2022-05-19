const {Interaction, MessageButton, MessageActionRow, ComponentType} = require('discord.js')

module.exports = class RPS{
    /**
     * @name RPS
     * @kind constructor
     * @param {Interaction} interaction
     * @param {User} opponent
     */
    constructor(int, opponent){
        if(!int) throw new TypeError("Interaction missing")
        this.interaction = int
        this.conversion = {'s':"✂️",'p':"📜","r":"🪨"}
        this.plays = {[int.user.id]:'',[opponent?.id]:''}
        this.player1 = int.user
        this.player2 = opponent || int.client.user
    }

    winner(user1, user2){
        const dct = {'s':'p', 'p':'r', 'r':'s'}
        if(user1 == user2){
            return 0
        } else if (dct[user1] == user2){
            return 1
        } else {
            return 2
    	}
	}

    async start(){
        const scissor = new MessageButton()
            .setEmoji("✂️")
            .setLabel('\u200b')
            .setStyle("Primary")
            .setCustomId("s")
        const paper = new MessageButton()
            .setEmoji("📜")
            .setLabel('\u200b')
            .setStyle("Primary")
            .setCustomId("p")
        const rock = new MessageButton()
            .setEmoji("🪨")
            .setLabel('\u200b')
            .setStyle("Primary")
            .setCustomId("r")

        const options = {content: "Rock Paper Scissors",components: [new MessageActionRow().addComponents([scissor,paper,rock])]}
        this.interaction.reply(options)
        const msg = await this.interaction.fetchReply()
        const collector = msg.createMessageComponentCollector({filter: f => f.user.id == this.player1.id || f.user.id == this.player2.id,componentType: ComponentType.Button, time: 600_000} )
        collector.on("collect",async m => {
            if(this.plays[m.user.id]){
                m.reply({content: "You already chose", ephemeral: true}) 
            }
            this.plays[m.user.id] = m.customId
            if(this.player2.id==this.interaction.client.user.id){
                const lst = ['r','p','s']
                this.plays[this.player2?.id] = lst[Math.floor(Math.random()*lst.length)]
            }
            if(!this.plays[this.player1.id]){
                m.reply({content: `Waiting for ${this.player1.toString()}`, ephemeral: true})
            } else if(!this.plays[this.player2?.id]){
                m.reply({content: `Waiting for ${this.player2?.toString()}`, ephemeral: true})
            } else{
                const win = this.winner(this.plays[this.player1.id],this.plays[this.player2?.id])
                if(win==0){
                    return m.update({content:`${this.player1.toString()}: ${this.conversion[this.plays[this.player1.id]]}\n${this.player2.toString()}: ${this.conversion[this.plays[this.player2.id]]}\n\nWinner: Tie`, components:[]})
                } else if(win==1){
                    return m.update({content:`${this.player1.toString()}: ${this.conversion[this.plays[this.player1.id]]}\n${this.player2.toString()}: ${this.conversion[this.plays[this.player2.id]]}\n\nWinner: ${this.player1.toString()}`, components:[]})
                } else {
                    return m.update({content:`${this.player1.toString()}: ${this.conversion[this.plays[this.player1.id]]}\n${this.player2.toString()}: ${this.conversion[this.plays[this.player2.id]]}\n\nWinner: ${this.player2.toString()}`, components:[]})
                }
                collector.stop()
            }
        })
    }
}
