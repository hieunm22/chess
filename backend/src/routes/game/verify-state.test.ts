import express from "express"
import jwt from "jsonwebtoken"
import request from "supertest"
import {
	afterEach,
	beforeAll,
	describe,
	expect,
	it,
	vi
} from "vitest"
import { INITIAL_FEN } from "common/constant"

const { evaluateTeamStateMock, getGameHistoryCollectionMock } =
	vi.hoisted(() => ({
		evaluateTeamStateMock: vi.fn(),
		getGameHistoryCollectionMock: vi.fn()
	}))
const redisGetMock = vi.fn()
const runEndGameTransactionMock = vi.fn()
const activatePostGameLockMock = vi.fn()
const syncPlayersPresenceMock = vi.fn()
const emitGameEndedMock = vi.fn()
const findGameHistoryMock = vi.fn()
const sortGameHistoryMock = vi.fn()
const limitGameHistoryMock = vi.fn()
const toArrayGameHistoryMock = vi.fn()
const updateOneGameHistoryMock = vi.fn()
const gameFindUniqueMock = vi.fn()
const roomUserFindManyMock = vi.fn()
const stopClockMock = vi.fn()

const PATH = "/api/game/verify-state"

vi.mock("../../common/redis", () => ({
	default: {
		get: redisGetMock
	}
}))

vi.mock("common/game/state-evaluator", () => ({
	evaluateTeamState: evaluateTeamStateMock
}))

vi.mock("common/game/end-game.helper", () => ({
	runEndGameTransaction: runEndGameTransactionMock
}))

vi.mock("common/game/post-game.helper", () => ({
	activatePostGameLock: activatePostGameLockMock
}))

vi.mock("common/game/presence-sync", () => ({
	syncPlayersPresence: syncPlayersPresenceMock
}))

vi.mock("common/mongodb", () => ({
	getGameHistoryCollection: getGameHistoryCollectionMock
}))

vi.mock("common/socket", () => ({
	emitGameEnded: emitGameEndedMock
}))

vi.mock("common/game/game-clock", () => ({
	stopClock: stopClockMock
}))

vi.mock("prisma", () => ({
	default: {
		game: {
			findUnique: gameFindUniqueMock
		},
		roomUser: {
			findMany: roomUserFindManyMock
		}
	}
}))

