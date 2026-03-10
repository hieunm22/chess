import { Empty, StyledPiece } from "components/Common"
import useGameToolkit from "hooks/useGameToolkit"
import { TileProps } from "./types"
import { setGameState } from "toolkit/slice/game"

export const TileContent = (props: TileProps) => {
	const { state, dispatch } = useGameToolkit()
	const { element, index } = props

	const onAnimateEnd = () => {
		const gameStateClone = [...state.board]
		gameStateClone[index] = {
			id: index,
			piece: null,
			team: null
		}
		gameStateClone[element.animateTo!] = {
			id: element.animateTo!,
			piece: state.selected!.piece,
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
		const dx = element.animateTo % 8 - state.selected.id % 8
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

