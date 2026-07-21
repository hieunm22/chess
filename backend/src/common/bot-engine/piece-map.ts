/**
 * Piece code conversion between this project's FEN dialect and standard chess FEN
 * (the one fairy-stockfish understands).
 *
 */

const CHESS_PIECES = new Set(["k", "q", "b", "n", "r", "p"])

const assertChessPiece = (char: string): void => {
	if (char.length !== 1 || !CHESS_PIECES.has(char.toLowerCase())) {
		throw new Error(`Unknown piece char: '${char}'`)
	}
}

export const projectPieceToStandard = (projectChar: string): string => {
	assertChessPiece(projectChar)
	return projectChar
}

export const standardPieceToProject = (standardChar: string): string => {
	assertChessPiece(standardChar)
	return standardChar
}
