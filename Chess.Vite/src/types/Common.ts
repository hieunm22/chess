import type { GameState } from "./GameState"
import type { ReduxState } from "./ReduxState"

export interface ReduxStore {
	home: ReduxState
	game: GameState
}

export interface DropdownProps {
	key: string
	icon?: string
	value: string
	disabled?: boolean
}

export interface ElementWithColorType {
	color: string | null
	$friend?: boolean
	$selected?: boolean
	$available?: boolean
}

export interface ElementWithAnimationType {
	$move: boolean
	$dx: number
	$dy: number
}
