import {
	BOARD_COLUMNS,
	BOARD_ROWS,
	LS_LANGUAGE,
	LS_TOKEN_KEY
} from "./constant"
import { fenPieceMap } from "pages/Room/constant"
import { CustomConsole } from "./logger"
import { translate } from "locales/translate"
import { FenMoveDiffResult } from "types/Common"
import { CellProps, NullableCellProps, PieceCharacter } from "types/GameState"

String.prototype.format = function(...args: any) {
	return this.toString().replace(/{(\d+)}/g, (match, index) => {
		return typeof args[index] !== "undefined" ? args[index] : match
	})
}

export const logger = new CustomConsole()

export function findPiece(pieces: CellProps[], position: number): CellProps | null {
	for (const p of pieces) {
		if (p.id === position) return p
	}
	return null
}

function isDifferentTeam(piece1: CellProps, piece2: CellProps): boolean {
	if (!piece1 || !piece2) return false
	if (!piece1.piece || !piece2.piece) return false

	const team1 = piece1.piece.toUpperCase() === piece1.piece ? "white" : "black"
	const team2 = piece2.piece.toUpperCase() === piece2.piece ? "white" : "black"

	return team1 !== team2
}

function slide(offset: number, current: number, occupied: CellProps[]): number[] {
	const moves: number[] = []
	let pos = current
	const findCurrentPieceResult = findPiece(occupied, current) as CellProps

	while (true) {
		const next = pos + offset

		if (next < 0 || next >= 64) break

		const colDiff = Math.abs((pos % 8) - (next % 8))
		if (colDiff > 2) break // wrapped across board

		const findNextPieceResult = findPiece(occupied, next)
		if (findNextPieceResult) {
			if (isDifferentTeam(findCurrentPieceResult, findNextPieceResult)) {
				moves.push(next) // can capture opponent piece
			}
			return moves // stop after capturing, regardless of team
		}

		// there's a piece in the next position and that piece is on the same team, stop sliding
		moves.push(next)
		pos = next

		// stop horizontal wrap
		if (offset === 1 && next % 8 === 7) break
		if (offset === -1 && next % 8 === 0) break
	}

	return moves
}

export function getAvailableMoves(
	gameState: NullableCellProps[],
	selectedIndex: number,
	direction: 1 | -1
): number[] {
	const selectedTile = gameState[selectedIndex]
	if (!selectedTile || !selectedTile.piece) {
		return []
	}

	const moves: number[] = []
	const occupiedIndexes = gameState.filter(tile => tile !== null)
	switch (selectedTile.piece) {
		case "p":
		case "P":
			const forwardTile = gameState[selectedIndex + direction * 8]
			if (forwardTile === null) {
				// If there isn't a piece directly in front, the pawn can move forward
				moves.push(selectedIndex + direction * 8)
			}
			const captureOffsets = [direction * 7, direction * 9]
			for (const offset of captureOffsets) {
				const captureIndex = selectedIndex + offset
				if (captureIndex >= 0 && captureIndex < 64) {
					const captureTile = gameState[captureIndex]
					if (captureTile && isDifferentTeam(captureTile, selectedTile)) {
						moves.push(captureIndex)
					}
				}
			}

			if (
				(direction === -1 && selectedIndex >= 48) ||
				(direction === 1 && selectedIndex < 16)
			) {
				const move1CellsId = selectedIndex + direction * 8
				const move2CellsId = selectedIndex + direction * 16
				// Check if the pawn is in its initial position and can move two squares
				if (gameState[move2CellsId] === null && gameState[move1CellsId] === null) {
					moves.push(move2CellsId) // Move forward two squares from initial position
				}
			}

			// check for en passant
			const enPassantOffsets = [direction * 7, direction * 9]
			for (const offset of enPassantOffsets) {
				const adjacentIndex = selectedIndex + offset - direction * 8
				const captureIndex = selectedIndex + offset
				if (captureIndex < 0 || captureIndex >= 64) {
					continue
				}
				const adjacentTile = gameState[adjacentIndex]
				if (adjacentTile?.canBeEnPassant === true) {
					moves.push(captureIndex) // Add en passant capture move
				}
			}
			break
		case "n":
		case "N":
			const offsets = [-17, -15, -10, -6, 6, 10, 15, 17] // L-shaped moves

			for (const offset of offsets) {
				const target = selectedIndex + offset
				if (target < 0 || target >= 64) continue

				const targetTile = gameState[target]
				if (targetTile && !isDifferentTeam(targetTile, selectedTile))
					continue // can't move to a tile occupied by same team

				const colDiff = Math.abs((selectedIndex % 8) - (target % 8))
				if (colDiff === 1 || colDiff === 2) moves.push(target)
			}

			break
		case "b":
		case "B":
			const bishopOffsets = [7, -7, 9, -9]
			for (const offset of bishopOffsets) {
				const slideMove = slide(offset, selectedIndex, occupiedIndexes)
				moves.push(...slideMove)
			}
			break
		case "r":
		case "R":
			const rookOffsets = [1, -1, 8, -8]
			for (const offset of rookOffsets) {
				const slideMove = slide(offset, selectedIndex, occupiedIndexes)
				moves.push(...slideMove)
			}
			break
		case "q":
		case "Q":
			const queenOffsets = [1, -1, 8, -8, 7, -7, 9, -9]
			for (const offset of queenOffsets) {
				const slideMove = slide(offset, selectedIndex, occupiedIndexes)
				moves.push(...slideMove)
			}
			break
		case "k":
		case "K":
			const kingOffsets = [1, -1, 8, -8, 7, -7, 9, -9]
			for (const offset of kingOffsets) {
				const target = selectedIndex + offset
				if (target < 0 || target >= 64) continue

				const targetTile = gameState[target]
				if (targetTile && !isDifferentTeam(targetTile, selectedTile))
					continue // can't move to a tile occupied by same team

				const colDiff = Math.abs((selectedIndex % 8) - (target % 8))
				if (colDiff <= 1) moves.push(target)
			}
			// check if castling is possible
			const castlingOffsets = [2, -2]
			for (const offset of castlingOffsets) {
				if ((selectedTile.piece !== "k" && selectedTile.piece !== "K") || ![4, 60].includes(selectedIndex))
					continue
				const rookIndex = offset === 2 ? selectedIndex + 3 : selectedIndex - 4
				const rookTile = gameState[rookIndex]
				// check if no pieces between king and rook and rook is in the correct position for castling
				const queenCastlingOffset = gameState[selectedIndex + offset + offset / 2]
				if (
					rookTile &&
					rookTile.piece &&
					rookTile.piece.toLowerCase() === "r" &&
					!isDifferentTeam(rookTile, selectedTile) &&
					!gameState[selectedIndex + offset] &&
					!gameState[selectedIndex + offset / 2] &&
					(queenCastlingOffset === null || queenCastlingOffset.piece === "r" || queenCastlingOffset.piece === "R")
				) {
					moves.push(selectedIndex + offset) // add castling move
				}
			}

			break
		default:
			break
	}
	moves.sort((a, b) => a - b) // Sort moves in ascending order

	return moves
}

