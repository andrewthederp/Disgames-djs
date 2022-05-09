const { Aki } = require("aki-api")
const {ButtonBuilder,EmbedBuilder,ActionRowBuilder} = require("discord.js")
module.exports = class Akinator{
    constructor(interaction,options){
        if(!interaction) throw new TypeError("Interaction missing")
        if(!options) options = {}
        if(!options.region) options.region = "people"
        if(!options.childMode) options.childMode = false
        this.interaction = interaction
        this.region = options.region
        this.childMode = options.childMode
    }
    async start(){
        const regions = {"people": "en", "animals": "en_animals", "objects": "en_objects"};
        const region = regions[this.region.toLowerCase()]
        console.log(this.region)
        const {childMode} = this
        const proxy = undefined
        const aki = new Aki({region, proxy,childMode})
        const {interaction: int} = this
        int.deferReply()
        
        let i = 0
        await aki.start()
        this.game(aki, int,i)
    }
    async game(aki, int,i){
        try{
        i++
        const Embed = new EmbedBuilder().setTitle(`Question ${i}`).setDescription(aki.question).setColor(0x7289da).setFooter({text:`Progress: ${aki.progress}`})
        const buttons = []
        aki.answers.forEach(answer => {
            const answers = {"yes": "0","no": "1", "idk": "2","don't know": "2", "probably": "3", "probably not": "ik"};
            buttons.push(new ButtonBuilder().setLabel(answer).setStyle("Primary").setCustomId(answers[answer.toLowerCase()]))
        })
        const actionRow = new ActionRowBuilder().addComponents(buttons)
        int.editReply({embeds: [Embed],components: [actionRow]})
        const message = await int.fetchReply()
        const collector = message.createMessageComponentCollector(m => m.user.id === int.user.id,{time: 60000})
        collector.on("collect", async m => {
            console.log({int: int.user.id,m: m.user.id})
            if(m.user.id !== int.user.id) return
            m.deferUpdate()
            const answer = parseInt(m.component.customId)
            await aki.step(answer)
            if(aki.progress >= 70 || aki.currentStep >= 80){
                await aki.win()
                const guess = aki.answers[0]
                if(guess){
                    Embed.setTitle(guess.name)
                    Embed.setDescription(guess.description)
                    Embed.setImage(guess.absolute_picture_path)

                }else{
                    Embed.setTitle("You win!")
                    Embed.setDescription("I couldn't guess the answer, play again?")
                }
                int.editReply({embeds: [Embed],components: []})
            }else this.game(aki, int,i)
            collector.stop()
        })
    }catch(e){
        console.error(e.stack)
    }
    }
}
/*
const prompt = require("prompt-sync")();
const { Aki } = require("aki-api");

let childMode;
let region;
const proxy = undefined;
const run = async() => {
    console.log("Choose a region: \"PEOPLE\" | \"ANIMALS\" | \"OBJECTS\"");
    const input = prompt(">> ");
    if(!input) return process.exit();
    const regions = {"people": "en", "animals": "en_animals", "objects": "en_objects"};
    region = regions[input.toLowerCase()];
    if(!region) region = "en"
    console.log("Choose a mode: \"child\" | \"adult\"");
    const input2 = prompt(">> ");
    if(!input2) return process.exit();  
    childMode = input2.toLowerCase() == "child";
    if(!childMode) childMode = false;

    console.log("Please wait");
    const aki = new Aki({region, childMode, proxy});
    console.clear();
    console.log("Please wait.");
    setTimeout(() => {
        console.clear();
        console.log("Please wait..");
        setTimeout(() => {
            console.clear()
            console.log("Please wait...");
        },1000)
    },1000)
    await aki.start();
    console.clear();
    i = 1;
    while (true) {
    console.log(`QUESTION ${i}: ${aki.question}\n[${aki.answers.join(",")}]\n`);
    i++;
    const inp = prompt(`>> `);
    if(!inp) break;
    const answers = {"yes": 0,"no": 1, "idk": 2,"don't know": 2, "probably": 3, "probably not": 4};;
    if(["yes","no","idk","don't know","probably","probably not"].includes(inp.toLowerCase())){
        await aki.step(answers[inp.toLowerCase()]);
        if (aki.progress >= 70 || aki.currentStep >= 78) {
            await aki.win();
            const guess = aki.answers[0]
            console.log(`My guess:\n${guess.name}\n\n${guess.description}\n\n${guess.absolute_picture_path}`);
 
            break;
        }
        console.log(`Progress: ${aki.progress}%`);
    }else{
        console.log("Invalid input");
        break;
    }

    }
}
run().catch(console.error)
**/