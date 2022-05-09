const {EmbedBuilder, ButtonBuilder, ActionRowBuilder} = require("discord.js")

class SnakeGame{
	constructor(board){
		this.length = 1
		this.snake =  [[Math.floor(board.length/2), Math.floor(board[0].length/2)]]
		this.board = board
		this.make_apple()
	}

	include(lst, thing){
		for(const i in lst){
			const item = lst[i]
			if(item[0] == thing[0] && item[1] == thing[1]){
				return true
			}
		}
		return false
	}

	has_won(){
		return this.length == 100
	}

	get_head_position(){
		return this.snake[0]
	}

	point(pt){
		if (this.length > 1 && pt[0] * -1 == this.direction[0] && pt[1] * -1 == this.direction[1]){
			null
		} else {
		    this.direction = pt
		}
	}

	move(){
		const cur = this.get_head_position()
		let x = this.direction[0]
		let y = this.direction[1]
		let new_ = [cur[0]+x, cur[1]+y]
		if (this.snake.length > 2 && this.include(this.snake.slice(2), new_)){
			return true
		}
		if(new_[0] >= this.board.length){
			new_[0] = 0
		}else if (new_[0] == -1){
			new_[0] = this.board.length-1
		}
		if (new_[1] >= this.board[0].length){
			new_[1] = 0
		}else if (new_[1] == -1){
			new_[1] = this.board[0].length-1
		}
		if (new_[0] == this.apple[0] && new_[1] == this.apple[1]){
			this.board[this.apple[0]][this.apple[1]] = ' '
			this.make_apple()
			this.length += 1
		}
		this.snake.splice(0, 0, new_)
		if (this.snake.length > this.length){
			this.snake.pop()
		}
	}

	get_board(){
		let board = []
		for(let i=0;i<=10;i++){
			board.push([' ',' ',' ',' ',' ',' ',' ',' ',' ',' '])
		}
		for (const x in this.snake){
			const row = this.snake[x]
			board[row[0]][row[1]] = 's'
		}
		board[this.apple[0]][this.apple[1]] = 'a'
		return board
	}

	make_apple(){
		while(true){
			let x = Math.floor(Math.random()*this.board.length)
			let y = Math.floor(Math.random()*this.board[0].length)
			if(!this.include(this.snake, [x,y])){
				this.board[x][y] = 'a'
				this.apple = [x, y]
				break
			}
		}
	}

}


module.exports = class Snake{
    constructor(interaction){
        if(!interaction) throw new TypeError("Interaction missing")
		this.interaction = interaction
		this.board = []
		for(let i=0;i<=10;i++){
			this.board.push([' ',' ',' ',' ',' ',' ',' ',' ',' ',' '])
		}
		this.UP    = [-1, 0]
		this.DOWN  = [1, 0]
		this.LEFT  = [0, -1]
		this.RIGHT = [0, 1]

		this.directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]

		this.conversion = {'l':this.LEFT, 'u':this.UP, 'r':this.RIGHT, 'd':this.DOWN}

		this.s = new SnakeGame(this.board)
		this.s.point(this.directions[Math.floor(Math.random()*this.directions.length)])
    }

	format_board(board, snake_head){
		let lst = []
		const dct = {'a':'🍎', 'S':'😳', 's':'🟡', ' ':'⬛'}
		for (const x in board){
			let scn_lst = []
			const row = board[x]
			for (const y in row){
				const column = board[x][y]
				if (x == snake_head[0] && y == snake_head[1]){
					scn_lst.push("😳")
				}else{
					scn_lst.push(dct[column])
				}
			}
			lst.push(scn_lst.join(''))
		}
		return lst.join('\n')
	}

	create_disabled_button(){
    	const btn = new ButtonBuilder()
		.setLabel("\u200b")
        .setStyle("Secondary")
        .setCustomId(JSON.stringify(Math.floor(Math.random()*100000)))
        .setDisabled(true)
        return btn
	}

	move(self){
		const { s } = self
		const lost = self.s.move()
		let desc = self.format_board(s.get_board(), s.get_head_position())
		let title = 'Snake'
		if (lost){
			clearInterval(self.int)
			desc = this.format_board(s.get_board(), s.get_head_position())+'\n\nYour snake bit itself!'
			title = 'You lost'
		}else if (this.s.has_won()){
			clearInterval(self.int)
			desc = this.format_board(s.get_board(), s.get_head_position())+'\n\nYou won!!!'
			title = 'You won'
		}

		const Embed = new EmbedBuilder()
			.setTitle(title)
			.setDescription(desc)
			.setColor(0x5865F2)
		if(this.m && !this.m.repl){
			this.m.update({ embeds: [Embed], components: this.rows})
			this.m.repl = true
		}else{
			if(self.interaction.replied) self.interaction.editReply({ embeds:[Embed], components:this.rows })
			else self.interaction.reply({ embeds: [Embed], components: this.rows})
		}

	}

	async start(){
    	const up_btn = new ButtonBuilder()
        .setStyle("Primary")
        .setCustomId('u')
        .setEmoji('⬆')
		const btns1 = [this.create_disabled_button(), up_btn, this.create_disabled_button()]

    	const left_btn = new ButtonBuilder()
        .setStyle("Primary")
        .setCustomId('l')
        .setEmoji('⬅')
    	const stop = new ButtonBuilder()
        .setStyle("Danger")
        .setCustomId("stop")
        .setEmoji('⏹')
    	const right_btn = new ButtonBuilder()
        .setStyle("Primary")
        .setCustomId('r')
        .setEmoji('➡')
        const btns2 = [left_btn, stop, right_btn]

        const down_btn = new ButtonBuilder()
        .setStyle("Primary")
        .setCustomId('d')
        .setEmoji('⬇')
        const btns3 = [this.create_disabled_button(), down_btn, this.create_disabled_button()]

		this.rows = [new ActionRowBuilder().addComponents(btns1), new ActionRowBuilder().addComponents(btns2), new ActionRowBuilder().addComponents(btns3)]

		const Embed = new EmbedBuilder()
			.setTitle("Snake")
			.setDescription(this.format_board(this.s.get_board(), this.s.get_head_position()))
			.setColor(0x5865F2)
		const self = this
		function sf(){
			self.move(self)
		}
		this.interaction.reply({embeds:[Embed], components:this.rows})
		this.int = setInterval(sf, 1.9*1000)
		const msg = await this.interaction.fetchReply()
		const collector = msg.createMessageComponentCollector({ filter: m => m.user.id == this.interaction.user.id && m.message.id == msg.id})
		collector.on('collect', async m => {
			if(m.customId=='stop'){
				const Embed = new EmbedBuilder()
					.setTitle("Game ended")
					.setDescription(this.format_board(this.s.get_board(), this.s.get_head_position()))
					.setColor(0x5865F2)
				m.update({ embeds:[Embed], components:[] })
				collector.stop()
				return
			}
			const c = this.conversion[m.customId]
			this.m = m
			this.s.point(c)
		})
	}
}
