import { CircularProgress } from "@mui/material"
import { ClaimButtonIconProps } from "../types"

export function ClaimIconButton(props: ClaimButtonIconProps) {
	const { claiming, icon } = props
	return claiming ? <CircularProgress size={20} /> : <i className={`fas ${icon}`} />
}
