import { useEffect, useRef, useState } from "react"
import {
	Avatar,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	MenuItem,
	Select,
	Slider,
	Tooltip,
	Typography
} from "@mui/material"
import classnames from "classnames"
import { openAlert } from "components/AlertProvider/helper"
import { TTypography } from "components/TranslationTag"
import Tile from "components/Tile"
import CapturedPiecesDisplay from "pages/Room/components/CapturedPiecesDisplay"
import { diffFenMove, getToken, requireImage } from "common/helper"
import { fenToBoard, getCapturedPiecesFromHistory } from "pages/Room/common"
import { EMPTY_BOARD_FEN, INITIAL_FEN } from "pages/Room/constant"
import { GameMovements, RoomUser } from "pages/Room/types"
import { useAPI } from "hooks/useAPI"
import { translate } from "locales/translate"
import { APIResponse, EmptyVoid } from "types/Common"
import { CapturedPieces, Team } from "types/GameState"
import { GameHistoryItem, GameHistoryUser } from "../Layout/types"
import "pages/Room/Room.scss"
import "./GameReplay.scss"

interface GameReplayPopupProps {
	game: GameHistoryItem | null
	onClose: EmptyVoid
}

interface AnimMove {
	from: number
	to: number
}

// Playback speed → wait between moves (higher multiplier = shorter wait).
const SPEED_OPTIONS = [
	{ label: "1x", ms: 1500 },
	{ label: "1.5x", ms: 1000 },
	{ label: "2x", ms: 500 }
]

// Terminal reasons that map to a `page.replay.reason-*` key.
const KNOWN_END_REASONS = new Set([
	"checkmate",
	"stalemate",
	"surrender",
	"leave",
	"draw",
	"timeout",
	"per-move-timeout"
])

// GameHistoryUser lacks the extra RoomUser fields; fill read-only defaults for the avatar.
const toRoomUser = (user: GameHistoryUser | null): RoomUser | null => {
	if (!user) {
		return null
	}
	return {
		id: user.id,
		display_name: user.display_name,
		avatar_url: user.avatar_url,
		back_ready: null,
		team: user.team,
		total_amount: 0,
		is_bot: false
	}
}