export function getLanguage() {
	const lang = localStorage.getItem(LS_LANGUAGE)
	return lang || "en"
}

export function getToken() {
	return localStorage.getItem(LS_TOKEN_KEY) || ""
}

function normalizeBase64Str(encoded: string) {
	const normalized = encoded.replace("_", "/").replace("-", "+")
	switch (normalized.length % 4) {
		case 2:
			return normalized + "=="
		case 3:
			return normalized + "="
		default:
			return normalized
	}
}

export function formatNumber(num?: number, locale: string = "en") {
	if (num === undefined) {
		return "-"
	}
	return num.toLocaleString(locale)
}

export function requireImage(url: string) {
	if (!url) {
		return "https://clf.hieunm.io.vn/public/notfound.png"
	}

	if (url.startsWith("https://") || url.startsWith("http://")) {
		return url
	}

	return `${import.meta.env.VITE_PUBLIC_DISTRIBUTION}${url}`
}

export function decodePayload(token: string | null) {
	if (!token) {
		return null
	}
	try {
		const payload = token.split(".")[1]
		const decode = atob(normalizeBase64Str(payload))
		return JSON.parse(decode)
	} catch {
		return null
	}
}

export function getClaimsFromLocalStorage() {
	const token = getToken()
	return decodePayload(token)
}

export function getCurrentUserId(): number | null {
	const claims = getClaimsFromLocalStorage()
	if (!claims || !claims.sub) {
		return null
	}
	const id = Number(claims.sub)
	return Number.isNaN(id) ? null : id
}

function parseFenBoard(fen: string): Array<PieceCharacter | null> {
	// Tolerate both board-only and full 6-field FENs: take the placement field only.
	const rows = fen.trim().split(/\s+/)[0].split("/")
	if (rows.length !== BOARD_ROWS) {
		throw new Error(`Invalid FEN row count: expected ${BOARD_ROWS}, got ${rows.length}`)
	}

	const board: Array<PieceCharacter | null> = []
	for (const rowText of rows) {
		for (const token of rowText) {
			if (token >= "1" && token <= "9") {
				const emptyCount = Number(token)
				for (let i = 0; i < emptyCount; i += 1) {
					board.push(null)
				}
				continue
			}

			if (!(token in fenPieceMap)) {
				throw new Error(`Invalid FEN piece token: '${token}'`)
			}
			board.push(token as PieceCharacter)
		}
	}

	const expectedSize = BOARD_COLUMNS * BOARD_ROWS
	if (board.length !== expectedSize) {
		throw new Error(`Invalid FEN board size: expected ${expectedSize}, got ${board.length}`)
	}

	return board
}

