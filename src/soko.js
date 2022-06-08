const prompt = require('prompt-sync')();

function format_board(board){
	let lst = []
	for(i in board){
		lst.push(board[parseInt(i)].join(''))
	}
	return lst.join("\n")
}

function random(start, end=null){
	let lst = []
	if(end==null){
		end=start
		start=0
	}
	for(i=start;i<=end;i++){
		lst.push(i)
	}
	return parseInt(lst[Math.floor(Math.random()*lst.length)])
}

function create_board(){
	let board = []
	for(e=0;e<=5;e++){
		board.push([' ',' ',' ',' ',' '])
	}

	x = random(board.length-1)
	y = random(board[0].length-1)
	board[x][y] = "p"
	const chars = ["t", "b"]
	for(e=0;e<2;e++){
		for(char in chars){
			char = parseInt(char)
			if(chars[char] == "b"){
				x = random(1, board.length-2)
				y = random(1, board[0].length-2)
			} else {
				x = random(board.length-1)
				y = random(board[0].length-1)
			}
			while(board[x][y] != " "){
				if (chars[char] == "b"){
					x = random(1, board.length-2)
					y = random(1, board[0].length-2)
				}else{
					x = random(board.length-1)
					y = random(board[0].length-1)
				}
			}
			board[x][y] = chars[char]
		}
	}
	return board
}


function get_player(board){
	for(let [x, i] of board.entries()){
		for(const [y, thing] of i.entries()){
			if(thing == "p" || thing == "tp"){
				return [x, y]
			}
		}
	}
}


function has_won(board){
	for(x in board){
		for(y in board[x]){
			if (board[x][y] == "t" || board[x][y] == "tp"){
				console.log(board[x][y])
				return false
			}
		}
	}
	return true
}

let board = create_board()
const directions = {'u':[-1,0],'l':[0,-1],'r':[0,1],'d':[1,0]}
const b_directions = {'u':[-2,0],'l':[0,-2],'r':[0,2],'d':[2,0]}

while(true){
	console.clear()
	console.log(format_board(board))
	const inp = prompt('>> ')
	if(!inp) break
	direction = directions[inp]
	if (inp == 'exit'){
		break
	} else if(direction == undefined){
		continue
	}
	const p_index = get_player(board)
	const p_x = p_index[0]
	const p_y = p_index[1]
	if(p_x+direction[0] < 0 || p_x+direction[0] == board.length){
		continue
	} else if (p_y+direction[1] < 0 || p_y+direction[1] == board[0].length){
		continue
	}
	const n_index = [p_x+direction[0],p_y+direction[1]]
	const item = board[n_index[0]][n_index[1]]
	if (item==' '){
		if(board[p_x][p_y]=='tp'){
			board[p_x][p_y] = 't'
		} else{
			board[p_x][p_y] = ' '
		}
		board[n_index[0]][n_index[1]] = 'p'
	} else if (item=='b'){
		const b_direction = b_directions[inp]
		if(p_x+b_direction[0] < 0 || p_x+b_direction[0] == board.length){
			continue
		} else if (p_y+b_direction[1] < 0 || p_y+b_direction[1] == board[0].length){
			continue
		}
		const b_index = [p_x+b_direction[0],p_y+b_direction[1]]
		board[p_x][p_y] = ' '
		board[n_index[0]][n_index[1]] = 'p'
		board[b_index[0]][b_index[1]] = 'b'
		if(has_won(board)){
			console.log('You win!')
			break
		}
	} else if(item=='t'){
		board[p_x][p_y] = ' '
		board[n_index[0]][n_index[1]] = 'tp'
	}
}