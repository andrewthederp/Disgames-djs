import {Interaction,User,MessageActionRow, MessageEmbed, MessageButton} from "discord.js"
import {Chess as Chess1} from "chess.js"
import {Aki as Aki} from "aki-api"
interface AkiOptions{
    childMode?: boolean
    region?: "PEOPLE" | "ANIMALS" | "OBJECTS"
}
type xy = string | number
export class RockPaperScissors{
    constructor(interaction: Interaction, opponent?: User);
    private make_buttons(): MessageActionRow[];
    private has_won(): boolean;
    start(): Promise<void>;
}
export class TicTacToe{
    constructor(interaction: Interaction, opponent: User);
    start(): Promise<void>;
}
export class Chess{
    constructor(interaction: Interaction,opponent: User)
    private createBoard(chess: typeof Chess1): MessageEmbed;
    start(): Promise<void>;
}
export class Akinator{
    constructor(interaction: Interaction, options?: AkiOptions);
    start(): Promise<void>;
    private game(aki: Aki,int: Interaction,i: number): Promise<void>;
}
export class Minesweeper{
    constructor(interaction: Interaction,chance?: number);
    private format_board(board: string[]): string[]
    private make_board(): string[][];
    private get_neighbours(x: string,y: string): string[]
    private reveal_zeros(x: string,y: string, vboard: string[],board:string[]): string[]
    private reveal_all(vboard: string[],board:string[]): string[]
    private get_bombs(board: string[]): string[][]
    private get_coors(coordinate: string): string[]
    private has_won(vboard: string[],board: string[]): boolean
    start(): Promise<void>;
}
export class Madlibs{
    constructor(interaction: Interaction,options?: {min: number,max: number});
    start(): Promise<void>;
}
export class Checkers{
    constructor(interaction: Interaction, opponent: User);
    private format_board(board: string[]): string[]
    private has_won(): " " | "r" | "b"
    private get_coors(coordinate: string): xy[]
    private convert_to_coors(x_: xy,y_: xy): xy[]
    private valid_moves(e: xy, i: xy): string[]
    private moves(): string[]
    start(): Promise<void>;
}
export class Snake{
    constructor(interaction: Interaction)
    private move(self: Snake): boolean
    private format_board(board: string[],snake_head: number): string
    private create_disabled_button(): MessageButton
    start(): Promise<void>;
}
export class Roulette{
    constructor(interaction: Interaction,opponent: User)
    start(): Promise<void | string>
}
export class Sokoban{
    constructor(interaction: Interaction)
    private format_board(board: string[]): string
    private random(start: number | null, end: number | null): number
    private create_board(): string[][]
    private get_player(board: string[]): any[]
    private has_won(board: string[]): boolean
    start(): Promise<void>
}
export class Hangman{
    constructor(interaction: Interaction,options?:{
        min: number
        max: number
        word?: string
    })
    private make_hangman(): string
    private make_embed(title: string): MessageEmbed
    start(): Promise<void>
}
export class Wordle{
    constructor(interaction: Interaction,word?: string)
    private remove(wrd: string,letter: string): string
    private filter_(guess: string): string
    private win(arr: string[]): boolean
    private make_embed(): MessageEmbed
    start(): Promise<void>
}
