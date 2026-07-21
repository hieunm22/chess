import classnames from "classnames"
import { Box, Stack } from "@mui/material"
import ConfettiBoom from "react-confetti-boom"
import BotDifficultyPopup from "components/BotDifficulty"
import PageLoader from "components/PageLoader"
import Tile from "components/Tile"
import NotFoundPage from "pages/NotFound"
import CapturedPiecesDisplay from "./components/CapturedPiecesDisplay"
import { GameMenu } from "./components/GameMenu"
import PlayerInfoCard from "./components/PlayerInfoCard"
import PromotionPopup from "./components/PromotionPopup"
import { RoomChatButton } from "./components/RoomChatButton"
import SettingsButton from "./components/SettingsButton"
import useRoomHook from "./hook"
import "./Room.scss"

export default function RoomPage() {
	const {
		availableMoves,
		board,
		capturedPieces,
		checkingPieces,
		clockDisplay,
		currentTurn,
		displayTopUser,
		displayBottomUser,
		game,
		gameButtons,
		isBoardRotated,
		isInGame,
		isRoomLoading,
		previousMove,
		promotionTeam,
		roomChatDialogContext,
		roomSettingsDialogValue,
		selected,
		showConfetti,

		onAnimateEnd,
		onCancelPromotion,
		onPieceClick,
		onPromoteEnd,
		onSelectPromotion,
		startGame
	} = useRoomHook()

	if (isRoomLoading) {
		return <PageLoader />
	}

	if (
		roomSettingsDialogValue.room === null
		|| roomSettingsDialogValue.room.game_type !== "chess"
	) {
		return <NotFoundPage />
	}

	return (
		<Box className="room-container">
			{showConfetti && <ConfettiBoom mode="boom" particleCount={50} />}
			<div className="player-info-row view">
				<div className="player-section top-player">
					<PlayerInfoCard
						user={displayTopUser}
						team={displayTopUser?.team === "black" ? "black" : "white"}
						active={isInGame && currentTurn === displayTopUser?.team}
						botLevel={displayTopUser?.is_bot ? (game?.bot_difficulty ?? null) : null}
						roomHostId={roomSettingsDialogValue.room?.host_id ?? null}
						roomId={roomSettingsDialogValue.room?.id ?? null}
						remainingMs={
							clockDisplay
								? displayTopUser?.team === "black"
									? clockDisplay.blackMs
									: clockDisplay.redMs
								: null
						}
						perMoveMs={
							clockDisplay
								? displayTopUser?.team === "black"
									? clockDisplay.blackPerMoveMs
									: clockDisplay.redPerMoveMs
								: null
						}
						timePerMove={clockDisplay?.timePerMove ?? 0}
					/>
					<CapturedPiecesDisplay
						capturedPieces={capturedPieces}
						team={displayTopUser?.team === "black" ? "black" : "white"}
					/>
				</div>
				<div className="player-section bottom-player">
					<CapturedPiecesDisplay
						capturedPieces={capturedPieces}
						team={displayBottomUser?.team === "black" ? "black" : "white"}
					/>
					<PlayerInfoCard
						user={displayBottomUser}
						team={displayBottomUser?.team === "black" ? "black" : "white"}
						active={isInGame && currentTurn === displayBottomUser?.team}
						botLevel={displayBottomUser?.is_bot ? (game?.bot_difficulty ?? null) : null}
						roomHostId={roomSettingsDialogValue.room?.host_id ?? null}
						roomId={roomSettingsDialogValue.room?.id ?? null}
						remainingMs={
							clockDisplay
								? displayBottomUser?.team === "black"
									? clockDisplay.blackMs
									: clockDisplay.redMs
								: null
						}
						perMoveMs={
							clockDisplay
								? displayBottomUser?.team === "black"
									? clockDisplay.blackPerMoveMs
									: clockDisplay.redPerMoveMs
								: null
						}
						timePerMove={clockDisplay?.timePerMove ?? 0}
					/>
				</div>
			</div>

			<div className="board-container">
				<div className="vertical-index-container">
					{Array.from({ length: 8 }, (_, i) => {
						const trueRow = isBoardRotated ? 7 - i : i
						const verticalIndexClass = classnames({
							"board-index vertical": true,
							"highlight": selected !== null && ~~(selected / 8) === trueRow
						})
						return <div key={i} className={verticalIndexClass} data-content={trueRow + 1} />
					})}
				</div>
				<div className={classnames("chess-board", { "rotated": isBoardRotated })}>
					{board.map((element, index) => {
						return (
							<Tile
								key={index}
								element={element}
								index={index}
								isRotated={isBoardRotated}
								isSelected={selected === index}
								isAvailableMove={availableMoves.includes(index)}
								isPreviousMove={
									previousMove !== null &&
									(previousMove.from === index || previousMove.to === index)
								}
								isChecking={checkingPieces.includes(index)}
								onClick={onPieceClick(index)}
								onAnimateEnd={onAnimateEnd}
								onPromoteEnd={onPromoteEnd}
							/>
						)
					})}
				</div>
			</div>
			<div className="horizontal-index-container">
				{Array.from({ length: 8 }, (_, i) => {
					const trueCol = isBoardRotated ? 7 - i : i
					const char = String.fromCharCode(97 + trueCol)
					const horizontalIndexClass = classnames({
						"board-index horizontal": true,
						"highlight": selected !== null && selected % 8 === trueCol
					})
					return (
						<div key={i} className={horizontalIndexClass} data-content={char} />
					)
				})}
			</div>
			<div className="room-action-row view">
				<GameMenu buttons={gameButtons} />
				<Stack direction={{ xs: "row", sm: "column" }} spacing={1}>
					{!roomChatDialogContext.pveMode && <RoomChatButton {...roomChatDialogContext} />}
					<SettingsButton {...roomSettingsDialogValue} />
				</Stack>
			</div>
			<BotDifficultyPopup onConfirm={startGame} />
			<PromotionPopup
				team={promotionTeam}
				onSelect={onSelectPromotion}
				onCancel={onCancelPromotion}
			/>
		</Box>
	)
}
