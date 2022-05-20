const { Interaction, MessageButton, MessageActionRow} = require('discord.js');

module.exports = class TicTacToe{
	/**
	 * @name TicTacToe
	 * @kind constructor
	 * @param {Interaction} interaction
	 * @param {User} opponent
	 */

	constructor(int,opponent){
		this.interaction = int
		if(!int || !opponent) throw new TypeError("Interaction or Opponent missing")
		let board = []
		for(let i=0;i<3;i++){
			board.push(['','',''])
		}
		this.board = board
		this.turn = 'x'
		this.conversion = {'x':'DANGER', 'o':'SUCCESS','':'SECONDARY'}
		this.author = this.interaction.user
		this.member = opponent
		this.turns = {'x':this.author, 'o':this.member}
	}

	make_buttons(){
		let buttons = []
		for (let x=0;x<3;x++) {
			let temp_lst = []
			for(let y=0;y<3;y++){
				let btn=new MessageButton()
				.setCustomId(JSON.stringify(x)+JSON.stringify(y))
				.setStyle(this.conversion[this.board[x][y]])
				.setLabel('\u200b')
				if(this.board[x][y]!=''){
					btn.setDisabled(true)
				}
				temp_lst.push(btn)
			}
			buttons.push(new MessageActionRow().addComponents(temp_lst))
		}
		return buttons
	}


	has_won(){
		const BLANK = ''
		const board = this.board
		for (let i=0;i<3;i++){

			if ((board[i][0] == board[i][1] && board[i][1] == board[i][2]) && board[i][0] != BLANK){
				return true
			}

			if ((board[0][i] == board[1][i] && board[1][i] == board[2][i]) && board[0][i] != BLANK){
				return true
			}
		}

		if ((board[0][0] == board[1][1] && board[1][1] == board[2][2]) && board[0][0] != BLANK){
			return true
		}

		if ((board[0][2] == board[1][1] && board[1][1] == board[2][0]) && board[0][2] != BLANK){
			return true
		}

		for(const x in board){
			for(const y in board[x]){
				if (board[x][y] == BLANK){
					return undefined
				}
			}
		}

		return false
	}

	async start(){
		let buttons = this.make_buttons()
		// const duel = new Set()
		// if(duel.has(this.author)){
		// 	return this.interaction.reply("You are already in a duel")
		// }else if(duel.has(this.member)){
		// 	return this.interaction.reply("Your opponent is already in a duel")
		// }

		// if (this.member.bot) {
		// 	return this.interaction.reply("You can't duel bots.")
		// } else if (member.id === this.author.id){
		// 	return this.interaction.reply("You can't duel yourself.")
		// }

		this.interaction.reply({
			content: 'Turn: '+this.turns[this.turn].toString(),
			components: buttons
		})

		// duel.add(this.author)
		// duel.add(this.member)
		const msg = await this.interaction.fetchReply()
		const filter = (i) => i.isButton() && i.user && (i.user.id == this.author.id || i.user.id == this.member.id)
		const collector = msg.createMessageComponentCollector({ filter, time: 600_000})

		collector.on("collect",async(btn)=>{
			// await btn.deferUpdate()
			if(btn.user.id!=this.turns[this.turn].id){
				btn.reply({content:'It\'s not your turn', ephemeral:true })
			} else {
				const x = btn.customId[0]
				const y = btn.customId[1]
				this.board[x][y] = this.turn
				let buttons = this.make_buttons()
				const win = this.has_won()
				if(win){
					await btn.update({content:`Winner: ${this.turns[this.turn].toString()} (${this.turn})` , components:buttons})
					collector.stop()
				} else if(win==false){
					await btn.update({content:'Tie!', components:buttons})
					collector.stop()
				} else {
					if(this.turn=='x'){
						this.turn = 'o'
					}else{
						this.turn = 'x'
					}
					await btn.update({content:'Turn: '+this.turns[this.turn].toString(), components:buttons})
				}
			}
		})

	}

}


