import { useEffect } from "react"
import classnames from "classnames"
import { Tile } from "./components"
import { initNewGame } from "common/helper"
import useAutoTitle from "hooks/useAutoTitle"
import useGameToolkit from "hooks/useGameToolkit"
import { setGameState } from "toolkit/slice/game"
import "./Home.scss"

export default function HomePage() {
	useAutoTitle("page.home.title")
	const { state, dispatch } = useGameToolkit()

	useEffect(() => {
		const gameState = initNewGame()
		dispatch(setGameState(gameState))
	}, [])

	return (
		<div className="game-container">
			<div className="board-container">
				<div className="board">
					{state.board.map(element => {
						return <Tile key={element.id} element={element} />
					})}
				</div>
				<div className="horizontal-index-container">
					{Array.from({ length: 8 }, (_, i) => String.fromCharCode(97 + i)).map((char, index) => {
						const horizontalIndexClass = classnames({
							"board-index horizontal": true,
							"highlight": state.selected && state.selected.id % 8 === index
						})
						return (
							<div key={index} className={horizontalIndexClass} data-content={char} />
						)})}
				</div>
			</div>
		</div>
	)
}
