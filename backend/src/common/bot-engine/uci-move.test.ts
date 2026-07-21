import { describe, expect, it } from "vitest"
import { projectIndicesToUciMove, uciMoveToProjectIndices } from "./uci-move"

describe("uci-move", () => {
	describe("uciMoveToProjectIndices", () => {
		// Standard chess: rank 8 on top (row 0), rank 1 at the bottom (row 7).
		// a8 = index 0, a1 = index 56, h1 = index 63.
		it("maps a8 to index 0 (top-left, black rook)", () => {
			expect(uciMoveToProjectIndices("a8a7").fromIdx).toBe(0)
		})

		it("maps a1 to index 56 (bottom-left, white rook)", () => {
			expect(uciMoveToProjectIndices("a1a2").fromIdx).toBe(56)
		})

		it("maps h1 to index 63 (bottom-right, white rook)", () => {
			expect(uciMoveToProjectIndices("h1h2").fromIdx).toBe(63)
		})

		it("maps the classic e2e4 pawn push → indices 52 → 36", () => {
			const { fromIdx, toIdx } = uciMoveToProjectIndices("e2e4")
			expect(fromIdx).toBe(52)
			expect(toIdx).toBe(36)
		})

		it("maps a black reply e7e5 → indices 12 → 28", () => {
			const { fromIdx, toIdx } = uciMoveToProjectIndices("e7e5")
			expect(fromIdx).toBe(12)
			expect(toIdx).toBe(28)
		})

		it("parses a promotion move (e7e8q) and returns the promotion piece", () => {
			const { fromIdx, toIdx, promotion } = uciMoveToProjectIndices("e7e8q")
			expect(fromIdx).toBe(12)
			expect(toIdx).toBe(4)
			expect(promotion).toBe("q")
		})

		it("returns a null promotion for a non-promotion move", () => {
			expect(uciMoveToProjectIndices("e2e4").promotion).toBeNull()
		})
	})

	describe("projectIndicesToUciMove roundtrip", () => {
		it.each([
			"a1a2",
			"e2e4",
			"e7e5",
			"h1h2",
			"a8a7"
		])("survives roundtrip for %s", uci => {
			const { fromIdx, toIdx } = uciMoveToProjectIndices(uci)
			expect(projectIndicesToUciMove(fromIdx, toIdx)).toBe(uci)
		})
	})

	describe("validation", () => {
		it("rejects malformed UCI strings", () => {
			expect(() => uciMoveToProjectIndices("xyz")).toThrow()
			expect(() => uciMoveToProjectIndices("z1a1")).toThrow()
			expect(() => uciMoveToProjectIndices("a0a1")).toThrow()
			expect(() => uciMoveToProjectIndices("a9a1")).toThrow()
		})
	})
})
