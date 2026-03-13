import classnames from "classnames"
import { Empty, StyledPiece, StyledTile } from "components/Common"
import { getAvailableMoves } from "common/helper"
import { setGameState } from "toolkit/slice/game"
import useGameToolkit from "hooks/useGameToolkit"
import { CellProps } from "types/GameState"

type TileProps = {
	element: CellProps
}

export const Tile = ({ element }: TileProps) => {
	const { state, dispatch } = useGameToolkit()

	const onSelected = async () => {
		const gameStateClone = [...state.board]
		// if no piece is selected
		if (state.selected === null || state.selected.piece === null) {
			const availableMoves = getAvailableMoves(
				gameStateClone,
				element.id,
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
		if (state.availableMoves.includes(element.id)) {
			// check if the move is a castling move
			const isCastlingMove = state.selected.piece === "king" && Math.abs(state.selected.id - element.id) === 2
			if (isCastlingMove) {
				if (element.id - state.selected.id === 2) {
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
				if (element.id - state.selected.id === -2) {
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
				animateTo: element.id
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
			|| state.availableMoves.includes(element.id)
	})

	const canClick = element.team === state.teamTurn || state.availableMoves.includes(element.id)
	const verticalIndex = ~~(element.id / 8) + 1
	const verticalIndexClass = classnames({
		"board-index vertical": true,
		"highlight": element.id % 8 === 0
			&& state.selected
			&& ~~(state.selected?.id / 8) + 1 === verticalIndex
	})

	return (
		<>
			{element.id % 8 === 0 &&
				<div className={verticalIndexClass} data-content={verticalIndex} />}
			<StyledTile
				className={clsName}
				color={element.team}
				$index={element.id}
				$selected={state.selected !== null && state.selected.id === element.id}
				$available={state.availableMoves.includes(element.id)}
				onClick={canClick ? onSelected : undefined}
			>
				<TileContent element={element} />
			</StyledTile>
		</>
	)
}

const TileContent = (props: TileProps) => {
	const { state, dispatch } = useGameToolkit()
	const { element } = props

	const onAnimateEnd = () => {
		const gameStateClone = [...state.board]
		for (const cell of gameStateClone) {
			if (cell.animateTo !== undefined) {
				// handle en passant capture for pawns
				if (gameStateClone[cell.id].piece === "pawn") {
					const diff = cell.animateTo - cell.id
					const isLeftCapture =
						(diff === -9 || diff === 7) &&
						gameStateClone[cell.id - 1].piece === "pawn" &&
						gameStateClone[cell.id - 1].team !== gameStateClone[cell.id].team

					const isRightCapture =
						(diff === -7 || diff === 9) &&
						gameStateClone[cell.id + 1].piece === "pawn" &&
						gameStateClone[cell.id + 1].team !== gameStateClone[cell.id].team

					if (isLeftCapture) {
						gameStateClone[cell.id - 1] = {
							id: cell.id - 1,
							piece: null,
							team: null
						}
					}
					if (isRightCapture) {
						gameStateClone[cell.id + 1] = {
							id: cell.id + 1,
							piece: null,
							team: null
						}
					}
				}
				// old position becomes empty
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

	const pieceClass = classnames("piece", {
		[`fas fa-chess-${element.piece}`]: element.piece !== null,
		"with-border": element.team === "white"
	})

	if (state.selected && element.animateTo) {
		const dx = (element.animateTo % 8) - (element.id % 8)
		const dy = ~~(element.animateTo / 8) - ~~(element.id / 8)
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

	if (element.piece !== null) {
		return (
			<StyledPiece
				className={pieceClass}
				$move={false}
				$dx={0}
				$dy={0}
			/>
		)
	}

	if (state.availableMoves.includes(element.id)) {
		return <i className="fas fa-dot-circle" />
	}

	return <Empty />
}
