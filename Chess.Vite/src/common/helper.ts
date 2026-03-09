import type { Tile, Piece, Team } from "types/GameState"

// "pawn" | "knight" | "bishop" | "rook" | "queen" | "king"
const initGameState: (Piece | null)[] = [
	"rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook",
	"pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn",
	null, null, null, null, null, null, null, null,
	null, null, null, null, null, null, null, null,
	null, null, null, null, null, null, null, null,
	null, null, null, null, null, null, null, null,
	"pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn", "pawn",
	"rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"
]

export function initNewGame() {
	const emptyTile = (id: number): Tile => ({
		id,
		piece: initGameState[id],
		team: initGameState[id] !== null ? (id < 32 ? "black" : "white") : null
	})

	const board = Array.from({ length: 64 }, (_, index) => ({
		...emptyTile(index)
	}))

	return {
		board,
		selected: null,
		availableMoves: [],
		teamTurn: "white" as Team,
		animatingPiece: null
	}
}

export function findPiece(pieces: Tile[], position: number): Tile | null {
	for (const p of pieces) {
		if (p.id === position) return p
	}
	return null
}

function slide(offset: number, current: number, occupied: Tile[]): number[] {
	const moves: number[] = []
	let pos = current
	const findCurrentPieceResult = findPiece(occupied, current) as Tile

	while (true) {
		const next = pos + offset

		if (next < 0 || next >= 64) break

		const colDiff = Math.abs((pos % 8) - (next % 8))
		if (colDiff > 2) break // wrapped across board

		const findNextPieceResult = findPiece(occupied, next)
		if (findNextPieceResult) {
			if (findNextPieceResult.team !== findCurrentPieceResult.team) {
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
	gameState: Tile[],
	selectedIndex: number,
	direction: 1 | -1
): number[] {
	const selectedTile = gameState[selectedIndex]
	if (!selectedTile || !selectedTile.piece) {
		return []
	}

	const pieceType = selectedTile.piece.split("-")[0] // e.g., "pawn", "knight", etc.
	const moves: number[] = []
	const occupiedIndexes = gameState
		.map(tile => tile.piece ? tile : null)
		.filter(tile => tile !== null)
	switch (pieceType) {
		case "pawn":
			const forwardTile = gameState[selectedIndex + direction * 8]
			if (forwardTile && forwardTile.piece === null) {
				// If there isn't a piece directly in front, the pawn can move forward
				moves.push(selectedIndex + direction * 8)
			}
			const captureOffsets = [direction * 7, direction * 9]
			for (const offset of captureOffsets) {
				const captureIndex = selectedIndex + offset
				if (captureIndex >= 0 && captureIndex < 64) {
					const captureTile = gameState[captureIndex]
					if (captureTile.piece && captureTile.team !== selectedTile.team) {
						moves.push(captureIndex)
					}
				}
			}

			if (
				(direction === -1 && selectedIndex >= 48) ||
				(direction === 1 && selectedIndex < 16)
			) {
				// Check if the pawn is in its initial position and can move two squares
				moves.push(selectedIndex + direction * 16) // Move forward two squares from initial position
			}
			break
		case "knight":
			const offsets = [-17, -15, -10, -6, 6, 10, 15, 17] // L-shaped moves

			for (const offset of offsets) {
				const target = selectedIndex + offset
				if (target < 0 || target >= 64) continue

				const targetTile = gameState[target]
				if (targetTile.piece && targetTile.team === selectedTile.team)
					continue // can't move to a tile occupied by same team

				const colDiff = Math.abs((selectedIndex % 8) - (target % 8))
				if (colDiff === 1 || colDiff === 2) moves.push(target)
			}

			break
		case "bishop":
			const bishopOffsets = [7, -7, 9, -9]
			for (const offset of bishopOffsets) {
				const slideMove = slide(offset, selectedIndex, occupiedIndexes)
				moves.push(...slideMove)
			}
			break
		case "rook":
			const rookOffsets = [1, -1, 8, -8]
			for (const offset of rookOffsets) {
				const slideMove = slide(offset, selectedIndex, occupiedIndexes)
				moves.push(...slideMove)
			}
			break
		case "queen":
			const queenOffsets = [1, -1, 8, -8, 7, -7, 9, -9]
			for (const offset of queenOffsets) {
				const slideMove = slide(offset, selectedIndex, occupiedIndexes)
				moves.push(...slideMove)
			}
			break
		case "king":
			const kingOffsets = [1, -1, 8, -8, 7, -7, 9, -9]
			for (const offset of kingOffsets) {
				const target = selectedIndex + offset
				if (target < 0 || target >= 64) continue

				const targetTile = gameState[target]
				if (targetTile.piece && targetTile.team === selectedTile.team)
					continue // can't move to a tile occupied by same team

				const colDiff = Math.abs((selectedIndex % 8) - (target % 8))
				if (colDiff <= 1) moves.push(target)
			}
			break
		default:
			break
	}
	moves.sort((a, b) => a - b) // Sort moves in ascending order

	return moves
}
