import { describe, expect, it } from "vitest"
import { INITIAL_FEN } from "../constant"
import { applyMoveToProjectFen } from "./move-applier"
import { projectFenToFlatArray } from "./fen-converter"

describe("applyMoveToProjectFen", () => {
	it("moves a piece to an empty square (no capture)", () => {
		// Starting position. White pawn e2 = index 52, push to e4 = index 36.
		const { newFen, capturePiece } = applyMoveToProjectFen(INITIAL_FEN, 52, 36)
		expect(capturePiece).toBeNull()
		const cells = projectFenToFlatArray(newFen)
		expect(cells[52]).toBeNull()
		expect(cells[36]).toBe("P")
	})

	it("captures the piece on the destination square", () => {
		// White rook at e4 (index 36) captures a black pawn at e5 (index 28).
		const start = "8/8/8/4p3/4R3/8/8/8"
		const { newFen, capturePiece } = applyMoveToProjectFen(start, 36, 28)
		expect(capturePiece).toBe("p")
		expect(newFen).toBe("8/8/8/4R3/8/8/8/8")
	})

	it("throws when fromIdx is empty", () => {
		// Index 24 (rank 5, file a) is empty in the starting position.
		expect(() => applyMoveToProjectFen(INITIAL_FEN, 24, 25)).toThrow()
	})
})
