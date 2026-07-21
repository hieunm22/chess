import { describe, expect, it } from "vitest"
import { INITIAL_FEN } from "../constant"
import {
	flatArrayToProjectFen,
	projectFenToFlatArray,
	projectFenToStandardFen
} from "./fen-converter"

describe("fen-converter", () => {
	describe("projectFenToFlatArray ↔ flatArrayToProjectFen roundtrip", () => {
		it("survives the starting position", () => {
			const cells = projectFenToFlatArray(INITIAL_FEN)
			expect(cells).toHaveLength(64)
			expect(flatArrayToProjectFen(cells)).toBe(INITIAL_FEN)
		})

		it("tolerates a full 6-field FEN by parsing the placement field only", () => {
			const cells = projectFenToFlatArray(`${INITIAL_FEN} w KQkq - 0 1`)
			expect(cells).toHaveLength(64)
			expect(flatArrayToProjectFen(cells)).toBe(INITIAL_FEN)
		})

		it("rejects FEN with wrong row count", () => {
			expect(() => projectFenToFlatArray("8/8/8")).toThrow()
		})

		it("rejects FEN with wrong column count in a row", () => {
			// 9 squares in row 0 instead of 8
			const bad = "rnbqkbnrr/8/8/8/8/8/8/8"
			expect(() => projectFenToFlatArray(bad)).toThrow()
		})
	})

	describe("projectFenToStandardFen", () => {
		// The project FEN already matches standard chess (uppercase = white, rank 8
		// on top), so conversion only appends the side/castling/counter fields.
		it("converts the starting position with white to move", () => {
			expect(projectFenToStandardFen(INITIAL_FEN, "white")).toBe(
				"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1"
			)
		})

		it("emits ' b - - 0 1' when black is to move", () => {
			expect(projectFenToStandardFen(INITIAL_FEN, "black").endsWith(" b - - 0 1")).toBe(true)
		})
	})
})
