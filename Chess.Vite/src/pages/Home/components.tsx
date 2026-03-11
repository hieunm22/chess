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
				...state,
				board: gameStateClone,
				selected: element,
				availableMoves
			}))
			return
		}

		// if the clicked tile is an available move, move the piece
		if (state.availableMoves.includes(newIndex)) {
			// check if the move is a castling move
			const isCastlingMove = state.selected.piece === "king" && Math.abs(state.selected.id - newIndex) === 2
			if (isCastlingMove) {
				if (newIndex - state.selected.id === 2) {
					if (state.selected.team === "white") {
						gameStateClone[63] = {
							...gameStateClone[63],
							animateTo: 61
						}
					}
					else {
						gameStateClone[7] = {
							...gameStateClone[7],
							animateTo: 5
						}
					}
				}
				if (newIndex - state.selected.id === -2) {
					if (state.selected.team === "white") {
						gameStateClone[56] = {
							...gameStateClone[56],
							animateTo: 59
						}
					}
					else {
						gameStateClone[0] = {
							...gameStateClone[0],
							animateTo: 3
						}
					}
				}
			}
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
			|| state.availableMoves.includes(newIndex)
	})

  const canClick = element.team === state.teamTurn || state.availableMoves.includes(newIndex)

	return (
		<StyledTile
			className={clsName}
			color={element.team}
			$index={newIndex}
			$selected={state.selected !== null && state.selected.id === newIndex}
			$available={state.availableMoves.includes(newIndex)}
			onClick={canClick ? onSelected : undefined}
		>
			<TileContent element={element} index={newIndex} />
		</StyledTile>
	)
}

const TileContent = (props: TileProps) => {
	const { state, dispatch } = useGameToolkit()
	const { element } = props

	const onAnimateEnd = () => {
		const gameStateClone = [...state.board]
		for (const cell of gameStateClone) {
			if (cell.animateTo !== undefined) {
				gameStateClone[cell.id] = {
					id: cell.id,
					piece: null,
					team: null
				}
				gameStateClone[cell.animateTo] = {
					id: cell.animateTo,
					piece: cell.piece,
					team: cell.team
				}
			}
		}
		const toIdx = element.animateTo!
		const isPromotion = state.selected!.piece === "pawn" && (toIdx < 8 || toIdx >= 56)
		if (isPromotion) {
			const newPieceName = isPromotion ? "queen" : state.selected!.piece
			gameStateClone[toIdx] = {
				id: toIdx,
				piece: newPieceName,
				team: state.selected!.team
			}
		}
		dispatch(setGameState({
			board: gameStateClone,
			selected: null,
			availableMoves: [],
			teamTurn: state.teamTurn === "white" ? "black" : "white",
		}))
	}

	if (state.availableMoves.includes(element.id)) {
		return <i className="fas fa-dot-circle" />
	}

  const prefix = element.team === "white" ? "far" : "fad"

	if (state.selected && element.animateTo) {
		const dx = (element.animateTo % 8) - (element.id % 8)
		const dy = ~~(element.animateTo / 8) - ~~(element.id / 8)
		return (
			<StyledPiece
				className={`${prefix} fa-chess-${element.piece} piece`}
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
				className={`${prefix} fa-chess-${element.piece} piece`}
				$move={false}
				$dx={0}
				$dy={0}
			/>
		)
	}

	return <Empty />
}
