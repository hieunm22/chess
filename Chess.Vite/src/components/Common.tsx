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

function createTransform(props: ElementWithAnimationType) {
	if (!props.$move) {
		return "translate(0, 0)"
	}

	const computedStyle = getComputedStyle(document.documentElement)
	const tileSize = computedStyle.getPropertyValue("--tile-size") || "70px"
	return `translate(calc(${tileSize} * ${props.$dx}), calc(${tileSize} * ${props.$dy}))`
}

function createStyledElementWithColor<T extends ElementType>(BaseComponent: T) {
	return styled(BaseComponent)<ElementWithColorType>`
		${props => props.color ? `color: ${props.color};` : ""};
		background-color: ${props => getTileBackgroundColor(props.$selected, props.$available)};
	`
}

function createAnimatedElement<T extends ElementType>(BaseComponent: T) {
	return styled(BaseComponent)<ElementWithAnimationType>`
		${props => `transform: ${createTransform(props)};`}
	`
}

function createStyledElementWithBGColor<T extends ElementType>(BaseComponent: T) {
	return styled(BaseComponent)<ElementWithColorType>`
		${props => props.color ? `background-color: ${props.color};` : ""};
	`
}

export const StyledTile = createStyledElementWithColor("div")
export const StyledPiece = createAnimatedElement("i")
export const StyledTurn = createStyledElementWithBGColor("span")