export const GameReplayPopup = (props: GameReplayPopupProps) => {
	const { game, onClose } = props
	const { getGameMovementHistory } = useAPI()

	const [positions, setPositions] = useState<string[]>([INITIAL_FEN])
	const [movements, setMovements] = useState<GameMovements[]>([])
	const [step, setStep] = useState(0)
	const [renderIndex, setRenderIndex] = useState(0)
	const [animMove, setAnimMove] = useState<AnimMove | null>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [speed, setSpeed] = useState(SPEED_OPTIONS[0].ms)
	const [loading, setLoading] = useState(false)
	// Fire the game-over alert once per arrival at the final position.
	const endAlertedRef = useRef(false)

	const isOpen = game !== null
	const lastStep = positions.length - 1
	const hasMoves = movements.length > 0

	// Load the game's move list each time a game is opened; positions[0] is the initial
	// board and each later entry is the FEN after that move.
	useEffect(() => {
		if (!game) {
			return
		}

		let cancelled = false
		const load = async () => {
			setLoading(true)
			setStep(0)
			setRenderIndex(0)
			setAnimMove(null)
			setIsPlaying(false)
			const token = getToken()
			const response = await getGameMovementHistory(token, game.game.gameId) as APIResponse<GameMovements[]>
			if (cancelled) {
				return
			}
			const moves = response?.success && response.data ? response.data : []
			const fens = moves.filter(move => typeof move.fen === "string" && move.fen).map(move => move.fen)
			setMovements(moves)
			setPositions([INITIAL_FEN, ...fens])
			setLoading(false)
		}
		load()

		return () => {
			cancelled = true
		}
		// getGameMovementHistory is recreated each render; key the fetch off the game id.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [game?.game.gameId])

	// Drive the board toward `step`: animate a single forward move, snap everything else.
	useEffect(() => {
		if (step === renderIndex) {
			setAnimMove(null)
			return
		}
		if (step === renderIndex + 1 && positions[renderIndex] && positions[step]) {
			const diff = diffFenMove(positions[renderIndex], positions[step])
			if (diff) {
				setAnimMove({ from: diff.oldIndex, to: diff.newIndex })
				return
			}
		}
		// Backward, multi-step jump, castling or en passant → snap without animation.
		setAnimMove(null)
		setRenderIndex(step)
	}, [step, renderIndex, positions])

	// Auto-advance one move per tick while playing; stop at the final position.
	useEffect(() => {
		if (!isPlaying) {
			return
		}
		if (step >= lastStep) {
			setIsPlaying(false)
			return
		}
		const timer = setTimeout(() => setStep(current => current + 1), speed)
		return () => clearTimeout(timer)
	}, [isPlaying, step, lastStep, speed])

	const board = fenToBoard(positions[renderIndex] ?? EMPTY_BOARD_FEN)
	if (animMove) {
		const mover = board[animMove.from]
		if (mover) {
			board[animMove.from] = { ...mover, animateTo: animMove.to }
		}
	}
	// Highlight the move that produced the displayed position (null for castling/en passant).
	const highlight = renderIndex > 0
		? diffFenMove(positions[renderIndex - 1], positions[renderIndex])
		: null

	// First mover (white) sits at the bottom, opponent (black) at the top — as in Room.
	const whiteUser = toRoomUser(game?.users.find(user => user.team === "white") ?? null)
	const blackUser = toRoomUser(game?.users.find(user => user.team === "black") ?? null)
	const toMove: Team = renderIndex % 2 === 0 ? "white" : "black"

	// Captured pieces accumulated up to the displayed position.
	const captured: CapturedPieces = getCapturedPiecesFromHistory(movements.slice(0, renderIndex))

	const lastMovement = hasMoves ? movements[movements.length - 1] : null
	const endReason = lastMovement?.end_reason ?? ""

	// Announce the result with an alert when the replay reaches the final position.
	useEffect(() => {
		const atEnd = renderIndex === lastStep && hasMoves && KNOWN_END_REASONS.has(endReason)
		if (!atEnd) {
			endAlertedRef.current = false
			return
		}
		if (endAlertedRef.current) {
			return
		}
		endAlertedRef.current = true

		const last = movements[movements.length - 1]
		// Surrender/leave name the acting player; other reasons name the winner.
		let actorId: number | null
		if (endReason === "surrender") {
			actorId = last.surrender_id ?? null
		} else if (endReason === "leave") {
			actorId = last.leave ?? null
		} else {
			actorId = last.winner_id ?? game?.game.winner_id ?? null
		}
		const name = game?.users.find(user => user.id === actorId)?.display_name ?? ""
		openAlert({
			title: "page.replay.end-title",
			message: translate(`page.replay.reason-${endReason}`, { name })
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [renderIndex, lastStep, hasMoves, endReason])

	const onAnimateEnd = () => {
		setAnimMove(null)
		setRenderIndex(current => current + 1)
	}

	const goTo = (next: number) => {
		setIsPlaying(false)
		setStep(Math.max(0, Math.min(lastStep, next)))
	}

	const togglePlay = () => {
		if (isPlaying) {
			setIsPlaying(false)
			return
		}
		// Replay from the start when play is pressed on the final position.
		if (step >= lastStep) {
			setRenderIndex(0)
			setAnimMove(null)
			setStep(0)
		}
		setIsPlaying(true)
	}

	const renderPlayer = (user: RoomUser | null, team: Team) => (
		<div className={`replay-player ${team}-player`}>
			<Tooltip title={user?.display_name ?? ""} arrow>
				<Avatar
					className={classnames("replay-avatar", { active: toMove === team })}
					src={requireImage(user?.avatar_url || "")}
					alt={user?.display_name}
				/>
			</Tooltip>
			<CapturedPiecesDisplay capturedPieces={captured} team={team} />
		</div>
	)

	return (
		<Dialog fullScreen open={isOpen} onClose={onClose} className="game-replay-dialog">
			<DialogTitle className="popup-title replay-title">
				<TTypography component="span" content="page.replay.title" />
				<IconButton className="replay-close" onClick={onClose} aria-label="close">
					<i className="fas fa-xmark" />
				</IconButton>
			</DialogTitle>
			<DialogContent className="replay-content">
				<div className="replay-layout">
					<div className="replay-main">
						<div className="board-container">
							<div className="chess-board">
								{board.map((cell, index) => (
									<Tile
										key={index}
										element={cell}
										index={index}
										isRotated={false}
										isPreviousMove={
											highlight !== null &&
											(highlight.oldIndex === index || highlight.newIndex === index)
										}
										onAnimateEnd={onAnimateEnd}
									/>
								))}
							</div>
						</div>
						<div className="replay-players">
							{renderPlayer(blackUser, "black")}
							{renderPlayer(whiteUser, "white")}
						</div>
					</div>

					{!loading && !hasMoves && (
						<TTypography className="replay-no-moves" component="div" content="page.replay.no-moves" />
					)}

					<div className="replay-toolbar">
						<IconButton
							className="replay-play"
							onClick={togglePlay}
							disabled={!hasMoves}
							aria-label={translate(isPlaying ? "page.replay.pause" : "page.replay.play")}
						>
							<i className={isPlaying ? "fas fa-pause" : "fas fa-play"} />
						</IconButton>
						<Select
							className="replay-speed"
							variant="standard"
							value={speed}
							onChange={event => setSpeed(Number(event.target.value))}
						>
							{SPEED_OPTIONS.map(option => (
								<MenuItem key={option.ms} value={option.ms}>{option.label}</MenuItem>
							))}
						</Select>
						<Slider
							className="replay-progress"
							value={step}
							min={0}
							max={Math.max(lastStep, 1)}
							onChange={(_, value) => goTo(value as number)}
							disabled={!hasMoves}
						/>
						<Typography variant="caption" className="replay-counter">
							{step} / {lastStep}
						</Typography>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default GameReplayPopup
