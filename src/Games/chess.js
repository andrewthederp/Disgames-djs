let Chess = []
;(async()=>{
    Chess.push(await import("chess.js"))
})()

const { MessageEmbed, Modal, ActionRowBuilder, TextInputComponent, TextInputStyle,MessageActionRow, InteractionCollector, ComponentType} = require("discord.js")
module.exports = class Chess1{
    constructor(interaction,opponent){
        this.interaction = interaction
        this.member = opponent
        this.author = interaction.user
        this.turns = {'w':interaction.user,'b':opponent}
        if(!interaction || !opponent) throw new TypeError("Interaction or Opponent missing")
    }

    async createBoard(chess, moves=false){
        const fen = encodeURIComponent(chess.fen())
        const Embed = new MessageEmbed()
        .setTitle("Chess")
        .setImage(`http://www.fen-to-image.com/image/64/double/coords/${fen}`)
        .setColor(0x7289da)
        if(chess.game_over()){
            let value = undefined
            if (chess.in_checkmate()){
                value = `Checkmate, Winner: ${this.turns[chess.turn() == 'b' ? 'w' : 'b'].toString()}`
            }else if (chess.in_stalemate()){
                value = `stalemate`
            }else if (chess.insufficient_material()){
                value = `Insufficient material left to continue the game`
            }else if (chess.in_draw()){
                value = `50-moves rule`
            }else if (chess.in_threefold_repetition()){
                value = `Three-fold repitition.`
            }
            Embed.setDescription(value)
        } else {
            let string = `Turn: ${this.turns[chess.turn()].toString()}`
            if(moves){
                string += `\n${chess.moves().map(m => `\`${m}\``).join(",")}`
            }
            Embed.setDescription(string)
        }
        return Embed
    }
    
    async start(){
        const chess = new Chess[0].Chess()
        // const gameData= [{
        //     player: players[0],
        //     color: "w",
        // },{
        //     player: players[1],
        //     color: "b"
        // }]
        //     await this.game(chess,gameData)
        // }
        // async game(chess,gameData){
        const Modal = new Modal()
        .setCustomId("chess")
        .setTitle("Chess")
        const text = new TextInputComponent()
        .setStyle(TextInputStyle.Short)
        .setLabel(`Your turn`)
        .setCustomId(`move`)
        const act = new ActionRowBuilder().addComponents([text]);
        Modal.addComponents([act])
        let Embed = await this.createBoard(chess)
        const color = {'w':'White','b':'Black'}
        const button = new MessageActionRow()
                       .setLabel("CLICK HERE")
                       .setStyle("PRIMARY")
                       .setCustomId("click")
        const stop = new MessageActionRow()
                        .setLabel("STOP")
                        .setStyle("DANGER")
                        .setCustomId("stop")
        const possible = new MessageActionRow()
                        .setLabel("POSSIBLE MOVES")
                        .setStyle("SECONDARY")
                        .setCustomId("possible")
        const options = {content: `${color[chess.turn()]}'s turn`,embeds: [Embed],components: [new ActionRowBuilder().addComponents([button,stop,possible])]}
        await this.interaction.reply(options)
        
        const msg = await this.interaction.fetchReply()
        const collector = msg.createMessageComponentCollector({filter: f => f.user.id == this.member.id || f.user.id == this.author.id,componentType: ComponentType.Button, time: 600_000} )

        collector.on("collect",async btn => {
            if(btn.customId == "possible"){
                let Embed = await this.createBoard(chess, true)
                await btn.reply({content: `${chess.moves().map(m => `\`${m}\``).join(",")}`, ephemeral:true })
            }
            if(btn.customId == "stop"){
                button.setDisabled(true)
                stop.setDisabled(true)
                possible.setDisabled(true)
                const other_turn = chess.turn() == 'w' ? 'b' : 'w'
                await btn.update({content: `Game ended by: ${this.turns[other_turn].toString()} (${color[other_turn]})`, components: [new ActionRowBuilder().addComponents([button,stop,possible])]})
                collector.stop()
            }
            if(btn.customId == "click"){
                if(btn.user.id == this.turns[chess.turn()].id){
                    btn.showModal(Modal).then(async() =>{
                        const input = new InteractionCollector(this.interaction.client,{time: 60_000})
                            input.on('collect', async i => {
                                if(!i.fields){
                                    input.stop()
                                } else {
                                    const c = i.fields?.getTextInputValue("move")
                                    if(c) chess.move(c,{sloppy: true})
                                    let Embed = await this.createBoard(chess)
                                    await i.update({content: `${color[chess.turn()]}'s turn`, embeds: [Embed]})
                                    input.stop()
                                }
                            })
                    })
                } else {
                    btn.reply({ content:"this is not your turn", ephemeral:true })
                }
            }
        })
    }
}
