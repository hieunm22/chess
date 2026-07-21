import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { playBotMove } from "./play-bot-move"

const {
	requestBotMoveMock,
	insertOneMock,
	findToArrayMock,
	gameHistoryCreateMock,
	roomFindUniqueMock,
	roomUserFindManyMock,
	gameUpdateMock,
	roomUpdateMock,
	transactionMock,
	emitMovePieceMock,
	emitSurrenderMock,
	evaluateTeamStateMock,
	concludeGameMock
} = vi.hoisted(() => ({
	requestBotMoveMock: vi.fn(),
	insertOneMock: vi.fn(),
	findToArrayMock: vi.fn(),
	gameHistoryCreateMock: vi.fn(),
	roomFindUniqueMock: vi.fn(),
	roomUserFindManyMock: vi.fn(),
	gameUpdateMock: vi.fn(),
	roomUpdateMock: vi.fn(),
	transactionMock: vi.fn(),
	emitMovePieceMock: vi.fn(),
	emitSurrenderMock: vi.fn(),
	evaluateTeamStateMock: vi.fn(),
	concludeGameMock: vi.fn()
}))

vi.mock("./index", () => ({
	BOT_USER_ID: 999n,
	requestBotMove: requestBotMoveMock
}))

vi.mock("../mongodb", () => ({
	getGameHistoryCollection: vi.fn().mockResolvedValue({
		find: () => ({ sort: () => ({ limit: () => ({ toArray: findToArrayMock }) }) }),
		insertOne: insertOneMock
	})
}))

vi.mock("prisma", () => ({
	default: {
		gameHistory: { create: gameHistoryCreateMock },
		room: { findUnique: roomFindUniqueMock, update: roomUpdateMock },
		roomUser: { findMany: roomUserFindManyMock },
		game: { update: gameUpdateMock },
		$transaction: transactionMock
	}
}))

vi.mock("../socket", () => ({
	emitMovePiece: emitMovePieceMock,
	emitSurrender: emitSurrenderMock
}))

vi.mock("../game/state-evaluator", () => ({ evaluateTeamState: evaluateTeamStateMock }))
vi.mock("../game/conclude-game.helper", () => ({ concludeGame: concludeGameMock }))
vi.mock("../game/presence-sync", () => ({ syncPlayersPresence: vi.fn() }))

const INITIAL = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"

const PARAMS = {
	gameId: "game-1",
	roomId: 5n,
	projectFen: INITIAL,
	redFirst: true,
	botTeam: "white" as const,
	difficulty: 1
}

describe("playBotMove end-state handling", () => {
	beforeEach(() => {
		requestBotMoveMock.mockResolvedValue({ newFen: INITIAL, capturePiece: null })
		// A valid chess previous FEN so the real isPawnMove(prevFen, newFen) never throws.
		findToArrayMock.mockResolvedValue([{ fen: `${INITIAL} w - - 0 1` }])
		insertOneMock.mockResolvedValue({ insertedId: { toString: () => "mongo-1" } })
		gameHistoryCreateMock.mockResolvedValue({})
		roomFindUniqueMock.mockResolvedValue({ pve_mode: true, bet_amount: 50 })
		roomUserFindManyMock.mockResolvedValue([])
		transactionMock.mockResolvedValue([])
		concludeGameMock.mockResolvedValue({ ended: true, winnerId: 22 })
		evaluateTeamStateMock.mockReturnValue({ inCheck: false, legalMovesCount: 5, status: "ongoing" })
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	it("auto-surrenders the bot with winner and reason when it has no legal moves", async () => {
		// Bot (white) has no move -> it surrenders; the terminal record must carry the
		// human winner and the surrender reason, like every other end path.
		requestBotMoveMock.mockResolvedValue(null)
		roomUserFindManyMock.mockResolvedValue([
			{ user_id: 22n, team: "black" },
			{ user_id: 999n, team: "white" }
		])

		const result = await playBotMove(PARAMS)

		expect(result).toBeNull()
		expect(insertOneMock).toHaveBeenCalledWith(
			expect.objectContaining({
				game_id: "game-1",
				team: "black",
				surrender_id: 999,
				winner_id: 22,
				end_reason: "surrender"
			})
		)
		expect(emitSurrenderMock).toHaveBeenCalledWith("5", "game-1", 999)
	})

	it("requests the bot move without a rejectMove predicate (no perpetual-check avoidance in chess)", async () => {
		await playBotMove(PARAMS)
		// Second argument (options) is omitted for chess.
		expect(requestBotMoveMock.mock.calls[0][1]).toBeUndefined()
	})

	it("auto-concludes the game (bot wins) when the bot checkmates the human", async () => {
		evaluateTeamStateMock.mockReturnValue({ inCheck: true, legalMovesCount: 0, status: "checkmate" })

		await playBotMove(PARAMS)

		expect(concludeGameMock).toHaveBeenCalledWith({
			gameId: "game-1",
			roomId: 5n,
			winnerTeam: "white",
			isBotGame: true,
			betAmount: 50,
			statusForEvent: "checkmate"
		})
	})

	it("ends the game in a draw when the bot stalemates the human", async () => {
		evaluateTeamStateMock.mockReturnValue({ inCheck: false, legalMovesCount: 0, status: "stalemate" })

		await playBotMove(PARAMS)

		expect(concludeGameMock).toHaveBeenCalledWith({
			gameId: "game-1",
			roomId: 5n,
			winnerTeam: null,
			isBotGame: true,
			betAmount: 50,
			statusForEvent: "stalemate"
		})
	})

	it("ends the game in a draw when the bot's move leaves a dead position", async () => {
		// The bot's capture leaves only the two kings -> neither side can mate.
		requestBotMoveMock.mockResolvedValue({ newFen: "4k3/8/8/8/8/8/8/4K3", capturePiece: "q" })

		await playBotMove(PARAMS)

		expect(concludeGameMock).toHaveBeenCalledWith({
			gameId: "game-1",
			roomId: 5n,
			winnerTeam: null,
			isBotGame: true,
			betAmount: 50,
			statusForEvent: "draw"
		})
	})

	it("ends the game in a draw when the bot's move reaches the 50-move limit", async () => {
		// Prev half-move clock at 99; the bot's non-capturing, non-pawn move makes it 100.
		findToArrayMock.mockResolvedValue([{ fen: `${INITIAL} w - - 99 50` }])
		requestBotMoveMock.mockResolvedValue({ newFen: INITIAL, capturePiece: null })

		await playBotMove(PARAMS)

		expect(concludeGameMock).toHaveBeenCalledWith({
			gameId: "game-1",
			roomId: 5n,
			winnerTeam: null,
			isBotGame: true,
			betAmount: 50,
			statusForEvent: "draw"
		})
	})

	it("does not end the game when the bot's move leaves an ongoing position", async () => {
		evaluateTeamStateMock.mockReturnValue({ inCheck: false, legalMovesCount: 5, status: "ongoing" })

		await playBotMove(PARAMS)

		expect(concludeGameMock).not.toHaveBeenCalled()
	})
})
