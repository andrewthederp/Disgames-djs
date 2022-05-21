# Disgames.js
Disgames is an easy-to-use fully customizable npm package made to allow you to easily add games to your discord.js bot!

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
npm i andrewthederp/Disgames-djs
```

## Example 
```js
const Discord = require("discord.js")
const Disgames = require("disgames-js")

const client = new Discord.Client({ intents: ['GUILDS'] })

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return
	new Disgames.TicTacToe(interaction, await client.users.fetch(interaction.options.get("opponent",true).value)).start()
})

client.login('token')
```

## Documentation
### Akinator
The Akinator constructor takes two parameters. `Interaction` (required) and `options` (default:`{childMode: false,region: 'people'}`). `options` is expected to be an `Object` containing `childMode` (default:`false`) and `region` (default:`'people'`) `region` may be any of "people"/"animals"/"objects".

```js
new Disgames.Akinator(interaction,{
  childMode: false,
  region: 'region'
  }).start()
```

### Checkers
The Checkers constructor takes two parameters. `Interaction` (required) and `opponent` (required). `opponent` is expected to be a `User object`.

```js
new Disgames.Checkers(interaction,await client.users.fetch(interaction.options.get("opponent",true).value).start()
```

### Chess
The Chess constructor takes two parameters. `Interaction` (required) and `opponent` (required). `opponent` is expected to be a `User object`.

```js
new Disgames.Chess(interaction,await client.users.fetch(interaction.options.get("opponent",true).value).start()
```

### Hangman
The Hangman constructor takes two parameters. `Interaction` (required) and `options` (default:`{min: 3, max: 7, word:undefined}`). `options` is expected to be an `Object` containing `min` (default:`3`) and `max` (default:`7`) and `word`  (default:`undefined`)
if a word is provided it will be used regardless of whether a min/max was provided or not.

```js
new Disgames.Hangman(interaction,{min:3, max:7, word:undefined}).start()
```

### Madlibs
The Madlibs constructor takes three parameters. `Interaction` (required) and `min` (default:`5`) and `max` (default:`25`).

```js
new Disgames.Madlibs(interaction,5,25).start()
```

### Minesweeper
The Minesweeper constructor takes two parameters. `Interaction` (required) and `chance` (default:`.17`). `chance` determines the amount of bombs that will be on the board, `.17` does not necessarily mean that there will be 17 bombs.

```js
new Disgames.Minesweeper(interaction,.17).start()
```
