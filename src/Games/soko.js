const {MessageButton,MessageEmbed,MessageActionRow, ComponentType} = require("discord.js")
module.exports = class Sokoban{
	constructor(interaction,options){
		this.interaction = interaction
		this.options = this.parse_options(options)
	}
	parse_options(options){
		return {'p': options.player || '😳', 'tp': options.playerOnTask || '😳', 't': options.task || '❎', 'b': options.box || '🟫', 'bt': options.boxOnTask || '✅'}
	}
    format_board(board){
        let lst = []
        const dct = this.options
        for(let i in board){
            lst.push(board[parseInt(i)].map(i=>dct[i] || i).join(''))
        }
        return lst.join("\n")
    }

	random(start,end=null){
		let lst = []
		if(end == null){
			end = start
			start = 0	
		}
		for(let i = start;i <= end;i++){
			lst.push(i)
		}
		return parseInt(lst[Math.floor(Math.random()*lst.length)])
	}

	create_board(){
		let board = []
		for(let e=0;e<=5;e++){
			board.push([' ',' ',' ',' ',' '])
		}
	
		let x = this.random(board.length-1)
		let y = this.random(board[0].length-1)
		board[x][y] = "p"
		const chars = ["t", "b"]
		for(let e=0;e<2;e++){
			for(let char in chars){
				char = parseInt(char)
				if(chars[char] == "b"){
					x = this.random(1, board.length-2)
					y = this.random(1, board[0].length-2)
				} else {
					x = this.random(board.length-1)
					y = this.random(board[0].length-1)
				}
				while(board[x][y] != " "){
					if (chars[char] == "b"){
						x = this.random(1, board.length-2)
						y = this.random(1, board[0].length-2)
					}else{
						x = this.random(board.length-1)
						y = this.random(board[0].length-1)
					}
				}
				board[x][y] = chars[char]
			}
		}
		return board
	}

	get_player(board){
		for(let [x, i] of board.entries()){
			for(const [y, thing] of i.entries()){
				if(thing == "p" || thing == "tp"){
					return [x, y]
				}
			}
		}		
	}

	has_won(board){
		for(let x in board){
			for(let y in board[x]){
				if (board[x][y] == "t" || board[x][y] == "tp"){
					return false
				}
			}
		}
		return true
	}

	create_disabled_button(){
    	const btn = new MessageButton()
		.setLabel("\u200b")
        .setStyle("Secondary")
        .setCustomId(JSON.stringify(Math.floor(Math.random()*100000)))
        .setDisabled(true)
        return btn
	}

	async start(){
		this.board = this.create_board()
		this.board_copy = JSON.parse(JSON.stringify(this.board))

		const directions = {'u':[-1,0],'l':[0,-1],'r':[0,1],'d':[1,0]}
		// const b_directions = {'u':[-2,0],'l':[0,-2],'r':[0,2],'d':[2,0]}
		const Embed = new MessageEmbed()
			.setTitle("Sokoban")
			.setDescription(this.format_board(this.board))
			.setColor("#0099ff")
			.setFooter({text: "Use the arrow keys to move"})

    	const up_btn = new MessageButton()
        .setStyle("Primary")
        .setCustomId('u')
        .setEmoji('⬆')
		const btns1 = [this.create_disabled_button(), up_btn, this.create_disabled_button()]

    	const left_btn = new MessageButton()
        .setStyle("Primary")
        .setCustomId('l')
        .setEmoji('⬅')
    	const reload = new MessageButton()
        .setStyle("Primary")
        .setCustomId("reload")
        .setEmoji('🔄')
    	const right_btn = new MessageButton()
        .setStyle("Primary")
        .setCustomId('r')
        .setEmoji('➡')
        const btns2 = [left_btn, reload, right_btn]

        const down_btn = new MessageButton()
        .setStyle("Primary")
        .setCustomId('d')
        .setEmoji('⬇')
        const btns3 = [this.create_disabled_button(), down_btn, this.create_disabled_button()]

    	const stop = new MessageButton()
        .setStyle("Danger")
        .setCustomId("stop")
        .setEmoji('⏹')
	    const btns4 = [stop]

	    const rows = [new MessageActionRow().addComponents(btns1), new MessageActionRow().addComponents(btns2), new MessageActionRow().addComponents(btns3), new MessageActionRow().addComponents(btns4)]

		this.interaction.reply({ embeds: [Embed], components: rows})
		const msg = await this.interaction.fetchReply()
		const input = msg.createMessageComponentCollector({filter: m => m.user.id == this.interaction.user.id ,componentType: ComponentType.Button, time: 600_000} )
		input.on("collect", async (btn) => {
			if(btn.customId=='reload'){
				this.board = JSON.parse(JSON.stringify(this.board_copy))
				// this.board_copy = JSON.parse(JSON.stringify(this.board))
				const embed = new MessageEmbed()
				.setTitle("Sokoban")
				.setDescription(this.format_board(this.board))
				.setColor("#0099ff")
				.setFooter({text: "Use the arrow keys to move"})
				btn.update({ content: '', embeds: [embed] })
			} else if (btn.customId=='stop'){
				const embed = new MessageEmbed()
				.setTitle("Game ended")
				.setDescription(this.format_board(this.board))
				.setColor("#0099ff")
				.setFooter({text: "Use the arrow keys to move"})
				btn.update({ content: '', embeds: [embed] })
				input.stop()
			} else {
				const direction = directions[btn.customId]
				const p_index = this.get_player(this.board)
				const p_x = p_index[0]
				const p_y = p_index[1]
				if(!(p_x+direction[0] < 0 || p_x+direction[0] >= this.board.length || p_y+direction[1] < 0 || p_y+direction[1] >= this.board[0].length)){
					const n_index = [p_x+direction[0],p_y+direction[1]]
					const item = this.board[n_index[0]][n_index[1]]
					if(item == " "){
						if(this.board[p_x][p_y]=='tp'){
							this.board[p_x][p_y] = 't'
						} else{
							this.board[p_x][p_y] = ' '
						}
						this.board[n_index[0]][n_index[1]] = 'p'
					} else if(item[0] == 'b'){
						const b_direction = [direction[0]*2, direction[1]*2]
						if(!(p_x+b_direction[0] < 0 || p_x+b_direction[0] >= this.board.length || p_y+b_direction[1] < 0 || p_y+b_direction[1] >= this.board[0].length)){
							const b_index = [p_x+b_direction[0],p_y+b_direction[1]]
							if(this.board[p_x][p_y]=='tp'){
								this.board[p_x][p_y] = 't'
							} else{
								this.board[p_x][p_y] = ' '
							}
							if(this.board[n_index[0]][n_index[1]]=='bt'){
								this.board[n_index[0]][n_index[1]] = 'tp'
							} else {
								this.board[n_index[0]][n_index[1]] = 'p'
							}
							if(this.board[b_index[0]][b_index[1]]=='t'){
								this.board[b_index[0]][b_index[1]] = 'bt'
							} else {
								this.board[b_index[0]][b_index[1]] = 'b'
							}
						}
					} else if(item=='t'){
						this.board[p_x][p_y] = ' '
						this.board[n_index[0]][n_index[1]] = 'tp'
					}
					if(this.has_won(this.board)){
						this.board = this.create_board()
						this.board_copy = JSON.parse(JSON.stringify(this.board))
						const embed = new MessageEmbed()
						.setTitle("Sokoban")
						.setDescription(this.format_board(this.board))
						.setColor("#0099ff")
						.setFooter({text: "Use the arrow keys to move"})
						btn.update({ content: 'You won!', embeds: [embed] })
					} else {
						const embed = new MessageEmbed()
						.setTitle("Sokoban")
						.setDescription(this.format_board(this.board))
						.setColor("#0099ff")
						.setFooter({text: "Use the arrow keys to move"})
						btn.update({ content: '', embeds: [embed] })
					}
				}
			}
		})
	}
}
