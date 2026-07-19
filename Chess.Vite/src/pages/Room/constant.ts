import { Piece, PieceCharacter } from "types/GameState"

export const fenPieceMap: Record<PieceCharacter, Piece> = {
	k: "king",
	q: "queen",
	b: "bishop",
	n: "knight",
	r: "rook",
	p: "pawn",

	K: "king",
	Q: "queen",
	B: "bishop",
	N: "knight",
	R: "rook",
	P: "pawn",
}

export const pieceFenMap: Record<Piece, PieceCharacter> = {
	king: "k",
	queen: "q",
	bishop: "b",
	knight: "n",
	rook: "r",
	pawn: "p"
}

export const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
export const EMPTY_BOARD_FEN = "8/8/8/8/8/8/8/8"

export const MOVE_SOUND_URL = "/chess/sound/move.mp3"
export const CAPTURE_SOUND_URL = "/chess/sound/capture.mp3"
export const GAME_START_SOUND_URL = "/chess/sound/gong-game-start-end.mp3"
