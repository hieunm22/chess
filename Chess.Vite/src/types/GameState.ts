export interface GameState {
	board: (CellProps | null)[]
	selected: CellProps | null
	availableMoves: number[]
	teamTurn: Team | null
}

export interface CellProps {
	id: number
	piece: Piece
	team: Team
	animateTo?: number
  canBeEnPassant?: boolean
}

export interface AnimatingPiece {
	fromId: number
	toId: number
}

export type Team = "white" | "black"

export type Piece = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king"
