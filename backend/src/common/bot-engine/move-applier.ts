import { flatArrayToProjectFen, projectFenToFlatArray } from "./fen-converter"

/**
 * Apply a from/to move to a project FEN, returning the new FEN and any captured piece
 * (original case, or null). When `promotion` is set, the pawn lands as that piece instead.
 */
export const applyMoveToProjectFen = (
	projectFen: string,
	fromIdx: number,
	toIdx: number,
	promotion: string | null = null
): { newFen: string; capturePiece: string | null } => {
	const cells = projectFenToFlatArray(projectFen)
	const moving = cells[fromIdx]
	if (!moving) {
		throw new Error(`No piece at fromIdx=${fromIdx} in FEN '${projectFen}'`)
	}
	const captured = cells[toIdx]
	const landing = promotion
		? (moving === moving.toUpperCase() ? promotion.toUpperCase() : promotion.toLowerCase())
		: moving
	cells[toIdx] = landing
	cells[fromIdx] = null
	return {
		newFen: flatArrayToProjectFen(cells),
		capturePiece: captured ?? null
	}
}
