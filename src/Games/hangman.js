const {MessageEmbed, MessageButton, Modal, TextInputComponent, MessageActionRow, TextInputStyle, InteractionCollector,ComponentType} = require("discord.js")
const {readFileSync} = require("fs")
const {resolve} = require("path")
const numbers = new RegExp(/^[0-9]+$/)
const symbols = new RegExp(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)

module.exports = class Hangman{
	constructor(interaction,options){
		if(!interaction) throw new TypeError("Interaction missing")
		let {min,max} = options

		const word = options.word
		if(!min) min = 3
		if(!max) max = 7
		this.interaction = interaction
		if(word){
			this.word = word
		}
		if(min>max){
			min = 3
			max = 7
		} else {
			if(min<=0) min = 3
			if(max>10) max = 7
			const words = readFileSync(resolve(__dirname,"words.txt"),{encoding:'utf8', flag:'r'}).split("\n").filter(w => w.length >= min && w.length <= max && !numbers.test(w) && !symbols.test(w)).map(w => w.replace("\r","")).map(w => w.toLowerCase())
			this.word = words[Math.floor(Math.random()*words.length)]
			if(!this.word){
				return {  start(){ interaction.reply("I'm sorry, a word with those limits don't exist") }}
			}
		}
		this.revealed_word = []
		for(let i = 0;i<this.word.length;i++){this.revealed_word.push("🟦")}
		this.fails = 0
		this.guesses = []
	}

	make_hangman() {
		let head
		let torso
		let left_arm
		let right_arm
		let left_leg
		let right_leg
		if (this.fails > 0) head = "()"; else head =" ";
		if (this.fails > 1) torso = "||"; else torso =" ";
		if (this.fails > 2) left_arm = "/"; else left_arm =" ";
		if (this.fails > 3) right_arm = "\\"; else right_arm =" ";
		if (this.fails > 4) left_leg = "/"; else left_leg =" ";
		if (this.fails > 5) right_leg = "\\"; else right_leg =" ";
		return `\`\`\`\n ${head}\n${left_arm}${torso}${right_arm}\n ${left_leg}${right_leg}\n\`\`\``
	}

	make_embed(title='Hangman'){
		let templst = [...new Set(this.guesses)]
		const Embed = new MessageEmbed()
		.setTitle(title)
		.setDescription(`${this.make_hangman()}`)
		.addFields([{name:"Word",value:`${this.revealed_word.join("  ")}`},{name:"Guesses",value:`[${templst.map(i=>`:regional_indicator_${i}:`).join(' ')}]`}])
		.setColor(0x5865F2)
		if(title == 'You lost!'){
			Embed.setFields(
				[
					{name:"Word",value:`${this.word.split("").map(i=>`:regional_indicator_${i}:`).join(' ')}`},
					{name:"Guesses",value:`[${templst.map(i=>`:regional_indicator_${i}:`).join(' ')}]`}
				]
			)
			.setColor("RED")
		}else if(title == 'You won!'){
			Embed.setFields(
				[
					{name:"Word",value:`${this.word.split("").map(i=>`:regional_indicator_${i}:`).join(' ')}`},
					{name:"Guesses",value:`[${templst.map(i=>`:regional_indicator_${i}:`).join(' ')}]`}
				]
			)
			.setColor("GREEN")
		} else if(title=='Game ended'){
			Embed.setFields(
				[
				{name:"Word",value:`${this.word.split("").map(i=>`:regional_indicator_${i}:`).join(' ')}`},
				{name:"Guesses",value:`[${templst.map(i=>`:regional_indicator_${i}:`).join(' ')}]`}
				]
			)
			.setColor("RED")
		}
		return Embed
	}


	async start(){
		const modal = new Modal()
		.setCustomId("hangman")
		.setTitle("Hangman")
		const text = new TextInputComponent()
		.setStyle("SHORT")
		.setLabel(`Your guess`)
		.setCustomId(`guess`)
		const act = new MessageActionRow().addComponents([text]);
		modal.addComponents([act])

		const button = new MessageButton()
		.setLabel("click to guess")
		.setStyle("PRIMARY")
		.setCustomId("click")

		const stop = new MessageButton()
		.setLabel("STOP")
		.setStyle("DANGER")
		.setCustomId("stop")

		let Embed = this.make_embed()
		const row = [new MessageActionRow().addComponents([button, stop])]
		await this.interaction.reply({embeds: [Embed],components: row})

		const msg = await this.interaction.fetchReply()
		const collector = msg.createMessageComponentCollector({ time: 600_000} )

		collector.on("collect",async btn => {
			if(btn.user.id == this.interaction.user.id){
				if(btn.customId=='stop'){
					collector.stop()
					Embed = this.make_embed('Game ended')
					btn.update({ content:'Hangman ended', embeds: [Embed], components:[] })
					return
				} else if(btn.customId=='click'){
					btn.showModal(modal).then(async() =>{
						const input = new InteractionCollector(this.interaction.client,{filter: f => f.user.id == this.interaction.user.id})
						input.on('collect', async b => {
							if(!b.fields){
								input.stop()
							} else {
								const guess = b.fields?.getTextInputValue("guess").toLowerCase()
								if(!numbers.test(guess) && !symbols.test(guess)){
									if(guess.length>1){
										if(guess==this.word){
											Embed = this.make_embed('You won!')
											b.update({ embeds: [Embed], components:[] })
											collector.stop()
											input.stop()
										} else {
											this.fails += 1
											if(this.fails==6) {
												Embed = this.make_embed('You lost!')
												b.update({  embeds: [Embed], components:[] })
												collector.stop()
												input.stop()
											}
										}
									} else {
										let worked = false
										this.guesses.push(guess)
										for(const i in this.word) {
											if(this.word[i] == guess) {
												this.revealed_word[i] = `:regional_indicator_${guess}:`
												worked = true
											}
										}
										if(!worked) {
											this.fails += 1
											if(this.fails==6) {
												Embed = this.make_embed('You lost!')
												b.update({ embeds: [Embed], components:[] })
												collector.stop()
												input.stop()
											}else{
												b.update({embeds: [this.make_embed()]})
											}

										}else{
											if(this.revealed_word.includes("🟦")){
												this.guesses.push(guess)
												Embed = this.make_embed('Hangman')
												b.update({  embeds: [Embed]})
												input.stop()
											} else {
												Embed = this.make_embed('You won!')
												b.update({ embeds: [Embed], components:[] })
												collector.stop()
												input.stop()
											}
										}
									}
								} else {
									b.reply({ content:"The word cannot contain numbers/symbols", ephemeral:true })
									input.stop()
								}
							}
						})
					})
				}
			} else {
				btn.reply({ content:"this is not your game", ephemeral:true })
			}
		})
	}
}
