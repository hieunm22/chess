import { useEffect } from "react"
import Tile from "components/Tile"
import { initNewGame } from "common/helper"
import useAutoTitle from "hooks/useAutoTitle"
import useGameToolkit from "hooks/useGameToolkit"
import { setGameState } from "toolkit/slice/game"
import "./Home.scss"

export default function HomePage() {
	useAutoTitle("page.home")
	const { state, dispatch } = useGameToolkit()

	useEffect(() => {
		const gameState = initNewGame()
		dispatch(setGameState(gameState))
	}, [])

	return (
		<div className="game-container">
			<div className="board">
				{state.board.map((element, index) => {
					return <Tile key={index} element={element} index={index} />
				})}
			</div>
		</div>
	)
}
