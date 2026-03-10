export interface GameState {
	board: Tile[]
	selected: Tile | null
	availableMoves: number[]
	teamTurn: Team
}

export interface Tile {
	id: number
	piece: Piece | null
	team: Team | null
	animateTo?: number
}

export interface AnimatingPiece {
	fromId: number
	toId: number
}

export type Team = "white" | "black"

export type Piece = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king"
