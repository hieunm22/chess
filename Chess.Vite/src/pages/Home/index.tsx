import { useEffect } from "react"
import { StyledTurn } from "components/Common"
import { TTypography } from "components/TranslationTag"
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
			<div className="match-info">
				<TTypography
					display="inline"
					variant="h6"
					color="text.primary"
					content="home.turn.title"
				/> 
				<StyledTurn className="match-turn" $index={0} color={state.teamTurn} />
			</div>
			<div className="board">
				{state.board.map(element => {
					return <Tile key={element.id} element={element} index={element.id} />
				})}
			</div>
		</div>
	)
}
