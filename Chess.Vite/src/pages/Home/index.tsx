import { useEffect } from "react"
import { Box, Typography } from "@mui/material"
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
			<div className="board">
				{state.board.map((element, index) => {
					return <Tile key={index} element={element} index={index} />
				})}
				<Box className="board-footer" bgcolor="background.default">
					{Array.from({ length: 8 }, (_, i) => (
						<Typography
							color="text.primary"
							key={i}
							className="board-footer-item"
						>
							{String.fromCharCode(65 + i).toLocaleLowerCase()}
						</Typography>
					))}
				</Box>
			</div>
		</div>
	)
}

// div.board>div.board-footer-item*8
