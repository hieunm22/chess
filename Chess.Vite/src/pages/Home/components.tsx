import classnames from "classnames"
import { Empty, StyledPiece, StyledTile } from "components/Common"
import { getAvailableMoves } from "common/helper"
import { setGameState } from "toolkit/slice/game"
import useGameToolkit from "hooks/useGameToolkit"
import type { TileProps } from "./types"

export const Tile = ({ element, index: newIndex }: TileProps) => {
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
		"cursor-pointer": (element.piece !== null && element.team === state.teamTurn)
			|| state.availableMoves.includes(newIndex),
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

const TileContent = (props: TileProps) => {
	const { state, dispatch } = useGameToolkit()
	const { element, index } = props

	const onAnimateEnd = () => {
		const gameStateClone = [...state.board]
		gameStateClone[index] = {
			id: index,
			piece: null,
			team: null
		}
		const toIdx = element.animateTo!
		const isPromotion = state.selected!.piece === "pawn" && (toIdx < 8 || toIdx >= 56)
		const newPieceName = isPromotion ? "queen" : state.selected!.piece

		gameStateClone[toIdx] = {
			id: toIdx,
			piece: newPieceName,
			team: state.selected!.team
		}
		dispatch(setGameState({
			...state,
			board: gameStateClone,
			availableMoves: [],
			selected: null
		}))
	}

	if (state.selected && element.animateTo) {
		const dx = (element.animateTo % 8) - (state.selected.id % 8)
		const dy = ~~(element.animateTo / 8) - ~~(state.selected.id / 8)
		return (
			<StyledPiece
				className={`fas fa-chess-${element.piece} piece`}
				$move
				$dx={dx}
				$dy={dy}
				onTransitionEnd={onAnimateEnd}
			/>
		)
	}

	if (element.piece !== null) {
		return (
			<StyledPiece
				className={`fas fa-chess-${element.piece} piece`}
				$move={false}
				$dx={0}
				$dy={0}
			/>
		)
	}

	return <Empty />
}
