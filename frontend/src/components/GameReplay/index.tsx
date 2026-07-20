import { useEffect, useState } from "react"
import {
	Avatar,
	Box,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	Stack,
	Typography
} from "@mui/material"
import { ResponsiveDialog } from "components/ResponsiveDialog"
import { TButton, TTypography } from "components/TranslationTag"
import Tile from "components/Tile"
import { diffFenMove, getToken, requireImage } from "common/helper"
import { fenToBoard } from "pages/Room/common"
import { EMPTY_BOARD_FEN, INITIAL_FEN } from "pages/Room/constant"
import { GameMovements } from "pages/Room/types"
import { useAPI } from "hooks/useAPI"
import { translate } from "locales/translate"
import { APIResponse, EmptyVoid } from "types/Common"
import { GameHistoryItem } from "../Layout/types"
import "./GameReplay.scss"

interface GameReplayPopupProps {
	game: GameHistoryItem | null
	onClose: EmptyVoid
}

const STEP_INTERVAL_MS = 900

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

export const GameReplayPopup = (props: GameReplayPopupProps) => {
	const { game, onClose } = props
	const { getGameMovementHistory } = useAPI()

	const [positions, setPositions] = useState<string[]>([INITIAL_FEN])
	const [movements, setMovements] = useState<GameMovements[]>([])
	const [step, setStep] = useState(0)
	const [isPlaying, setIsPlaying] = useState(false)
	const [loading, setLoading] = useState(false)

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
	}, [game?.game.gameId])

	// Auto-advance one position per tick while playing; stop at the final position.
	useEffect(() => {
		if (!isPlaying) {
			return
		}
		if (step >= lastStep) {
			setIsPlaying(false)
			return
		}
		const timer = setTimeout(() => setStep(current => current + 1), STEP_INTERVAL_MS)
		return () => clearTimeout(timer)
	}, [isPlaying, step, lastStep])

	const board = fenToBoard(positions[step] ?? EMPTY_BOARD_FEN)
	// Highlight the move that produced the current position (null for castling/en passant).
	const lastMove = step > 0 ? diffFenMove(positions[step - 1], positions[step]) : null

	const goTo = (next: number) => {
		setIsPlaying(false)
		setStep(Math.max(0, Math.min(lastStep, next)))
	}

	const togglePlay = () => {
		// Restart from the beginning if play is pressed on the final position.
		if (step >= lastStep) {
			setStep(0)
		}
		setIsPlaying(playing => !playing)
	}

	// End-of-game banner, shown once the replay reaches the final position.
	const lastMovement = hasMoves ? movements[movements.length - 1] : null
	const endReason = lastMovement?.end_reason ?? ""
	const showEnd = step === lastStep && hasMoves && KNOWN_END_REASONS.has(endReason)
	const resolveEndName = () => {
		if (!showEnd || !game || !lastMovement) {
			return ""
		}
		// Surrender/leave name the acting player; other reasons name the winner.
		let actorId: number | null
		if (endReason === "surrender") {
			actorId = lastMovement.surrender_id ?? null
		} else if (endReason === "leave") {
			actorId = lastMovement.leave ?? null
		} else {
			actorId = lastMovement.winner_id ?? game.game.winner_id
		}
		return game.users.find(user => user.id === actorId)?.display_name ?? ""
	}

	return (
		<ResponsiveDialog
			drawerAnchor="bottom"
			open={isOpen}
			onClose={onClose}
			className="game-replay-dialog"
			maxWidth="xs"
			fullWidth
			disableEnforceFocus
		>
			<DialogTitle className="popup-title">
				<TTypography component="div" className="flex" content="page.replay.title" />
			</DialogTitle>
			<Divider className="mt-5 mb-5" />
			<DialogContent>
				{game && (
					<Stack direction="row" spacing={2} className="replay-players" sx={{ justifyContent: "center" }}>
						{game.users.map(user => (
							<Stack key={user.id} direction="row" spacing={1} sx={{ alignItems: "center" }}>
								<Avatar
									src={requireImage(user.avatar_url)}
									className={`replay-avatar ${user.team ?? ""}`}
									sx={{ width: 28, height: 28 }}
								/>
								<Typography variant="body2">{user.display_name}</Typography>
							</Stack>
						))}
					</Stack>
				)}

				<div className="replay-board">
					{board.map((cell, index) => (
						<Tile
							key={index}
							element={cell}
							index={index}
							isPreviousMove={
								lastMove !== null &&
								(lastMove.oldIndex === index || lastMove.newIndex === index)
							}
						/>
					))}
				</div>

				{showEnd && (
					<Box className="replay-end">
						<TTypography variant="subtitle2" color="primary" content="page.replay.end-title" />
						<Typography variant="body2">
							{translate(`page.replay.reason-${endReason}`, { name: resolveEndName() })}
						</Typography>
					</Box>
				)}

				{!loading && !hasMoves && (
					<TTypography className="replay-no-moves" component="div" content="page.replay.no-moves" />
				)}

				<Stack
					direction="row"
					spacing={1}
					className="replay-controls"
					sx={{ justifyContent: "center", alignItems: "center" }}
				>
					<IconButton onClick={() => goTo(0)} disabled={step === 0} aria-label="first">
						<i className="fas fa-backward-step" />
					</IconButton>
					<IconButton onClick={() => goTo(step - 1)} disabled={step === 0} aria-label="previous">
						<i className="fas fa-caret-left" />
					</IconButton>
					<IconButton
						onClick={togglePlay}
						disabled={!hasMoves}
						aria-label={translate(isPlaying ? "page.replay.pause" : "page.replay.play")}
					>
						<i className={isPlaying ? "fas fa-pause" : "fas fa-play"} />
					</IconButton>
					<IconButton onClick={() => goTo(step + 1)} disabled={step === lastStep} aria-label="next">
						<i className="fas fa-caret-right" />
					</IconButton>
					<IconButton onClick={() => goTo(lastStep)} disabled={step === lastStep} aria-label="last">
						<i className="fas fa-forward-step" />
					</IconButton>
				</Stack>
				<Typography variant="caption" component="div" align="center" className="replay-counter">
					{step} / {lastStep}
				</Typography>

				<Stack direction="row" sx={{ justifyContent: "flex-end", mt: 1 }}>
					<TButton variant="outlined" size="small" value="settings.close" onClick={onClose} />
				</Stack>
			</DialogContent>
		</ResponsiveDialog>
	)
}

export default GameReplayPopup
