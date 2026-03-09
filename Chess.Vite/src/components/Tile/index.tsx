import classnames from "classnames"
import { Empty, StyledTile } from "components/Common"
import { getAvailableMoves } from "common/helper"
import { setGameState } from "toolkit/slice/game"
import useGameToolkit from "hooks/useGameToolkit"
import type { Tile } from "types/GameState"

type TileProps = {
	element: Tile
	index: number
}

const Tile = ({ element, index }: TileProps) => {
	const { state, dispatch } = useGameToolkit()

	const onSelected = async () => {
		const gameStateClone = [...state.board]
		if (state.selected !== null && state.selected.piece !== null) {
			// if the clicked tile is an available move, move the piece
			if (state.availableMoves.includes(index)) {
				// const previousCellIdx = state.selected.id
				// const dx = (index % 8) - (previousCellIdx % 8)
				// const dy = ~~(index / 8) - ~~(previousCellIdx / 8)

				// check if new index is opponent's king
				const oldIndex = state.selected.id
				gameStateClone[oldIndex] = {
					...gameStateClone[oldIndex],
					piece: null,
					team: null
				}
				gameStateClone[index] = {
					...gameStateClone[index],
					piece: state.selected.piece,
					team: state.selected.team
				}

				const targetTile = gameStateClone[index]
				if (targetTile.piece === "king" && targetTile.team !== state.selected.team) {
					alert(`${state.selected.team} wins!`)
				}
				
				const isPromotion = state.selected.piece === "pawn" && (index < 8 || index >= 56)
				if (isPromotion) {
					gameStateClone[index].piece = "queen" // auto-promote to queen for simplicity
				}
			}
			dispatch(setGameState({
				board: gameStateClone,
				selected: null,
				availableMoves: [],
				teamTurn: state.selected.team === "white" ? "black" : "white"
			}))
			return
		}
		const availableMoves = getAvailableMoves(
			gameStateClone,
			index,
			element.team === "black" ? 1 : -1
		)
		dispatch(setGameState({
			board: gameStateClone,
			selected: element,
			availableMoves,
			teamTurn: state.selected !== null && state.selected.team === "white" ? "black" : "white"
		}))
	}

	const getTileContent = () => {
		if (element.piece !== null) {
			return (
				<i className={`fas fa-chess-${element.piece} piece`} />
			)
		}

		if (state.availableMoves.includes(index)) {
			return (
				<i className="fas fa-dot-circle available" />
			)
		}

		return <Empty />
	}

	const clsName = classnames("cell", {
		"cursor-pointer": element.piece !== null || state.availableMoves.includes(index),
		// "available": state.availableMoves.includes(index) && (element.piece === null || element.team !== state.teamTurn),
		// "capture": state.availableMoves.includes(index) && element.piece !== null
	})

	return (
		<StyledTile
			className={clsName}
			color={element.team}
			$friend={element.team === "white"}
			$selected={state.selected !== null && state.selected.id === index}
			$available={state.availableMoves.includes(index)}
			onClick={onSelected}
			title={index.toString()}
		>
			{getTileContent()}
		</StyledTile>
	)
}

export default Tile
