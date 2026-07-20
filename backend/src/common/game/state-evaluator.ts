import { fenToBoard } from "common/board-helper"
import { GameStateStatus, Team } from "types/game.type"

const BOARD_COLUMNS = 8
const BOARD_ROWS = 8
const TOTAL_CELLS = BOARD_COLUMNS * BOARD_ROWS

type BoardState = ReturnType<typeof fenToBoard>
type BoardCell = BoardState[number]

interface TeamStateEvaluation {
	inCheck: boolean
	legalMovesCount: number
	status: GameStateStatus
}

const rowOf = (index: number) => Math.floor(index / BOARD_COLUMNS)
const colOf = (index: number) => index % BOARD_COLUMNS

const enemyOf = (team: Team): Team => (team === "white" ? "black" : "white")

/**
 * Slide from `from` along (dRow, dCol): collect empty squares and the first enemy piece,
 * stopping at the first occupied square.
 */
const slide = (board: BoardState, from: number, dRow: number, dCol: number, team: Team): number[] => {
	const result: number[] = []
	let row = rowOf(from) + dRow
	let col = colOf(from) + dCol
	while (row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLUMNS) {
		const idx = row * BOARD_COLUMNS + col
		const cell = board[idx]
		if (!cell) {
			result.push(idx)
		} else {
			if (cell.team !== team) result.push(idx)
			break
		}
		row += dRow
		col += dCol
	}
	return result
}

const pushStep = (board: BoardState, from: number, dRow: number, dCol: number, team: Team, moves: number[]) => {
	const row = rowOf(from) + dRow
	const col = colOf(from) + dCol
	if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLUMNS) return
	const idx = row * BOARD_COLUMNS + col
	const cell = board[idx]
	if (!cell || cell.team !== team) moves.push(idx)
}

const DIAGONALS: Array<[number, number]> = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
const ORTHOGONALS: Array<[number, number]> = [[-1, 0], [1, 0], [0, -1], [0, 1]]
const KNIGHT_STEPS: Array<[number, number]> = [
	[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]
]
const KING_STEPS: Array<[number, number]> = [
	[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
]

/**
 * Pseudo-legal moves for the piece on `selectedId` (does not filter out moves that leave
 * the mover's own king in check — that filtering happens in countLegalMoves). Castling and
 * en passant are intentionally omitted: they never affect check/checkmate/stalemate
 * detection here (castling can't escape check; en passant is negligibly rare for mate/stalemate).
 */
const getAvailableMoves = (board: BoardState, selectedId: number): number[] => {
	const cell = board[selectedId]
	if (!cell) return []

	const team = cell.team
	const moves: number[] = []
	const row = rowOf(selectedId)
	const col = colOf(selectedId)

	switch (cell.piece) {
		case "pawn": {
			// White advances up the board (toward row 0), black advances down (toward row 7).
			const dir = team === "white" ? -1 : 1
			const homeRow = team === "white" ? 6 : 1

			const oneRow = row + dir
			if (oneRow >= 0 && oneRow < BOARD_ROWS) {
				const oneIdx = oneRow * BOARD_COLUMNS + col
				if (!board[oneIdx]) {
					moves.push(oneIdx)
					if (row === homeRow) {
						const twoIdx = (row + dir * 2) * BOARD_COLUMNS + col
						if (!board[twoIdx]) moves.push(twoIdx)
					}
				}
			}

			for (const dCol of [-1, 1]) {
				const cRow = row + dir
				const cCol = col + dCol
				if (cRow < 0 || cRow >= BOARD_ROWS || cCol < 0 || cCol >= BOARD_COLUMNS) continue
				const idx = cRow * BOARD_COLUMNS + cCol
				const target = board[idx]
				if (target && target.team !== team) moves.push(idx)
			}
			break
		}

		case "knight":
			for (const [dRow, dCol] of KNIGHT_STEPS) pushStep(board, selectedId, dRow, dCol, team, moves)
			break

		case "bishop":
			for (const [dRow, dCol] of DIAGONALS) moves.push(...slide(board, selectedId, dRow, dCol, team))
			break

		case "rook":
			for (const [dRow, dCol] of ORTHOGONALS) moves.push(...slide(board, selectedId, dRow, dCol, team))
			break

		case "queen":
			for (const [dRow, dCol] of [...DIAGONALS, ...ORTHOGONALS]) {
				moves.push(...slide(board, selectedId, dRow, dCol, team))
			}
			break

		case "king":
			for (const [dRow, dCol] of KING_STEPS) pushStep(board, selectedId, dRow, dCol, team, moves)
			break

		default:
			break
	}

	moves.sort((a, b) => a - b)
	return moves
}

/**
 * Enemy pieces whose pseudo-legal moves attack `team`'s king.
 */
const findCheckingPieces = (board: BoardState, team: Team): number[] => {
	const kingIndex = board.findIndex(cell => cell?.piece === "king" && cell.team === team)
	if (kingIndex < 0) return []

	const enemyTeam = enemyOf(team)
	const checkers: number[] = []
	for (let id = 0; id < board.length; id += 1) {
		const cell = board[id]
		if (!cell || cell.team !== enemyTeam) continue
		if (getAvailableMoves(board, id).includes(kingIndex)) checkers.push(id)
	}
	return checkers
}

const applyMove = (board: BoardState, fromId: number, toId: number): BoardState => {
	const next = [...board]
	const moving = next[fromId] as Exclude<BoardCell, null>
	next[toId] = { ...moving, id: toId }
	next[fromId] = null
	return next
}

/**
 * Count fully-legal moves for `team`: pseudo-legal moves that do not leave the team's
 * own king in check.
 */
const countLegalMoves = (board: BoardState, team: Team): number => {
	let legalMovesCount = 0
	for (let fromId = 0; fromId < board.length; fromId += 1) {
		const cell = board[fromId]
		if (!cell || cell.team !== team) continue
		for (const toId of getAvailableMoves(board, fromId)) {
			const nextBoard = applyMove(board, fromId, toId)
			if (findCheckingPieces(nextBoard, team).length === 0) {
				legalMovesCount += 1
			}
		}
	}
	return legalMovesCount
}

/**
 * Evaluate `checkedTeam`'s position: check + whether it has any legal move, yielding
 * one of ongoing / check / checkmate / stalemate. `_redFirst` is accepted for signature
 * stability but unused — chess pawn direction follows piece colour, not board seat.
 */
export const evaluateTeamState = (fen: string, checkedTeam: Team, _redFirst: boolean): TeamStateEvaluation => {
	const board = fenToBoard(fen)
	if (board.length !== TOTAL_CELLS) {
		throw new Error(`Invalid board size: expected ${TOTAL_CELLS}, got ${board.length}`)
	}
	const inCheck = findCheckingPieces(board, checkedTeam).length > 0
	const legalMovesCount = countLegalMoves(board, checkedTeam)

	if (legalMovesCount === 0) {
		return {
			inCheck,
			legalMovesCount,
			status: inCheck ? "checkmate" : "stalemate"
		}
	}

	return {
		inCheck,
		legalMovesCount,
		status: inCheck ? "check" : "ongoing"
	}
}
