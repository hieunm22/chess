import classnames from "classnames"
import { Empty, StyledPiece, StyledTile } from "components/Common"
import { getAvailableMoves } from "common/helper"
import { setGameState } from "toolkit/slice/game"
import useGameToolkit from "hooks/useGameToolkit"
import { CellProps } from "types/GameState"

type TileProps = {
	element: CellProps | null
	index: number
}

export const Tile = ({ element, index }: TileProps) => {
	const { state, dispatch } = useGameToolkit()

	const onSelected = async () => {
		const gameStateClone = [...state.board]
		// if no piece is selected
		if (state.selected === null || state.selected === null) {
			const availableMoves = getAvailableMoves(
				gameStateClone,
				index,
				state.teamTurn === "black" ? 1 : -1
			)
			dispatch(setGameState({
				...state,
				board: gameStateClone,
				selected: element,
				availableMoves
			}))
			return
		}

		if (state.selected
			&& element !== null
			&& element.team === state.selected.team
		) {
			// if the clicked tile has a piece of the same team, change selected piece
			const availableMoves = getAvailableMoves(
				gameStateClone,
				index,
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
		if (state.availableMoves.includes(index)) {
			// check if the move is a castling move
			const isCastlingMove = state.selected.piece === "king"
				&& Math.abs(state.selected.id - index) === 2
			if (isCastlingMove) {
				if (index - state.selected.id === 2) {
					if (state.selected.team === "white") {
						gameStateClone[63] = {
							id: 63,
							piece: gameStateClone[63]!.piece,
							team: gameStateClone[63]!.team,
							animateTo: 61
						}
					}
					else {
						gameStateClone[7] = {
							id: 7,
							piece: gameStateClone[7]!.piece,
							team: gameStateClone[7]!.team,
							animateTo: 5
						}
					}
				}
				if (index - state.selected.id === -2) {
					if (state.selected.team === "white") {
						gameStateClone[56] = {
							id: 56,
							piece: gameStateClone[56]!.piece,
							team: gameStateClone[56]!.team,
							animateTo: 59
						}
					}
					else {
						gameStateClone[0] = {
							id: 0,
							piece: gameStateClone[0]!.piece,
							team: gameStateClone[0]!.team,
							animateTo: 3
						}
					}
				}
			}
			const oldIndex = state.selected.id
			gameStateClone[oldIndex] = {
				id: oldIndex,
				piece: gameStateClone[oldIndex]!.piece,
				team: gameStateClone[oldIndex]!.team,
				animateTo: index
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
		"cursor-pointer": (element !== null && element.team === state.teamTurn)
			|| state.availableMoves.includes(index)
	})

	const canClick = (element && element.team === state.teamTurn) || state.availableMoves.includes(index)

	return (
		<StyledTile
			className={clsName}
			element={element}
			$index={index}
			$selected={state.selected !== null && state.selected.id === index}
			$available={state.availableMoves.includes(index)}
			onClick={canClick ? onSelected : undefined}
		>
			<TileContent element={element} index={index} />
		</StyledTile>
	)
}

const TileContent = (props: TileProps) => {
	const { state, dispatch } = useGameToolkit()
	const { element, index } = props

	const onAnimateEnd = () => {
		const gameStateClone = [...state.board]
		for (const cell of gameStateClone) {
			if (!cell) continue
			if (cell.animateTo !== undefined) {
				// handle en passant capture for pawns
				const diff = cell.animateTo - cell.id
				if (gameStateClone[cell.id]?.piece === "pawn"
					&& gameStateClone[cell.id + diff] === null // destination cell is empty
				) {
					const isLeftCapture = (diff === -9 || diff === 7)
						&& gameStateClone[cell.id - 1]?.piece === "pawn"
						&& gameStateClone[cell.id - 1]?.team !== gameStateClone[cell.id]?.team
					const isRightCapture = (diff === -7 || diff === 9)
						&& gameStateClone[cell.id + 1]?.piece === "pawn"
						&& gameStateClone[cell.id + 1]?.team !== gameStateClone[cell.id]?.team

					let id = -1

					if (isLeftCapture || isRightCapture) {
						if (isLeftCapture) id = cell.id - 1
						if (isRightCapture) id = cell.id + 1
						gameStateClone[id] = null
					}
				}
				// old position becomes empty
				gameStateClone[cell.id] = null
				gameStateClone[cell.animateTo] = {
					id: cell.animateTo,
					piece: cell.piece,
					team: cell.team
				}
			}
		}
		const toIdx = element!.animateTo!
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
			teamTurn: state.teamTurn === "white" ? "black" : "white"
		}))
		localStorage.setItem("gameState", JSON.stringify(gameStateClone))
	}

	let pieceClass = "piece"
	if (element !== null) {
		pieceClass += ` fas fa-chess-${element.piece}`
		if (element.team === "white") {
			pieceClass += " with-border"
		}
	}

	if (state.selected && element && element.animateTo !== undefined) {
		const dx = (element.animateTo % 8) - (index % 8)
		const dy = ~~(element.animateTo / 8) - ~~(index / 8)
		return (
			<StyledPiece
				className={pieceClass}
				$move
				$dx={dx}
				$dy={dy}
				onTransitionEnd={onAnimateEnd}
			/>
		)
	}

	if (element !== null) {
		return (
			<StyledPiece
				className={pieceClass}
				$move={false}
				$dx={0}
				$dy={0}
			/>
		)
	}

	return <Empty />
}
