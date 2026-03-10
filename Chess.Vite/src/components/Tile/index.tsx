import classnames from "classnames"
import { StyledTile } from "components/Common"
import { TileContent } from "./components"
import { getAvailableMoves } from "common/helper"
import { setGameState } from "toolkit/slice/game"
import useGameToolkit from "hooks/useGameToolkit"
import type { Tile } from "types/GameState"
import { TileProps } from "./types"

const Tile = ({ element, index: newIndex }: TileProps) => {
	const { state, dispatch } = useGameToolkit()

	const onSelected = async () => {
		const gameStateClone = [...state.board]
		// if no piece is selected
		if (state.selected === null || state.selected.piece === null) {
			const availableMoves = getAvailableMoves(
				gameStateClone,
				newIndex,
				element.team === "black" ? 1 : -1
			)
			dispatch(setGameState({
				board: gameStateClone,
				selected: element,
				availableMoves,
				teamTurn: state.selected !== null && state.selected.team === "white" ? "black" : "white"
			}))
			return
		}
		
		// if the clicked tile is an available move, move the piece
		if (state.availableMoves.includes(newIndex)) {
			// check if new index is opponent's king
			const oldIndex = state.selected.id
			gameStateClone[oldIndex] = {
				...gameStateClone[oldIndex],
				animateTo: newIndex
			}
			dispatch(setGameState({
				...state,
				board: gameStateClone
			}))
		}
		else {
			// if the clicked tile is not an available move, de-select current piece
			dispatch(setGameState({
				...state,
				selected: null,
				availableMoves: []
			}))
		}
	}

	const clsName = classnames("cell", {
		"cursor-pointer": element.piece !== null || state.availableMoves.includes(newIndex),
	})

	return (
		<StyledTile
			className={clsName}
			color={element.team}
			$friend={element.team === "white"}
			$selected={state.selected !== null && state.selected.id === newIndex}
			$available={state.availableMoves.includes(newIndex)}
			onClick={onSelected}
		>
			<TileContent element={element} index={newIndex} />
		</StyledTile>
	)
}

export default Tile