/**
 * Compare two FEN strings and infer the moved piece.
 * Returns null when the diff cannot be identified as one legal "from -> to" move.
 */
export function diffFenMove(oldFen: string, newFen: string): FenMoveDiffResult | null {
	const before = parseFenBoard(oldFen)
	const after = parseFenBoard(newFen)

	const diffIndexes: number[] = []
	for (let i = 0; i < before.length; i += 1) {
		if (before[i] !== after[i]) {
			diffIndexes.push(i)
		}
	}

	if (diffIndexes.length !== 2) {
		return null
	}

	const [indexA, indexB] = diffIndexes
	const beforeA = before[indexA]
	const afterA = after[indexA]
	const beforeB = before[indexB]
	const afterB = after[indexB]

	let oldIndex = -1
	let newIndex = -1
	let movedToken: PieceCharacter | null = null
	let capturedToken: PieceCharacter | null = null

	if (beforeA && !afterA && afterB === beforeA) {
		oldIndex = indexA
		newIndex = indexB
		movedToken = beforeA
		capturedToken = beforeB
	} else if (beforeB && !afterB && afterA === beforeB) {
		oldIndex = indexB
		newIndex = indexA
		movedToken = beforeB
		capturedToken = beforeA
	}

	if (oldIndex < 0 || newIndex < 0 || !movedToken) {
		return null
	}

	return {
		oldIndex,
		newIndex,
		movedCell: { id: newIndex, piece: movedToken },
		capturedCell: capturedToken ? { id: newIndex, piece: capturedToken } : null,
	}
}

/**
 * Convert a timestamp (in seconds) to a date/time string array
 */
export function formatTimestampToDateTimeArray(timestamp: string, language: string) {
	const date = new Date(timestamp)
	const now = new Date()

	// Get dates without time for comparison
	const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
	const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const yesterdayOnly = new Date(todayOnly)
	yesterdayOnly.setDate(yesterdayOnly.getDate() - 1)

	// Calculate difference in days
	const daysDiff = Math.floor((todayOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24))

	// Format time as H:mm
	const hours = date.getHours()
	const minutes = date.getMinutes().toString().padStart(2, '0')
	const timeString = `${hours}:${minutes}`

	// Determine date string
	let dateString: string | null = null

	if (daysDiff === 0) {
		// Same day - return null
		dateString = null
	} else if (daysDiff === 1) {
		// Yesterday
		dateString = translate('common.date.yesterday')
	} else if (daysDiff >= 2 && daysDiff < 7) {
		// 2-7 days ago - show day of week
		const dayOfWeekKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()]
		dateString = translate(`common.date.${dayOfWeekKey}`)
	} else if (daysDiff >= 7) {
		// >= 7 days ago
		if (date.getFullYear() === now.getFullYear()) {
			// Same year - show dd/MM or MM/dd based on language
			if (language === 'vi') {
				// Vietnamese: dd/MM
				const day = date.getDate().toString().padStart(2, '0')
				const month = (date.getMonth() + 1).toString().padStart(2, '0')
				dateString = `${day}/${month}`
			} else {
				// English: MM/dd
				const month = (date.getMonth() + 1).toString().padStart(2, '0')
				const day = date.getDate().toString().padStart(2, '0')
				dateString = `${month}/${day}`
			}
		} else {
			// Different year - show full date dd/MM/yyyy or MM/dd/yyyy
			if (language === 'vi') {
				// Vietnamese: dd/MM/yyyy
				const day = date.getDate().toString().padStart(2, '0')
				const month = (date.getMonth() + 1).toString().padStart(2, '0')
				const year = date.getFullYear()
				dateString = `${day}/${month}/${year}`
			} else {
				// English: MM/dd/yyyy
				const month = (date.getMonth() + 1).toString().padStart(2, '0')
				const day = date.getDate().toString().padStart(2, '0')
				const year = date.getFullYear()
				dateString = `${month}/${day}/${year}`
			}
		}
	}

	return [dateString, timeString]
}

// Milliseconds left until the next UTC boundary of the given slot size (hours).
export function getTimeToNextSlot(slotHours: number): number {
	const now = new Date()
	const nextBoundary = new Date(now)
	const nextBoundaryHour = (Math.floor(now.getUTCHours() / slotHours) + 1) * slotHours
	nextBoundary.setUTCHours(nextBoundaryHour, 0, 0, 0)
	return nextBoundary.getTime() - now.getTime()
}

// Solid icon for the active tab, regular for the rest.
export function tabIconClassBuilder(index: number, activeTab: number, icon: string) {
	return `${activeTab === index ? "fas" : "far"} fa-${icon}`
}
