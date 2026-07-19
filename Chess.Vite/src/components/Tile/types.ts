import { EmptyVoid } from "types/Common"
import { CellProps } from "types/GameState"

export type TileProps = {
	element: CellProps | null
	index: number
	/** Highlight this tile as the currently selected piece. */
	isSelected?: boolean
	/** Mark this tile as a legal destination for the selected piece. */
	isAvailableMove?: boolean
	/** Highlight this tile as part of the last move (its from/to square). */
	isPreviousMove?: boolean
	/** Highlight this tile as a piece currently giving check. */
	isChecking?: boolean
	/** Board is flipped 180°; keep the piece glyph upright by counter-rotating it. */
	isRotated?: boolean
	/** Fired when the tile is clicked. */
	onClick?: EmptyVoid
	/** Fired when the piece finishes sliding to its `animateTo` target. */
	onAnimateEnd?: EmptyVoid
}
