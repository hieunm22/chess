import classnames from "classnames"
import { PieceCharacter } from "types/GameState"
import { TileProps } from "./types"
import "./Tile.scss"

// FEN char (case-insensitive) -> Font Awesome chess icon suffix
const PIECE_ICON: Record<string, string> = {
	k: "king",
	q: "queen",
	b: "bishop",
	n: "knight",
	r: "rook",
	p: "pawn"
}

// In FEN, uppercase = white, lowercase = black
const isWhitePiece = (piece?: PieceCharacter | null) => piece && piece === piece.toUpperCase()

const Tile = ({
	element,
	index,
	isSelected = false,
	isAvailableMove = false,
	isPreviousMove = false,
	isChecking = false,
	isRotated = false,
	onClick,
	onAnimateEnd,
	onPromoteEnd,
}: TileProps) => {
	const row = Math.floor(index / 8)
	const col = index % 8
	const isLight = (row + col) % 2 === 0

	const piece = element?.piece ?? null
	const iconName = piece ? PIECE_ICON[piece.toLowerCase()] : null
	// A legal move onto an occupied square is a capture (ring); onto an empty one is a dot.
	const isCaptureMove = isAvailableMove && piece !== null

	// A move in progress: this cell's piece slides toward `animateTo`, and fires
	// `onAnimateEnd` when the slide finishes so the parent can commit the move.
	const targetIndex = element?.animateTo
	const isAnimating = targetIndex !== undefined

	const promoteTo = element?.promoteTo
	const promoteIcon = promoteTo ? PIECE_ICON[promoteTo.toLowerCase()] : null
	const isPromoting = promoteTo !== undefined

	// The board flips via a 180° rotation on the container; the slide translate is in
	// board space (applied first), then the counter-rotation keeps the glyph upright.
	const transforms: string[] = []
	if (targetIndex !== undefined) {
		const dx = (targetIndex % 8) - col
		const dy = Math.floor(targetIndex / 8) - row
		transforms.push(`translate(calc(${dx} * 100%), calc(${dy} * 100%))`)
	}
	if (isRotated) {
		transforms.push("rotate(180deg)")
	}
	const pieceStyle = transforms.length > 0 ? { transform: transforms.join(" ") } : undefined

	const cellClass = classnames("tile", {
		"light": isLight,
		"dark": !isLight,
		"interactive": !!onClick,
		"previous-move": isPreviousMove,
		"selected": isSelected,
		"capture": isCaptureMove,
		"checking": isChecking,
		"animating": isAnimating,
		"promoting": isPromoting,
	})

	const morphOutClass = classnames(
		"tile-piece morph-out",
		isWhitePiece(piece) ? "white" : "black",
		`fas fa-chess-${iconName}`
	)
	const morphInClass = classnames(
		"tile-piece morph-in",
		isWhitePiece(promoteTo) ? "white" : "black",
		`fas fa-chess-${promoteIcon}`
	)
	const tilePieceClass = classnames(
		"tile-piece",
		isWhitePiece(piece) ? "white" : "black",
		`fas fa-chess-${iconName}`
	)

	return (
		<div className={cellClass} onClick={onClick}>
			{isPromoting && piece && iconName && promoteIcon ? (
				<span
					className="tile-morph"
					style={isRotated ? { transform: "rotate(180deg)" } : undefined}
				>
					<i className={morphOutClass} />
					<i className={morphInClass} onAnimationEnd={onPromoteEnd} />
				</span>
			) : piece && iconName && (
				<i
					className={tilePieceClass}
					style={pieceStyle}
					onTransitionEnd={isAnimating ? onAnimateEnd : undefined}
				/>
			)}
			{isAvailableMove && !isCaptureMove && <span className="tile-move-dot" />}
		</div>
	)
}

export default Tile
