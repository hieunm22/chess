import { describe, expect, it } from "vitest"
import {
	hasMatingMaterial,
	isPawnMove,
	parseFenCounters,
	toStandardFen
} from "./board-helper"

// Standard chess FEN convention: uppercase = white, lowercase = black; row 0 (rank 8)
// is the top of the board.
const INITIAL = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"

describe("hasMatingMaterial", () => {
	it("returns true for both sides at the initial position", () => {
		expect(hasMatingMaterial(INITIAL, "white")).toBe(true)
		expect(hasMatingMaterial(INITIAL, "black")).toBe(true)
	})

	it("returns false for lone kings on both sides", () => {
		const fen = "4k3/8/8/8/8/8/8/4K3"
		expect(hasMatingMaterial(fen, "white")).toBe(false)
		expect(hasMatingMaterial(fen, "black")).toBe(false)
	})

	it("returns false for king + single minor piece (K+B, K+N)", () => {
		expect(hasMatingMaterial("4k3/8/8/8/8/8/8/4KB2", "white")).toBe(false) // K + bishop
		expect(hasMatingMaterial("4k3/8/8/8/8/8/8/4KN2", "white")).toBe(false) // K + knight
	})

	it("returns false for king + two knights (cannot force mate)", () => {
		expect(hasMatingMaterial("4k3/8/8/8/8/8/8/3NKN2", "white")).toBe(false)
	})

	it("returns true for a pawn, rook or queen", () => {
		expect(hasMatingMaterial("4k3/8/8/8/8/8/4P3/4K3", "white")).toBe(true) // pawn
		expect(hasMatingMaterial("4k3/8/8/8/8/8/8/4KR2", "white")).toBe(true) // rook
		expect(hasMatingMaterial("4k3/8/8/8/8/8/8/4KQ2", "white")).toBe(true) // queen
	})

	it("returns true for bishop+knight and the bishop pair", () => {
		expect(hasMatingMaterial("4k3/8/8/8/8/8/8/3NKB2", "white")).toBe(true) // B + N
		expect(hasMatingMaterial("4k3/8/8/8/8/8/8/2B1KB2", "white")).toBe(true) // two bishops
	})

	it("is per-team", () => {
		// White has a pawn, black has only its king.
		const fen = "4k3/8/8/8/8/8/4P3/4K3"
		expect(hasMatingMaterial(fen, "white")).toBe(true)
		expect(hasMatingMaterial(fen, "black")).toBe(false)
	})

	it("tolerates a full 6-field FEN by parsing the placement field only", () => {
		expect(hasMatingMaterial(`${INITIAL} w KQkq - 0 1`, "white")).toBe(true)
	})
})

describe("isPawnMove", () => {
	it("detects a pawn advancing forward", () => {
		const prev = "4k3/8/8/8/8/8/4P3/4K3"
		const next = "4k3/8/8/8/4P3/8/8/4K3" // white pawn e2 -> e4
		expect(isPawnMove(prev, next, "white")).toBe(true)
	})

	it("detects a pawn capture", () => {
		const prev = "4k3/8/8/3p4/4P3/8/8/4K3"
		const next = "4k3/8/8/3P4/8/8/8/4K3" // white pawn e4 x d5
		expect(isPawnMove(prev, next, "white")).toBe(true)
	})

	it("returns false when a non-pawn piece moves", () => {
		const prev = "4k3/8/8/8/8/5N2/8/4K3"
		const next = "4k3/8/8/8/8/8/5N2/4K3" // white knight f3 -> f2
		expect(isPawnMove(prev, next, "white")).toBe(false)
	})

	it("is per-team: a white pawn move is not a black pawn move", () => {
		const prev = "4k3/8/8/8/8/8/4P3/4K3"
		const next = "4k3/8/8/8/4P3/8/8/4K3"
		expect(isPawnMove(prev, next, "black")).toBe(false)
	})
})

describe("parseFenCounters", () => {
	it("defaults a board-only FEN to half-move 0, full-move 1", () => {
		expect(parseFenCounters(INITIAL)).toEqual({ halfmove: 0, fullmove: 1 })
	})

	it("reads the counters from a 6-field FEN", () => {
		expect(parseFenCounters(`${INITIAL} b - - 7 12`)).toEqual({ halfmove: 7, fullmove: 12 })
	})

	it("falls back to defaults when the counter fields are non-numeric", () => {
		expect(parseFenCounters(`${INITIAL} b - - x y`)).toEqual({ halfmove: 0, fullmove: 1 })
	})
})

describe("toStandardFen", () => {
	it("builds a 6-field FEN with the side to move and empty castling/en-passant", () => {
		expect(toStandardFen(INITIAL, "white", 0, 1)).toBe(`${INITIAL} w - - 0 1`)
		expect(toStandardFen(INITIAL, "black", 3, 5)).toBe(`${INITIAL} b - - 3 5`)
	})

	it("re-normalizes an already 6-field FEN using only its placement", () => {
		expect(toStandardFen(`${INITIAL} w - - 9 9`, "black", 1, 2)).toBe(`${INITIAL} b - - 1 2`)
	})
})
