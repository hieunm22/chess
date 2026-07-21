import { EmptyVoid } from "types/Common"
import { CellProps } from "types/GameState"

export type TileProps = {
	element: CellProps | null
	index: number
	isSelected?: boolean
	isAvailableMove?: boolean
	isPreviousMove?: boolean
	isChecking?: boolean
	/** Board is flipped 180°; keep the piece glyph upright by counter-rotating it. */
	isRotated?: boolean
	onClick?: EmptyVoid
	onAnimateEnd?: EmptyVoid
	onPromoteEnd?: EmptyVoid
}