describe("POST /api/game/verify-state", () => {
	let app: express.Express
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>

	beforeAll(async () => {
		process.env.JWT_SECRET = "unit-test-secret"
		process.env.JWT_ISSUER = "unit-test-issuer"

		const { default: verifyStateRoutes } = await import("./verify-state")
		app = express()
		app.use(express.json())
		app.use("/api", verifyStateRoutes)
	})

	afterEach(() => {
		vi.clearAllMocks()
		consoleErrorSpy?.mockRestore()
	})

	const resetRouteMocks = () => {
		evaluateTeamStateMock.mockReturnValue({
			inCheck: true,
			legalMovesCount: 1,
			status: "check"
		})
		runEndGameTransactionMock.mockResolvedValue(true)
		activatePostGameLockMock.mockResolvedValue(undefined)
		syncPlayersPresenceMock.mockResolvedValue(undefined)
		findGameHistoryMock.mockReturnValue({ sort: sortGameHistoryMock })
		sortGameHistoryMock.mockReturnValue({ limit: limitGameHistoryMock })
		limitGameHistoryMock.mockReturnValue({ toArray: toArrayGameHistoryMock })
		toArrayGameHistoryMock.mockResolvedValue([])
		updateOneGameHistoryMock.mockResolvedValue({ modifiedCount: 0 })
		getGameHistoryCollectionMock.mockResolvedValue({
			find: findGameHistoryMock,
			updateOne: updateOneGameHistoryMock
		})
	}

	const buildAccessToken = (userId: number, sessionId: string) =>
		jwt.sign({ sub: userId, jti: sessionId }, process.env.JWT_SECRET as string, {
			issuer: process.env.JWT_ISSUER,
			expiresIn: "1h"
		})

	it("returns 401 when authorization token is missing", async () => {
		const res = await request(app).post(PATH).send({
			gameId: "game-1",
			newFen: INITIAL_FEN,
			checkedTeam: "black"
		})

		expect(res.status).toBe(401)
		expect(res.body).toMatchObject({
			success: false,
			message: "auth-middleware.messages.token-required",
			status_code: 401
		})
	})

	it("returns 400 when gameId is invalid", async () => {
		resetRouteMocks()
		const accessToken = buildAccessToken(91, "session-verify-state-1")
		redisGetMock.mockResolvedValue(JSON.stringify({ userId: 91 }))

		const res = await request(app)
			.post(PATH)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				gameId: 123,
				newFen: INITIAL_FEN,
				checkedTeam: "black"
			})

		expect(res.status).toBe(400)
		expect(res.body).toMatchObject({
			success: false,
			message: "verify-state.messages.invalid-game-id",
			status_code: 400
		})
		expect(gameFindUniqueMock).not.toHaveBeenCalled()
	})

	it("returns 400 when fen is invalid", async () => {
		resetRouteMocks()
		const accessToken = buildAccessToken(91, "session-verify-state-2")
		redisGetMock.mockResolvedValue(JSON.stringify({ userId: 91 }))

		const res = await request(app)
			.post(PATH)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				gameId: "game-1",
				newFen: "invalid-fen",
				checkedTeam: "black"
			})

		expect(res.status).toBe(400)
		expect(res.body).toMatchObject({
			success: false,
			message: "verify-state.messages.invalid-fen",
			status_code: 400
		})
		expect(gameFindUniqueMock).not.toHaveBeenCalled()
	})

	it("returns 400 when checkedTeam is invalid", async () => {
		resetRouteMocks()
		const accessToken = buildAccessToken(91, "session-verify-state-3")
		redisGetMock.mockResolvedValue(JSON.stringify({ userId: 91 }))

		const res = await request(app)
			.post(PATH)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				gameId: "game-1",
				newFen: INITIAL_FEN,
				checkedTeam: "blue"
			})

		expect(res.status).toBe(400)
		expect(res.body).toMatchObject({
			success: false,
			message: "verify-state.messages.invalid-team",
			status_code: 400
		})
		expect(gameFindUniqueMock).not.toHaveBeenCalled()
	})

	it("returns 404 when game does not exist", async () => {
		resetRouteMocks()
		const accessToken = buildAccessToken(91, "session-verify-state-4")
		redisGetMock.mockResolvedValue(JSON.stringify({ userId: 91 }))
		gameFindUniqueMock.mockResolvedValue(null)

		const res = await request(app)
			.post(PATH)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				gameId: "game-1",
				newFen: INITIAL_FEN,
				checkedTeam: "black"
			})

		expect(res.status).toBe(404)
		expect(gameFindUniqueMock).toHaveBeenCalledWith({
			where: { id: "game-1" },
			select: {
				id: true,
				room_id: true,
				room: {
					select: {
						bet_amount: true,
						pve_mode: true,
					}
				}
			}
		})
		expect(res.body).toMatchObject({
			success: false,
			message: "verify-state.messages.game-not-found",
			status_code: 404
		})
	})

	it("returns 200 with check status", async () => {
		resetRouteMocks()
		const accessToken = buildAccessToken(91, "session-verify-state-5")
		redisGetMock.mockResolvedValue(JSON.stringify({ userId: 91 }))
		gameFindUniqueMock.mockResolvedValue({
			id: "game-1",
			room_id: 11n,
			room: {
				bet_amount: 100,
				pve_mode: false,
			}
		})

		const res = await request(app)
			.post(PATH)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				gameId: "game-1",
				newFen: INITIAL_FEN,
				checkedTeam: "black"
			})

		expect(res.status).toBe(200)
		expect(res.body).toMatchObject({
			success: true,
			message: "verify-state.messages.success",
			status_code: 200,
			data: {
				gameEnded: false,
				inCheck: true,
				status: "check",
				checkedTeam: "black",
				winnerId: null
			}
		})
		expect(res.body.data.legalMovesCount).toBeGreaterThan(0)
		expect(runEndGameTransactionMock).not.toHaveBeenCalled()
		// Game continues -> the clock keeps running.
		expect(stopClockMock).not.toHaveBeenCalled()
	})

	it("does not end the game on a plain check (chess has no perpetual-check loss)", async () => {
		resetRouteMocks()
		evaluateTeamStateMock.mockReturnValue({
			inCheck: true,
			legalMovesCount: 2,
			status: "check"
		})

		const accessToken = buildAccessToken(91, "session-verify-state-plain-check")
		redisGetMock.mockResolvedValue(JSON.stringify({ userId: 91 }))
		gameFindUniqueMock.mockResolvedValue({
			id: "game-4",
			room_id: 14n,
			room: { bet_amount: 100, pve_mode: false }
		})

		const res = await request(app)
			.post(PATH)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				gameId: "game-4",
				newFen: INITIAL_FEN,
				checkedTeam: "black"
			})

		expect(res.status).toBe(200)
		expect(res.body.data).toMatchObject({ gameEnded: false, status: "check" })
		expect(runEndGameTransactionMock).not.toHaveBeenCalled()
		expect(stopClockMock).not.toHaveBeenCalled()
	})

	it("ends the game on checkmate, updates latest history winner_id and emits game-ended", async () => {
		resetRouteMocks()
		evaluateTeamStateMock.mockReturnValue({
			inCheck: true,
			legalMovesCount: 0,
			status: "checkmate"
		})
		toArrayGameHistoryMock.mockResolvedValue([{ _id: "mongo-last-id" }])

		const accessToken = buildAccessToken(91, "session-verify-state-checkmate")
		redisGetMock.mockResolvedValue(JSON.stringify({ userId: 91 }))
		gameFindUniqueMock.mockResolvedValue({
			id: "game-1",
			room_id: 11n,
			room: {
				bet_amount: 100,
				pve_mode: false,
			}
		})
		roomUserFindManyMock.mockResolvedValue([
			{ user_id: 91n, team: "white" },
			{ user_id: 92n, team: "black" }
		])

		const res = await request(app)
			.post(PATH)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				gameId: "game-1",
				newFen: INITIAL_FEN,
				checkedTeam: "black"
			})

		expect(res.status).toBe(200)
		expect(runEndGameTransactionMock).toHaveBeenCalledWith({
			gameId: "game-1",
			roomId: 11n,
			winnerId: 91n,
			isBotGame: false,
			betAmount: 100,
			endReason: "checkmate"
		})
		expect(updateOneGameHistoryMock).toHaveBeenCalledWith(
			{ _id: "mongo-last-id" },
			{ $set: { winner_id: 91, end_reason: "checkmate" } }
		)
		expect(emitGameEndedMock).toHaveBeenCalledWith(11, {
			gameId: "game-1",
			status: "checkmate",
			winnerId: 91
		})
		expect(activatePostGameLockMock).toHaveBeenCalledWith(11n, "game-1")
		// Checkmate ends the game -> the countdown clock is stopped.
		expect(stopClockMock).toHaveBeenCalledWith("game-1")
		expect(res.body.data).toMatchObject({
			gameEnded: true,
			status: "checkmate",
			winnerId: 91,
			checkedTeam: "black"
		})
	})

	it("ends the game in a draw on stalemate (no winner)", async () => {
		resetRouteMocks()
		evaluateTeamStateMock.mockReturnValue({
			inCheck: false,
			legalMovesCount: 0,
			status: "stalemate"
		})
		toArrayGameHistoryMock.mockResolvedValue([{ _id: "mongo-last-id-stalemate" }])

		const accessToken = buildAccessToken(91, "session-verify-state-stalemate")
		redisGetMock.mockResolvedValue(JSON.stringify({ userId: 91 }))
		gameFindUniqueMock.mockResolvedValue({
			id: "game-2",
			room_id: 12n,
			room: {
				bet_amount: 200,
				pve_mode: false,
			}
		})
		roomUserFindManyMock.mockResolvedValue([
			{ user_id: 101n, team: "white" },
			{ user_id: 102n, team: "black" }
		])

		const res = await request(app)
			.post(PATH)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				gameId: "game-2",
				newFen: INITIAL_FEN,
				checkedTeam: "white"
			})

		expect(res.status).toBe(200)
		expect(runEndGameTransactionMock).toHaveBeenCalledWith({
			gameId: "game-2",
			roomId: 12n,
			winnerId: null,
			isBotGame: false,
			betAmount: 200,
			endReason: "stalemate"
		})
		expect(updateOneGameHistoryMock).toHaveBeenCalledWith(
			{ _id: "mongo-last-id-stalemate" },
			{ $set: { winner_id: null, end_reason: "stalemate" } }
		)
		expect(emitGameEndedMock).toHaveBeenCalledWith(12, {
			gameId: "game-2",
			status: "stalemate",
			winnerId: null
		})
		expect(activatePostGameLockMock).toHaveBeenCalledWith(12n, "game-2")
		expect(res.body.data).toMatchObject({
			gameEnded: true,
			status: "stalemate",
			winnerId: null,
			checkedTeam: "white"
		})
	})

	it("ends the game in a draw when neither side has mating material left", async () => {
		resetRouteMocks()
		// Not a mate/stalemate: an ordinary position that just became a dead position.
		evaluateTeamStateMock.mockReturnValue({
			inCheck: false,
			legalMovesCount: 5,
			status: "ongoing"
		})
		toArrayGameHistoryMock.mockResolvedValue([{ _id: "mongo-last-id-draw" }])

		const accessToken = buildAccessToken(91, "session-verify-state-draw")
		redisGetMock.mockResolvedValue(JSON.stringify({ userId: 91 }))
		gameFindUniqueMock.mockResolvedValue({
			id: "game-6",
			room_id: 16n,
			room: { bet_amount: 100, pve_mode: false }
		})
		roomUserFindManyMock.mockResolvedValue([
			{ user_id: 301n, team: "white" },
			{ user_id: 302n, team: "black" }
		])

		const res = await request(app)
			.post(PATH)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				gameId: "game-6",
				// Lone kings: neither side can force checkmate.
				newFen: "4k3/8/8/8/8/8/8/4K3",
				checkedTeam: "black"
			})

		expect(res.status).toBe(200)
		// A draw has no winner.
		expect(runEndGameTransactionMock).toHaveBeenCalledWith({
			gameId: "game-6",
			roomId: 16n,
			winnerId: null,
			isBotGame: false,
			betAmount: 100,
			endReason: "draw"
		})
		expect(updateOneGameHistoryMock).toHaveBeenCalledWith(
			{ _id: "mongo-last-id-draw" },
			{ $set: { winner_id: null, end_reason: "draw" } }
		)
		expect(emitGameEndedMock).toHaveBeenCalledWith(16, {
			gameId: "game-6",
			status: "draw",
			winnerId: null
		})
		expect(stopClockMock).toHaveBeenCalledWith("game-6")
		expect(res.body.data).toMatchObject({
			gameEnded: true,
			status: "draw",
			winnerId: null,
			checkedTeam: "black"
		})
	})

	it("ends the game in a draw when the natural move-limit is reached", async () => {
		resetRouteMocks()
		// Ordinary position (attackers still on board), but the no-progress clock is at the limit.
		evaluateTeamStateMock.mockReturnValue({
			inCheck: false,
			legalMovesCount: 5,
			status: "ongoing"
		})
		toArrayGameHistoryMock.mockResolvedValue([
			{ _id: "mongo-last-id-nml", fen: `${INITIAL_FEN} b - - 100 50` }
		])

		const accessToken = buildAccessToken(91, "session-verify-state-nml")
		redisGetMock.mockResolvedValue(JSON.stringify({ userId: 91 }))
		gameFindUniqueMock.mockResolvedValue({
			id: "game-7",
			room_id: 17n,
			room: { bet_amount: 100, pve_mode: false }
		})
		roomUserFindManyMock.mockResolvedValue([
			{ user_id: 401n, team: "white" },
			{ user_id: 402n, team: "black" }
		])

		const res = await request(app)
			.post(PATH)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				gameId: "game-7",
				newFen: INITIAL_FEN,
				checkedTeam: "black"
			})

		expect(res.status).toBe(200)
		expect(runEndGameTransactionMock).toHaveBeenCalledWith({
			gameId: "game-7",
			roomId: 17n,
			winnerId: null,
			isBotGame: false,
			betAmount: 100,
			endReason: "draw"
		})
		expect(emitGameEndedMock).toHaveBeenCalledWith(17, {
			gameId: "game-7",
			status: "draw",
			winnerId: null
		})
		expect(res.body.data).toMatchObject({
			gameEnded: true,
			status: "draw",
			winnerId: null
		})
	})

	it("returns 500 when database throws unexpected error", async () => {
		resetRouteMocks()
		const accessToken = buildAccessToken(91, "session-verify-state-6")
		redisGetMock.mockResolvedValue(JSON.stringify({ userId: 91 }))
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)
		gameFindUniqueMock.mockRejectedValue(new Error("db down"))

		const res = await request(app)
			.post(PATH)
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				gameId: "game-1",
				newFen: INITIAL_FEN,
				checkedTeam: "black"
			})

		expect(res.status).toBe(500)
		expect(res.body).toMatchObject({
			success: false,
			message: "verify-state.messages.internal-server-error",
			status_code: 500
		})
	})
})
