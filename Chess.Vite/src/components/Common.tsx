import type { ElementType } from "react"
import styled from "styled-components"
import type { ElementWithColorType } from "types/Common"

export const Empty = () => <></>

function getTileBackgroundColor(selected?: boolean, available?: boolean) {
	if (available) {
		return "#e9cfa4"
	}
	return selected !== true ? "#b58863" : "#f0d9b5"
}

function createStyledElementWithColor<T extends ElementType>(BaseComponent: T) {
	return styled(BaseComponent)<ElementWithColorType>`
		${props => props.color ? `color: ${props.color};` : ""};
		background-color: ${props => getTileBackgroundColor(props.$selected, props.$available)};
	`
}

export const StyledTile = createStyledElementWithColor("div")
