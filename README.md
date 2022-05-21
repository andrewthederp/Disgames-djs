disgames is an easy-to-use fully customizable npm package made to allow you to easily add games to your discord.js bot!

---

## Contents

- [Disgames-js](#disgames)
  - [Contents](#contents)
  - [Installation](#installation)
  - [Example](#example)
  - [Documentation](#documentation)
  - [Discord](#discord)

## Installation
```sh
npm i disgames-js
```

To install the development version, you need [git](https://git-scm.com/downloads) installed. After installing it, run

```shell
npm i npm i andrewthederp/Disgames-djs
```

## Example 
```js
const Discord = require("discord.js")
const disgames = require("disgames-js")

const client = new Discord.Client({ intents: ['GUIlDS'] })

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return
  new disgames.TicTacToe(interaction, await client.users.fetch(interaction.options.get("opponent",true).value)).start()
})

client.login('token')
```

## Documentation
### Akinator
The Akinator constructor takes two parameters. `Interaction` (required) and `options` (default:`{childMode: false,region: 'people'}`). `options` is expected to be an `Object` containing `childMode` (default:`false`) and `region` (default:`'people'`) `region` may be any of "people"/"animals"/"objects".

```js
new disgames.Akinator(interaction,{
  childMode: false,
  region: 'region'
}).start()
```

### Checkers
The Checkers constructor takes two parameters. `Interaction` (required) and `opponent` (required). `opponent` is expected to be a `User object`.

```js
new disgames.Checkers(interaction,await client.users.fetch(interaction.options.get("opponent",true).value).start()
```

### Chess
The Chess constructor takes two parameters. `Interaction` (required) and `opponent` (required). `opponent` is expected to be a `User object`.

```js
new disgames.Chess(interaction,await client.users.fetch(interaction.options.get("opponent",true).value).start()
```

### Hangman
The Hangman constructor takes two parameters. `Interaction` (required) and `options` (default:`{min: 3, max: 7, word:undefined}`). `options` is expected to be an `Object` containing `min` (default:`3`) and `max` (default:`7`) and `word`  (default:`undefined`)
if a word is provided it will be used regardless of whether a min/max was provided or not.

```js
new disgames.Hangman(interaction,{min:3, max:7, word:undefined}).start()
```

### Madlibs
The Madlibs constructor takes three parameters. `Interaction` (required) and `min` (default:`5`) and `max` (default:`25`).

```js
new disgames.Madlibs(interaction,{min: 5,max: 25}).start()
```

### Minesweeper
The Minesweeper constructor takes two parameters. `Interaction` (required) and `chance` (default:`.17`). `chance` determines the amount of bombs that will be on the board, `.17` does not necessarily mean that there will be 17 bombs.

```js
new disgames.Minesweeper(interaction,.17).start()
```

### RussianRoulette
The RussianRoulette constructor takes two parameters. `Interaction` (required) and `opponent` (required).

```js
new disgames.Roulette(interaction,await client.users.fetch(interaction.options.get("opponent",true).value).start()
```

### RPS
The RPS constructor takes two parameters. `Interaction` (required) and `opponent` (default: `undefined`). If no opponent is passed then the player plays against the bot.

```js
new disgames.RockPaperScissors(interaction,await client.users.fetch(interaction.options.get("opponent",true).value).start()
```

### Snake
The Snake constructor takes one parameter. `Interaction` (required).

```js
new disgames.Snake(interaction).start()
```

### Sokoban
The Sokoban constructor takes two parameters. `Interaction` (required) and `options` (default: `{player:'😳','playerOnTask':'😳',task:'❎',box:'🟫',boxOnTask:'✅'}`). `options` will be used to format the board.

```js
new disgames.Sokoban(interaction).start()
```

### TicTacToe
The TicTacToe constructor takes two parameters. `Interaction` (required) and `opponent` (required).

```js
new disgames.TicTacToe(interaction, await client.users.fetch(interaction.options.get("opponent",true).value).start()
```

### Wordle
The Wordle constructor takes two parameters. `Interaction` (required) and `player` (required) and `word` (default:a random word from words.txt).

```js
new disgames.Wordle(interaction, interaction.user, 'hello').start()
```

## Discord
[Need help? join our discord server!](https://discord.gg/muujuynu3C)
