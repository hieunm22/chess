import classnames from "classnames"
import { Button, Stack } from "@mui/material"
import { usePieceSelectionContext } from "hooks/useAppContext"
import { PieceButtonProps } from "../types"

const PieceButton = (props: PieceButtonProps) => {
	const { team } = props
	const { selectedColor, setSelectedColor } = usePieceSelectionContext()
	const active = selectedColor === team

	return (
		<Button
			variant={active ? "contained" : "outlined"}
			onClick={() => setSelectedColor(team)}
			className={classnames("dashboard__piece-btn", { active })}
		>
			<i className={`fas fa-chess-king team-${team}`} />
		</Button>
	)
}

export const PieceSelection = () => (
	<Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
		<PieceButton team="white" />
		<PieceButton team="black" />
	</Stack>
)
