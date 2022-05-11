const { EmbedBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle,ButtonBuilder, InteractionCollector, ComponentType} = require("discord.js")


module.exports = class Checkers{
    constructor(interaction,opponent){
    	if(!interaction || !opponent) throw new TypeError("Interaction or Opponent missing")
        this.interaction = interaction
        this.member = opponent
        this.author = interaction.user
        this.board = [
		    [" ", "b", " ", "b", " ", "b", " ", "b"],
		    ["b", " ", "b", " ", "b", " ", "b", " "],
		    [" ", "b", " ", "b", " ", "b", " ", "b"],
		    [" ", " ", " ", " ", " ", " ", " ", " "],
		    [" ", " ", " ", " ", " ", " ", " ", " "],
		    ["r", " ", "r", " ", "r", " ", "r", " "],
		    [" ", "r", " ", "r", " ", "r", " ", "r"],
		    ["r", " ", "r", " ", "r", " ", "r", " "],
		]
		this.opts = {"ul": [-1,-1], "ur": [-1,1], "dl": [1,-1], "dr": [1,1]}
		this.turns = {'r': interaction.user, 'b':opponent}
		this.colors = {'r':'Red','b':'Blue'}
		this.turn = 'r'
		this.other_turn = 'b'
    }

	format_board(board){
		let lst = [':stop_button::regional_indicator_a::regional_indicator_b::regional_indicator_c::regional_indicator_d::regional_indicator_e::regional_indicator_f::regional_indicator_g::regional_indicator_h:']
		const dct = {'1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣', '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', 'r':'🔴','b':'🔵','rk':'♦','bk':'🔷',' ':'⬛'}
		for(const i in board){
			const r = board[i].map(i => dct[i]).join('')
			lst.push(
				dct[parseInt(i)+1]+r
			)
		}
		return lst.join("\n")
	}

	has_won(){
	    const nos = {" ": 0, "r": 0, "b": 0}
	    for (const i in this.board){
	        for (const m in this.board[i]){
	            nos[this.board[i][m][0]] += 1
	        }
	    }

	    if (nos["b"] == 0){
	        return "r"
	    } else if (nos["r"] == 0){
	        return "b"
	    }
	}

	get_coors(coordinate){
		if([2,3].includes(coordinate.length)){
			coordinate = coordinate.toLowerCase()
			if(coordinate[0].search(/[^A-Za-z\s]/) == -1){
				const digit = coordinate.slice(1)
				const letter = coordinate[0]
				const x = parseInt(digit) - 1
				const y = letter.charCodeAt() - 'a'.charCodeAt()
				if(x >= 10 || x < 0 || y >= 10 || y < 0){
					return
				}
				return [x,y]
			} else {
				const digit = coordinate.slice(0, -1)
				const letter = coordinate.slice(-1)
				const x = parseInt(digit) - 1
				const y = letter.charCodeAt() - 'a'.charCodeAt()
				if(x >= 10 || x < 0 || y >= 10 || y < 0){
					return
				}
				return [x,y]
			}
		}
	}

	convert_to_coors(x_, y_){
		const x = parseInt(x_)+1
		const y = String.fromCharCode(y_+'a'.charCodeAt())
		return [x, y]
	}

	valid_moves(e, i){
		const x = parseInt(e)
		const y = parseInt(i)
		let moves = []
		const dirs = {'r':['ul','ur'],'b':['dl','dr']}[this.board[x][y]] || ['ul','ur','dl','dr']
		const dir_names = {'ul':"up left", 'ur':'up right', 'dl':'down left', 'dr':'down right'}
		const xy = this.convert_to_coors(x, y)
		for(const i in dirs){
			const inc = this.opts[dirs[i]]
			const x_ = x+inc[0]
			const y_ = y+inc[1]
			const x__ =  x+(inc[0]*2)
			const y__ =  y+(inc[1]*2)
			if(x > 7 || x < 0){
				continue
			} else if(y > 7 || y < 0){
				continue
			} else if(x_ > 7 || x_ < 0){
				continue
			} else if(y_ > 7 || y_ < 0){
				continue
			} else {
				if (this.board[x_][y_] == ' '){
					moves.push(`${dir_names[dirs[i]]} ${xy[0]}${xy[1]}`)
				} else if(this.board[x_][y_][0] == this.other_turn){
					if(this.board[x__][y__] == ' '){
						if(x__ > 7 || x__ < 0){
							continue
						} else if(y__ > 7 || y__ < 0){
							continue
						}
						moves.push(`${dir_names[dirs[i]]} ${xy[0]}${xy[1]}`)
					} else {
						continue
					}
				}
			}
		}
		return moves
	}

	moves(){
		let r_moves = []
		let b_moves = []
		for(const x in this.board){
			for(const y in this.board[x]){
				if(this.board[x][y]!=' '){
					const moves = this.valid_moves(x, y)
					if(this.board[x][y][0]=='r'){
						r_moves.push(...moves)
					} else {
						b_moves.push(...moves)
					}
				}
			}
		}
		return {'r':r_moves,'b':b_moves}[this.turn]
	}

	async start(){
		const input = new TextInputBuilder()
		.setStyle(TextInputStyle.Short)
		.setLabel("Enter a coordinate")
		.setCustomId("move")
		.setMinLength(2)
		.setMaxLength(2)
		const modal = new ModalBuilder()
		.setCustomId("Checkers")
		.setTitle("Checkers")
		const action = new ActionRowBuilder().addComponents([input])
		modal.addComponents([action])
		const up_left = new ButtonBuilder()
			.setLabel("up left")
			.setCustomId("ul")
			.setStyle("Primary")
		const up_right = new ButtonBuilder()
			.setLabel("up right")
			.setCustomId("ur")
			.setStyle("Primary")
		const down_left = new ButtonBuilder()
			.setLabel("down left")
			.setCustomId("dl")
			.setStyle("Primary")
		const down_right = new ButtonBuilder()
			.setLabel("down right")
			.setCustomId("dr")
			.setStyle("Primary")
    	const moves = new ButtonBuilder()
	        .setLabel("moves")
	        .setStyle("Success")
	        .setCustomId("moves")
    	const stop = new ButtonBuilder()
	        .setLabel("STOP")
	        .setStyle("Danger")
	        .setCustomId("stop")

		const Embed = new EmbedBuilder()
			.setTitle("Checkers")
			.setDescription(`Turn: ${this.turns[this.turn].toString()} (${this.colors[this.turn]})\n\n${this.format_board(this.board)}`)
			.setColor(0x5865F2)

		const row = [
		new ActionRowBuilder().addComponents([up_left, up_right, down_left, down_right, moves]),
		new ActionRowBuilder().addComponents([stop])
		]
		const options = {embeds: [Embed], components: row}
		this.interaction.reply(options)
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
			} else if(m.customId=='moves'){
				// await m.deferUpdate()
				// console.log(this.moves().map(m => ` \`${m}\``).join(","))
				await m.reply({content: `${this.moves().map(m => ` \`${m}\``).join(",")}`, ephemeral:true })
			} else{
				if(m.user.id == this.turns[this.turn].id){
					let switch_turns = true
					m.showModal(modal).then(async() => {
						const input = new InteractionCollector(this.interaction.client, { filter: m => (m.user.id == this.author.id || m.user.id == this.member.id ) && m.message.id == msg.id })
						input.on('collect', async i => {
							if(!i.fields){
								collector.stop()
								input.stop()
							} else {
								let s = i.fields.getTextInputValue("move")
								const xy = this.get_coors(s)
								const x = xy[0]
								const y = xy[1]
								const inc = this.opts[m.customId]
								const x_ = x+inc[0]
								const y_ = y+inc[1]
								const x__ =  x+(inc[0]*2)
								const y__ =  y+(inc[1]*2)
								if(x > 7 || x < 0){
									input.stop()
									switch_turns = false
								} else if(y > 7 || y < 0){
									input.stop()
									switch_turns = false
								} else if(x_ > 7 || x_ < 0){
									input.stop()
									switch_turns = false
								} else if(y_ > 7 || y_ < 0){
									input.stop()
									input.stop()
									switch_turns = false
								} else if(this.board[x][y][0] != this.turn){
									input.stop()
									switch_turns = false
								} else if(this.board[x][y] == 'b' && inc[0] == -1 && this.board[x][y][1] == undefined){
									input.stop()
									switch_turns = false
								} else if(this.board[x][y] == 'r' && inc[0] == 1 && this.board[x][y][1] == undefined){
									input.stop()
									switch_turns = false
								} else {
									if (this.board[x_][y_] == ' '){
										this.board[x_][y_] = this.board[x][y]
										this.board[x][y] = ' '
										if(x_ == 0 || x_ == 7){
											this.board[x_][y_] = this.turn+'k'
										} else {
											input.stop()
										}
									} else if(this.board[x_][y_][0] == this.other_turn){
										if(this.board[x__][y__] == ' '){
											if(x__ > 7 || x__ < 0){
												input.stop()
												switch_turns = false
											} else if(y__ > 7 || y__ < 0){
												input.stop()
												switch_turns = false
											}
											this.board[x__][y__] = this.board[x][y]
											this.board[x][y] = ' '
											this.board[x_][y_] = ' '
											if(x__ == 0 || x__ == 7){
												this.board[x_][y_] = this.turn+'k'
											}
										} else {
											input.stop()
											switch_turns = false
										}
									}
								}
							}

						if(switch_turns){
							if(this.turn=='r'){
								this.turn = 'b'
								this.other_turn = 'r'
							} else {
								this.turn = 'r'
								this.other_turn = 'b'
							}
						}
						if(this.has_won()){
							const Embed = new EmbedBuilder()
								.setTitle("Checkers")
								.setDescription(`Winner: ${this.turns[this.other_turn].toString()} (${this.colors[this.other_turn]})\n\n${this.format_board(this.board)}`)
								.setColor(0x5865F2)

							i.update({embeds: [Embed], components: [] })
							input.stop()
							collector.stop()
						} else {
							const Embed = new EmbedBuilder()
								.setTitle("Checkers")
								.setDescription(`Turn: ${this.turns[this.turn].toString()} (${this.colors[this.turn]})\n\n${this.format_board(this.board)}`)
								.setColor(0x5865F2)

							i.update({embeds: [Embed]})
							input.stop()
						}
						})
					})
				} else {
					m.reply({ content:"this is not your turn", ephemeral:true })
				}
			}
		})
	}
}
