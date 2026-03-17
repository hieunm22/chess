import { useEffect } from "react"
import classnames from "classnames"
import { LS_BOARD, LS_TURN } from "common/constant"
import Opponent from "components/Opponent"
import Tile from "components/Tile"
import { initNewGame } from "common/helper"
import useAutoTitle from "hooks/useAutoTitle"
import useGameToolkit from "hooks/useGameToolkit"
import { setGameState } from "toolkit/slice/game"
import { Team } from "types/GameState"
import "./Home.scss"

export default function HomePage() {
	useAutoTitle("page.home.title")
	const { state, dispatch } = useGameToolkit()

	useEffect(() => {
		try {
			const board = localStorage.getItem(LS_BOARD)
			const turn = localStorage.getItem(LS_TURN)
			const boardObj = JSON.parse(board || "")
			const isValidBoard =
				Array.isArray(boardObj) &&
				boardObj.length === 64 &&
				boardObj.every(
					item =>
						item === null ||
						typeof item.id === "number" ||
						typeof item.piece === "string" ||
						typeof item.team === "string"
				)
			if (!isValidBoard) {
				newGame()
				return
			}
			const teamTurn = turn === "white" || turn === "black" ? (turn as Team) : ("white" as Team)
			const gameState = {
				board: boardObj,
				selected: null,
				availableMoves: [],
				teamTurn,
        capturedPieces: {
					white: [],
					black: []
				}
			}
			dispatch(setGameState(gameState))
		} catch (error) {
			newGame()
			return
		}
	}, [])

	useEffect(() => {
		if (state.teamTurn) {
			localStorage.setItem(LS_TURN, state.teamTurn)
		}
	}, [state.teamTurn])

	useEffect(() => {
		localStorage.setItem(LS_BOARD, JSON.stringify(state.board))
	}, [state.board])

	const newGame = () => {
		const gameState = initNewGame()
		dispatch(setGameState(gameState))
	}

	return (
		<div className="game-container">
			<Opponent />
			<div className="board-container">
				<div className="vertical-index-container">
					{Array.from({ length: 8 }, (_, i) => {
						const verticalIndexClass = classnames({
							"board-index vertical": true,
							"highlight": state.selected && ~~(state.selected.id / 8) === i
						})
						return <div key={i} className={verticalIndexClass} data-content={i + 1} />
					})}
				</div>
				<div className="board">
					{state.board.map((element, index) => {
						return <Tile key={index} index={index} element={element} />
					})}
				</div>
			</div>
			<div className="horizontal-index-container">
				{Array.from({ length: 8 }, (_, i) => String.fromCharCode(97 + i)).map(
					(char, index) => {
						const horizontalIndexClass = classnames({
							"board-index horizontal": true,
							"highlight": state.selected && state.selected.id % 8 === index
						})
						return (
							<div key={index} className={horizontalIndexClass} data-content={char} />
						)
					}
				)}
			</div>
			<Opponent />
		</div>
	)
}
