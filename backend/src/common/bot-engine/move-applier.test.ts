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

	it("promotes a pawn reaching the last rank to the chosen piece (mover's colour)", () => {
		// White pawn e7 (index 12) advances to e8 (index 4) and promotes to a queen.
		const start = "8/4P3/8/8/8/8/8/8"
		const { newFen, capturePiece } = applyMoveToProjectFen(start, 12, 4, "q")
		expect(capturePiece).toBeNull()
		const cells = projectFenToFlatArray(newFen)
		expect(cells[12]).toBeNull()
		expect(cells[4]).toBe("Q")
	})

	it("promotes with a capture, keeping the promoted piece in the mover's colour", () => {
		// Black pawn b2 (index 49) captures a white rook on a1 (index 56) and promotes to a knight.
		const start = "8/8/8/8/8/8/1p6/R7"
		const { newFen, capturePiece } = applyMoveToProjectFen(start, 49, 56, "n")
		expect(capturePiece).toBe("R")
		const cells = projectFenToFlatArray(newFen)
		expect(cells[49]).toBeNull()
		expect(cells[56]).toBe("n")
	})
})
