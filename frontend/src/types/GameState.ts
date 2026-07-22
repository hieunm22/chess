export type NullableCellProps = CellProps | null

export interface CapturedPieces {
	white: PieceCharacter[]
	black: PieceCharacter[]
}

export interface CellProps {
	id: number
	piece: PieceCharacter | null
	animateTo?: number
	canBeEnPassant?: boolean
	promoteTo?: PieceCharacter
}

export type Team = "white" | "black"

export type Piece = "king"
	| "queen"
	| "bishop"
	| "knight"
	| "rook"
	| "pawn"

export type PieceCharacter =
	"k" | "q" | "b" | "n" | "r" | "p"
	| "K" | "Q" | "B" | "N" | "R" | "P"
