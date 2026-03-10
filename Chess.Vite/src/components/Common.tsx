import type { ElementType } from "react"
import styled from "styled-components"
import type { ElementWithAnimationType, ElementWithColorType } from "types/Common"

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

const createTransform = (props: ElementWithAnimationType) => {
	if (!props.$move) {
		return "translate(0, 0)"
	}
	const dx = props.$dx * 70
	const dy = props.$dy * 70
	return `translate(${dx}px, ${dy}px)`
}

function createAnimatedElement<T extends ElementType>(BaseComponent: T) {
	return styled(BaseComponent)<ElementWithAnimationType>`
		${props => `transform: ${createTransform(props)};`}
	`
}

export const StyledTile = createStyledElementWithColor("div")
export const StyledPiece = createAnimatedElement("i")
