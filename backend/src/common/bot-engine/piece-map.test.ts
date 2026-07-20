import { describe, expect, it } from "vitest"
import { projectPieceToStandard, standardPieceToProject } from "./piece-map"

describe("piece-map", () => {
	describe("projectPieceToStandard", () => {
		it("returns chess piece chars unchanged (project FEN == standard FEN)", () => {
			for (const p of ["k", "q", "b", "n", "r", "p", "K", "Q", "B", "N", "R", "P"]) {
				expect(projectPieceToStandard(p)).toBe(p)
			}
		})

		it("throws on unknown characters", () => {
			expect(() => projectPieceToStandard("x")).toThrow()
			expect(() => projectPieceToStandard("1")).toThrow()
		})
	})

	describe("standardPieceToProject", () => {
		it("is the identity for every chess piece char", () => {
			for (const p of ["k", "q", "b", "n", "r", "p", "K", "Q", "B", "N", "R", "P"]) {
				expect(standardPieceToProject(projectPieceToStandard(p))).toBe(p)
			}
		})
	})
})
