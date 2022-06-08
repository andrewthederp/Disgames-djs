const { EmbedBuilder, ButtonBuilder, TextInputBuilder, ActionRowBuilder, ModalBuilder, TextInputStyle, InteractionCollector} = require("discord.js")

module.exports = class MadLibs {
    constructor(interaction, options) {
        this.interaction = interaction
        if(!options.red) throw new TypeError("red player missing")
        if(!options.blue) throw new TypeError("blue player missing")
        this.dct = this.parse_options(options)
    	this.board = []
    	for(i=1; i<7; i++){
    		this.board.push([' ',' ',' ',' ',' ',' ',' '])
    	}
    	this.turns = {'r':options.red,'b':options.blue}
    	this.turn = 'r'
    	this.color = {'r':'red','b':'blue'}
    }

	parse_options(options){
		return {'r': options.r || '🔴', 'b': options.b || '🔵', '♦': options.win_r || '♦️', 'B': options.win_B || '🔷', ' ': options.space || '⬛'}
	}

    format_board(board){
        let lst = []
        for(let i in board){
            lst.push(board[parseInt(i)].map(i=>this.dct[i] || i).join(''))
        }
        return lst.join("\n")
    }

	move(index){
		if(this.board[0][index] != ' '){
			return null
		}
		for(i=0; i<6; i++){
			if this.board[5-y][index] == ' ':
				this.board[5-y][index] = this.turn
				break
		}
		return true
	}

	has_won(){
		height = 6
		width = 7
		for(x=0; x<height; x++){
			for(y=0; y<width-3; y++){
				if (this.board[x][y] == this.board[x][y + 1] and this.board[x][y] == this.board[x][y + 2] and this.board[x][y] == this.board[x][y + 3] and this.board[x][y] != " "){
					this.board[x][y] = this.board[x][y].upper()
					this.board[x][y + 1] = this.board[x][y].upper()
					this.board[x][y + 2] = this.board[x][y].upper()
					this.board[x][y + 3] = this.board[x][y].upper()
					return [true, "in a horizontal row"]
				}
			}
		}
		for(x=0; x<height-3; x++){
			for(y=0; y<width; y++){
				if (this.board[x][y] == this.board[x + 1][y] and this.board[x][y] == this.board[x + 2][y] and this.board[x][y] == this.board[x + 3][y] and this.board[x][y] != " "){
					this.board[x][y] = this.board[x][y].upper()
					this.board[x + 1][y] = this.board[x][y].upper()
					this.board[x + 2][y] = this.board[x][y].upper()
					this.board[x + 3][y] = this.board[x][y].upper()
					return [true, "in a vertical row"]
				}
			}
		}
		for(x=0; x<height-3; x++){
			for(y=0; y<width-3; y++){
				if (this.board[x][y] == this.board[x + 1][y + 1] and this.board[x][y] == this.board[x + 2][y + 2] and this.board[x][y] == this.board[x + 3][y + 3] and this.board[x][y] != " "){
					this.board[x][y] = this.board[x][y].upper()
					this.board[x + 1][y + 1] = this.board[x][y].upper()
					this.board[x + 2][y + 2] = this.board[x][y].upper()
					this.board[x + 3][y + 3] = this.board[x][y].upper()
					return [true, "on a \ diagonal"]
				}
			}
		}
		for(x=0; x<height-3; x++){
			for(y=3; y<width; y++){
				if (this.board[x][y] == this.board[x + 1][y - 1] and this.board[x][y] == this.board[x + 2][y - 2] and this.board[x][y] == this.board[x + 3][y - 3] and this.board[x][y] != " "){
					this.board[x][y] = this.board[x][y].upper()
					this.board[x + 1][y - 1] = this.board[x][y].upper()
					this.board[x + 2][y - 2] = this.board[x][y].upper()
					this.board[x + 3][y - 3] = this.board[x][y].upper()
					return [true, "in a / diagonal"]
				}
			}
		}
		let num = 0
		for(row in this.board){
			for(col in row){
				if(col == ' '){
					num += 1
				}
			}
		}
		if(num==0){
			return false
		}
		return null
	}

	start(){
		const input = new TextInputBuilder()
		.setStyle(TextInputStyle.Short)
		.setLabel("Enter a coordinate")
		.setCustomId("move")
		.setMinLength(1)
		.setMaxLength(1)
		const modal = new ModalBuilder()
		.setCustomId("Connect4")
		.setTitle("Connect4")
		const action = new ActionRowBuilder().addComponents([input])
		modal.addComponents([action])
		const move = new ButtonBuilder()
			.setLabel("Play move!")
			.setCustomId("move")
			.setStyle("Primary")
    	const stop = new ButtonBuilder()
	        .setLabel("STOP")
	        .setStyle("Danger")
	        .setCustomId("stop")

		const Embed = new EmbedBuilder()
			.setTitle("Connect4")
			.setDescription(`Turn: ${this.turns[this.turn].toString()} (${this.colors[this.turn]})\n\n${this.format_board(this.board)}`)
			.setColor(0x5865F2)

		const row = [new ActionRowBuilder().addComponents([move, stop])]
		this.interaction.reply({embeds: [Embed], components: row})
		const msg = await this.interaction.fetchReply()
		const collector = msg.createMessageComponentCollector({ filter: m => m.user.id == this.author.id || m.user.id == this.member.id })
		collector.on('collect', async m => {
			if(m.customId=='stop'){
				const Embed = new EmbedBuilder()
					.setDescription(`Game ended by: ${this.turns[this.turn].toString()} (${this.colors[this.turn]})\n\n${this.format_board(this.board)}`)
					.setColor(0x5865F2)
				m.update({ embeds:[Embed], components:[] })
				collector.stop()
				return
			} else {
				if(m.user.id == this.turns[this.turn].id){
					m.showModal(modal).then(async() => {
						const input = new InteractionCollector(this.interaction.client, { filter: m => (m.user.id == this.author.id || m.user.id == this.member.id ) && m.message.id == msg.id })
						input.on('collect', async i => {
							if(!i.fields){
								collector.stop()
								input.stop()
							} else {
								let move = i.fields.getTextInputValue("move")
								if (!isNaN(move) && move-1 >= 0 && move-1 < 7){
									const done = this.move(move-1)
									if(!done){
										m.reply({ content:"this is not your turn", ephemeral:true })
									}
									const won = this.has_won()
									if(won){
										if(won==false){
											Embed.description = `Turn: ${this.turns[this.turn].toString()} (${this.colors[this.turn]})\n\n${this.format_board(this.board)}`
											i.update({embeds: [Embed], components: [] , content: 'Tie!'})
											input.stop()
											collector.stop()
											return
										} else {
											Embed.description = `Turn: ${this.turns[this.turn].toString()} (${this.colors[this.turn]})\n\n${this.format_board(this.board)}`
											i.update({embeds: [Embed], components: [] , content: `${this.turns[this.turn].toString()} connected 4 ${won[1]}`})
											input.stop()
											collector.stop()
											return
										}
										if(this.turn=='r'){
											this.turn = 'b'
										} else {
											this.turn = 'r'
										}
										Embed.description = `Turn: ${this.turns[this.turn].toString()} (${this.colors[this.turn]})\n\n${this.format_board(this.board)}`
										i.update({embeds: [Embed]})
									}
								}
							}
						})
					})
				}
			}
		})
	}
}