const {MessageEmbed, MessageButton, Modal, TextInputBuilder, MessageActionRow, TextInputStyle, InteractionCollector} = require("discord.js")

module.exports = class Minesweeper{
	constructor(interaction,chance){
		if(!interaction) throw new TypeError("Interaction missing")
		if(!chance) chance = .17
		this.chance = chance
		this.interaction = interaction
	}
	format_board(board){
		const dct = {"b": "💣", "f": "🚩", " ": "🟦","x":"❌", '0':'⬛', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣', '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣', '10':'🔟'}
		let lst = [":stop_button::regional_indicator_a::regional_indicator_b::regional_indicator_c::regional_indicator_d::regional_indicator_e::regional_indicator_f::regional_indicator_g::regional_indicator_h::regional_indicator_i::regional_indicator_j:"]
		for(const row in board){
			const r = board[row].map(i => dct[i]).join('')
			lst.push(dct[parseInt(row)+1]+r)
		}
		return lst.join("\n")
	}

	make_board(){
		let board = []
		let a
		for(let i = 0; i <= 9; i++){
			let temp_lst = []
			for(let j = 0; j <= 9; j++){
				if(Math.random() * 1 <= this.chance) a = "b"
				else a = "n"
				temp_lst.push(a)
			}
			board.push(temp_lst)
		}
		for(const x in board){
			for(const y in board[x]){
				if(board[x][y] == "n"){
					let bombs = 0 
					const neighbours = this.get_neighbours(x, y)
					for(const i in neighbours){
						const x_ = neighbours[i][0]
						const y_ = neighbours[i][1]
						if(board[x_][y_] == "b"){
							bombs ++
						}
					}
					board[x][y] = JSON.stringify(bombs)
					}
				}
			}
			let vboard = []
			for(let i = 0; i <= 9; i++){
				let temp_lst = []
				for(let e=0; e <= 9; e++){
					temp_lst.push(' ')
				}
				vboard.push(temp_lst)
			}
			return [board, vboard]
		}

	get_neighbours(x, y){
		x = parseInt(x)
		y = parseInt(y)
		let lst = []
		const xs = [x-1, x, x+1]
		const ys = [y-1, y, y+1]
		for(const x_ in xs){
			for(const y_ in ys){
				if(xs[x_] !=-1 && xs[x_] !=10 && ys[y_] !=-1 && ys[y_] !=10){
					lst.push([xs[x_], ys[y_]])
				}
			}
		}
		return lst
	}

	reveal_zeros(x, y, vboard, board){
		const neighbours = this.get_neighbours(x, y)
		for(const i in neighbours){
			const x_ = neighbours[i][0]
			const y_ = neighbours[i][1]
			if(vboard[x_][y_] != ' '){
				continue
			}
			vboard[x_][y_] = board[x_][y_]
			if(board[x_][y_] == '0'){
				this.reveal_zeros(x_, y_, vboard, board)
			}
		}
		return vboard
	}

	reveal_all(vboard,board){
		for(const x in vboard){
			for(const y in vboard[x]){
				if(vboard[x][y] == ' '){
					vboard[x][y] = board[x][y]
				} else if(vboard[x][y] == 'f'){
					if(board[x][y] != 'b'){
						vboard[x][y] = 'x'
					}
				}
			}
		}
		return vboard
	}

	get_bombs(board){
		let lst = []
		for(const x in board){
			for(const y in board[x]){
				if(board[x][y] == 'b'){
					lst.push([x, y])
				}
			}
		}
		return lst
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

	has_won(vboard,board){
		let num = 0
		const bombs = this.get_bombs(board)
		for(const x in board){
			for(const y in board[x]){
				if(vboard[x][y] == board[x][y]){
					num ++
				}
			}
		}
		if(num == ((board.length * board[0].length) - bombs.length)){
			return true
		}
	
		for(const bomb in bombs){
			if(vboard[bombs[bomb][0]][bombs[bomb][1]] != "f"){
				return false
			}
		}
		return true
	}

	async start(){
		const b = this.make_board()
		const board = b[0]
		// console.log(board)
		let vboard = b[1]

		const input = new TextInputBuilder()
		.setStyle(TextInputStyle.Short)
		.setLabel("Enter a coordinate")
		.setCustomId("move")
		.setMinLength(2)
		// .setMaxLength(3)
		const modal = new Modal()
		.setCustomId("Minesweeper")
		.setTitle("Minesweeper")
		const action = new MessageActionRow().addComponents([input])
		modal.addComponents([action])
		const reveal = new MessageButton()
		.setLabel("Reveal")
		.setCustomId("reveal")
		.setStyle("Success")
		const flag = new MessageButton()
		.setLabel("Flag")
		.setCustomId("flag")
		.setStyle("Danger")
    	const stop = new MessageButton()
        .setLabel("STOP")
        .setStyle("Danger")
        .setCustomId("stop")
		let Embed = new MessageEmbed()
			.setTitle("Minesweeper")
			.setDescription(`${this.format_board(vboard)}`)
			.setColor(0x5865F2)
		const options = {embeds: [Embed], components: [new MessageActionRow().addComponents([reveal, flag, stop])]}
		if(!this.interaction.replied) this.interaction.reply(options)
		else this.interaction.editReply(options)
		const msg = await this.interaction.fetchReply()
		const collector = msg.createMessageComponentCollector({ time : 600_000 })
		let end = false
		collector.on('collect', async m => {
			if(m.user.id == this.interaction.user.id){
				if(m.customId=='stop'){
					const Embed = new MessageEmbed()
						.setTitle("Game ended")
						.setDescription(`${this.format_board(vboard)}`)
						.setColor(0x5865F2)
					m.update({ embeds:[Embed], components:[] })
					collector.stop()
					return
				}
				m.showModal(modal).then(async() => {
					const input = new InteractionCollector(this.interaction.client, { filter: m => m.user.id == this.interaction.user.id && m.message.id == msg.id })
					input.on('collect', async i => {
						if(!i.fields){
							input.stop()
						} else{
							let s = i.fields.getTextInputValue("move")
							const inp = s.split(" ")
							for(let coor in inp){
								const xy = this.get_coors(inp[coor])
								// console.log(xy)
								if(!xy){
									continue
								}
								const x = xy[0]
								const y = xy[1]
								if(m.customId=='reveal'){
									if(board[x][y] == '0'){
										vboard = this.reveal_zeros(x,y,vboard,board)
									}else if(board[x][y] == 'b'){
										Embed = new MessageEmbed()
											.setTitle("You lost!")
											.setDescription(`${this.format_board(this.reveal_all(vboard,board))}`)
											.setColor("Red")
										const opt = {content:"You lost! :pensive:", embeds: [Embed],components:[]}
										this.interaction.editReply(opt)
										collector.stop()
										end = true
										break
									} else {
										vboard[x][y] = board[x][y]
									}
								} else if(m.customId=='flag'){
									if(vboard[x][y]==' '){
										vboard[x][y] = 'f'
									}
								}
							}
							if(this.has_won(vboard,board)){
								const { embeds } = msg
								 Embed = new MessageEmbed()
									.setTitle("You won!")
									.setDescription(`${this.format_board(this.reveal_all(vboard,board))}`)
									.setColor(0x5865F2)
								const options = {content:'You won!! :tada:', embeds: [Embed], components:[] }
								if(!{ embeds } == options) i.update(options)
								collector.stop()
								input.stop()
							} else {
								i.update({embeds: [Embed.setTitle("Minesweeper").setDescription(`${this.format_board(vboard)}`)]})
								input.stop()
							}
							input.stop()
						}
					})
				})
			} else {
				m.reply({ content:'This is not your game', ephemeral:true })
			}
		})
	}
}
