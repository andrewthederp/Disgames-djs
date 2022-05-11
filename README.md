# Disgames.js
Disgames is an easy-to-use fully customizable npm package made to allow you to easily add games to your discord.js bot!

NOTE: This package requires discord.js v14. To install v14, run `npm i discord.js@dev` or `yarn add discord.js@dev`

---

## Contents

- [Disgames-js](#disgames)
  - [Contents](#contents)
  - [Installation](#installation)
  - [Example](#example)
  - [Documentation](#documentation)

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

const client = new Discord.Client({ intents: ['Guilds', 'GuildMessages', 'MessageContent'] })

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
new disgames.Akinator(interaction,{false,'region'}).start()
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
new disgames.Madlibs(interaction,5,25).start()
```

### Minesweeper
The Minesweeper constructor takes two parameters. `Interaction` (required) and `chance` (default:`.17`). `chance` determines the amount of bombs that will be on the board, `.17` does not necessarily mean that there will be 17 bombs.

```js
new disgames.Minesweeper(interaction,.17).start()
```
