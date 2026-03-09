import classnames from "classnames"
import { useEffect, useRef } from "react"
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
	const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		// Cleanup animation timeout on unmount
		return () => {
			if (animationTimeoutRef.current) {
				clearTimeout(animationTimeoutRef.current)
			}
		}
	}, [])

	const onSelected = async () => {
		const gameStateClone = [...state.board]
		if (state.selected !== null && state.selected.piece !== null) {
			// if the clicked tile is an available move, move the piece
			if (state.availableMoves.includes(index)) {
				// check if new index is opponent's king
				const oldIndex = state.selected.id
				const selectedPiece = state.selected.piece
				const selectedTeam = state.selected.team

				// Start animation
				dispatch(setGameState({
					...state,
					animatingPiece: { fromId: oldIndex, toId: index }
				}))

				// After animation completes, update the board
				animationTimeoutRef.current = setTimeout(() => {
					gameStateClone[oldIndex] = {
						...gameStateClone[oldIndex],
						piece: null,
						team: null
					}
					gameStateClone[index] = {
						...gameStateClone[index],
						piece: selectedPiece,
						team: selectedTeam
					}

					const targetTile = gameStateClone[index]
					if (
						targetTile.piece === "king" &&
						targetTile.team !== selectedTeam
					) {
						alert(`${selectedTeam} wins!`)
					}

					const isPromotion =
						selectedPiece === "pawn" && (index < 8 || index >= 56)
					if (isPromotion) {
						gameStateClone[index].piece = "queen" // auto-promote to queen for simplicity
					}

					dispatch(setGameState({
						board: gameStateClone,
						selected: null,
						availableMoves: [],
						teamTurn: selectedTeam === "white" ? "black" : "white",
						animatingPiece: null
					}))
				}, 300)
			}
			else {
				// if the clicked tile is not an available move, select the new piece
				dispatch(setGameState({
					...state,
					selected: null,
					availableMoves: [],
					animatingPiece: null
				}))
			}
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
			teamTurn: state.selected !== null && state.selected.team === "white" ? "black" : "white",
			animatingPiece: null
		}))
	}

	const getTileContent = () => {
		const isAnimatingSource = state.animatingPiece?.fromId === index
		const isAnimatingTarget = state.animatingPiece?.toId === index

		// Show piece at source during animation
		if (isAnimatingSource && state.animatingPiece) {
			return (
				<div className="piece-wrapper animating-source">
					<i className={`fas fa-chess-${state.board[index].piece} piece`} />
				</div>
			)
		}

		// Show piece at destination after animation reaches target
		if (isAnimatingTarget && state.animatingPiece) {
			return (
				<div className="piece-wrapper animating-target">
					<i className={`fas fa-chess-${state.board[state.animatingPiece.fromId].piece} piece`} />
				</div>
			)
		}

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
		"animating-piece": state.animatingPiece?.fromId === index || state.animatingPiece?.toId === index
	})

	const calculateAnimationOffset = () => {
		if (!state.animatingPiece) return { x: 0, y: 0 }

		const fromId = state.animatingPiece.fromId
		const toId = state.animatingPiece.toId

		// 8x8 chess board grid positions
		const fromRow = Math.floor(fromId / 8)
		const fromCol = fromId % 8
		const toRow = Math.floor(toId / 8)
		const toCol = toId % 8

		if (index === fromId) {
			// Move piece from source to target
			const deltaX = (toCol - fromCol) * 100 // 100% per cell (assuming equal tile sizes)
			const deltaY = (toRow - fromRow) * 100
			return { x: deltaX, y: deltaY }
		}

		return { x: 0, y: 0 }
	}

	const offset = calculateAnimationOffset()

	return (
		<StyledTile
			className={clsName}
			color={element.team}
			$friend={element.team === "white"}
			$selected={state.selected !== null && state.selected.id === index}
			$available={state.availableMoves.includes(index)}
			$isAnimating={state.animatingPiece?.fromId === index}
			$translateX={offset.x}
			$translateY={offset.y}
			onClick={onSelected}
		>
			{getTileContent()}
		</StyledTile>
	)
}

export default Tile
