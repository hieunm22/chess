import { BOARD_COLUMNS, BOARD_ROWS } from "./bot-engine/constants"
import { Team } from "types/game.type"

const fenPieceMap: Record<string, string> = {
	k: "king",
	q: "queen",
	b: "bishop",
	n: "knight",
	r: "rook",
	p: "pawn",
}

const pieceFenMap: Record<string, string> = {
	king: "k",
	queen: "q",
	bishop: "b",
	knight: "n",
	rook: "r",
	pawn: "p"
}

interface CellProps {
	id: number
	piece: string
	team: Team
	animateTo?: number
}

/**
 * Read the half-move / full-move counters from a FEN. Board-only strings (no fields
 * beyond the placement) default to half-move 0 and full-move 1.
 */
export const parseFenCounters = (fen: string): { halfmove: number; fullmove: number } => {
	const parts = fen.trim().split(/\s+/)
	const halfmove = parts.length >= 5 && Number.isInteger(Number(parts[4])) ? Number(parts[4]) : 0
	const fullmove = parts.length >= 6 && Number.isInteger(Number(parts[5])) ? Number(parts[5]) : 1
	return { halfmove, fullmove }
}

/**
 * Build a standard 6-field chess FEN.
 */
export const toStandardFen = (
	fen: string,
	sideToMove: Team,
	halfmove: number,
	fullmove: number
): string => {
	const placement = fen.trim().split(/\s+/)[0]
	const side = sideToMove === "white" ? "w" : "b"
	return `${placement} ${side} - - ${halfmove} ${fullmove}`
}

export const fenToBoard = (fen: string): (CellProps | null)[] => {
	// Tolerate both board-only and full 6-field FENs: take the placement field only.
	const rows = fen.trim().split(/\s+/)[0].split("/")
	if (rows.length !== BOARD_ROWS) {
		throw new Error(`Invalid FEN row count: expected ${BOARD_ROWS}, got ${rows.length}`)
	}

	const board: (CellProps | null)[] = []

	for (const rowText of rows) {
		for (const token of rowText) {
			if (token >= "1" && token <= "8") {
				const emptyCount = Number(token)
				for (let i = 0; i < emptyCount; i += 1) {
					board.push(null)
				}
				continue
			}

			const piece = fenPieceMap[token.toLowerCase()]
			if (!piece) {
				throw new Error(`Invalid FEN piece token: '${token}'`)
			}

			const id = board.length
			// Standard chess FEN: uppercase = white, lowercase = black.
			const isUpperCase = token === token.toUpperCase()
			board.push({
				id,
				piece,
				team: isUpperCase ? "white" : "black"
			})
		}

		if (board.length % BOARD_COLUMNS !== 0) {
			throw new Error("Invalid FEN: a row does not have exactly 8 cells")
		}
	}

	if (board.length !== BOARD_COLUMNS * BOARD_ROWS) {
		throw new Error(`Invalid FEN board size: expected ${BOARD_COLUMNS * BOARD_ROWS}, got ${board.length}`)
	}

	return board
}

/**
 * Whether `team` still has enough material to force checkmate
 */
export const hasMatingMaterial = (fen: string, team: Team): boolean => {
	const board = fenToBoard(fen)
	let pawns = 0
	let rooks = 0
	let queens = 0
	let bishops = 0
	let knights = 0

	for (const cell of board) {
		if (!cell || cell.team !== team) {
			continue
		}
		switch (cell.piece) {
			case "pawn": pawns += 1; break
			case "rook": rooks += 1; break
			case "queen": queens += 1; break
			case "bishop": bishops += 1; break
			case "knight": knights += 1; break
			default: break
		}
	}

	if (pawns > 0 || rooks > 0 || queens > 0) return true
	if (bishops >= 2) return true
	if (bishops >= 1 && knights >= 1) return true
	if (knights >= 3) return true
	return false
}

/**
 * Whether the last move (prevFen -> newFen) moved a pawn belonging to `team`.
 * The 50-move half-move clock resets on any pawn move (advance, capture or promotion),
 * detected here as one of the team's pawns leaving its square.
 */
export const isPawnMove = (prevFen: string, newFen: string, team: Team): boolean => {
	const prev = fenToBoard(prevFen)
	const next = fenToBoard(newFen)

	for (let i = 0; i < prev.length; i += 1) {
		const wasTeamPawn = prev[i]?.team === team && prev[i]?.piece === "pawn"
		const isTeamPawn = next[i]?.team === team && next[i]?.piece === "pawn"
		if (wasTeamPawn && !isTeamPawn) {
			return true
		}
	}

	return false
}

export const boardToFen = (board: (CellProps | null)[]): string => {
	const rows: string[] = []

	for (let row = 0; row < BOARD_ROWS; row += 1) {
		let rowFen = ""
		let emptyCount = 0

		for (let col = 0; col < BOARD_COLUMNS; col += 1) {
			const index = row * BOARD_COLUMNS + col
			const cell = board[index]

			if (!cell) {
				emptyCount += 1
				continue
			}

			if (emptyCount > 0) {
				rowFen += String(emptyCount)
				emptyCount = 0
			}

			const token = pieceFenMap[cell.piece]
			// Standard chess FEN: uppercase = white.
			rowFen += cell.team === "white" ? token.toUpperCase() : token
		}

		if (emptyCount > 0) {
			rowFen += String(emptyCount)
		}

		rows.push(rowFen)
	}

	return rows.join("/")
}
