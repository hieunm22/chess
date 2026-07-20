import { BOARD_COLUMNS, BOARD_ROWS, BOARD_SIZE } from "./constants"

/**
 * Standard chess UCI move format: files a–h, ranks 1–8 (rank 1 is white's back
 * rank at the bottom, rank 8 is black's back rank at the top). A promotion move
 * carries a trailing piece char, e.g. "e7e8q".
 *
 *   "e2e4"   → 4 chars
 *   "e7e8q"  → 5 chars (promotion)
 */
const MOVE_PATTERN = /^([a-h])([1-8])([a-h])([1-8])([qrbn])?/

const fileCharToCol = (file: string): number => {
	const col = file.charCodeAt(0) - "a".charCodeAt(0)
	if (col < 0 || col >= BOARD_COLUMNS) {
		throw new Error(`Invalid UCI file: '${file}'`)
	}
	return col
}

const colToFileChar = (col: number): string => {
	if (col < 0 || col >= BOARD_COLUMNS) {
		throw new Error(`Invalid file column: ${col}`)
	}
	return String.fromCharCode("a".charCodeAt(0) + col)
}

/**
 * Board index: rank 8 at the top (row 0), rank 1 at the bottom (row 7).
 * a8 = index 0, a1 = index 56, h1 = index 63.
 */
const fileRankToIndex = (file: string, rank: number): number => {
	if (!Number.isInteger(rank) || rank < 1 || rank > BOARD_ROWS) {
		throw new Error(`Invalid UCI rank: ${rank}`)
	}
	const col = fileCharToCol(file)
	const row = BOARD_ROWS - rank
	return row * BOARD_COLUMNS + col
}

const indexToFileRank = (index: number): { file: string; rank: number } => {
	if (index < 0 || index >= BOARD_SIZE) {
		throw new Error(`Invalid board index: ${index}`)
	}
	const row = Math.floor(index / BOARD_COLUMNS)
	const col = index % BOARD_COLUMNS
	return {
		file: colToFileChar(col),
		rank: BOARD_ROWS - row
	}
}

/**
 * Convert a UCI move (e.g. "e2e4" or "e7e8q") from fairy-stockfish into project
 * board indices (0 = top-left / a8, 63 = bottom-right / h1). Any promotion suffix
 * is parsed but does not affect the from/to squares.
 *
 * `_redFirst` is accepted for signature stability but is a no-op for chess, whose
 * board is always stored in the standard orientation.
 */
export const uciMoveToProjectIndices = (
	uciMove: string,
	_redFirst: boolean
): { fromIdx: number; toIdx: number } => {
	const match = MOVE_PATTERN.exec(uciMove.trim())
	if (!match) {
		throw new Error(`Invalid UCI move: '${uciMove}'`)
	}
	const [, fromFile, fromRankStr, toFile, toRankStr] = match
	return {
		fromIdx: fileRankToIndex(fromFile, Number(fromRankStr)),
		toIdx: fileRankToIndex(toFile, Number(toRankStr))
	}
}

/**
 * Convert a pair of project board indices into a UCI move string (used when we
 * need to feed a player's move back to the engine).
 */
export const projectIndicesToUciMove = (
	fromIdx: number,
	toIdx: number,
	_redFirst: boolean
): string => {
	const from = indexToFileRank(fromIdx)
	const to = indexToFileRank(toIdx)
	return `${from.file}${from.rank}${to.file}${to.rank}`
}
