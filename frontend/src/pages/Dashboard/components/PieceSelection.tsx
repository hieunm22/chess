import classnames from "classnames"
import { Button, Stack } from "@mui/material"
import { usePieceSelectionContext } from "hooks/useAppContext"
import { PieceButtonProps } from "../types"

const PieceButton = (props: PieceButtonProps) => {
	const { piece } = props
	const { selectedColor, setSelectedColor } = usePieceSelectionContext()
	const active = selectedColor === piece

	return (
		<Button
			variant={active ? "contained" : "outlined"}
			onClick={() => setSelectedColor(piece)}
			className={classnames("dashboard__piece-btn", piece, { active })}
			sx={{
				color: active
					? (piece === "white" ? "common.white" : "background.paper")
					: (piece === "white" ? "error.main" : "text.primary"),
				bgcolor: active
					? (piece === "white" ? "error.main" : "text.primary")
					: "transparent",
				borderColor: piece === "white" ? "error.main" : "divider",
				"&:hover": {
					bgcolor: active
						? (piece === "white" ? "error.dark" : "text.secondary")
						: "action.hover",
					borderColor: piece === "white" ? "error.main" : "text.primary"
				}
			}}
		>
			{piece.charAt(0).toUpperCase() + piece.slice(1)}
		</Button>
	)
}

export const PieceSelection = () => (
	<Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
		<PieceButton piece="white" />
		<PieceButton piece="black" />
	</Stack>
)
