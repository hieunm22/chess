import {
	DialogContent,
	DialogTitle,
	Divider,
	Stack
} from "@mui/material"
import classnames from "classnames"
import { PopupState } from "common/enums"
import { ResponsiveDialog } from "components/ResponsiveDialog"
import { TButton, TTypography } from "components/TranslationTag"
import useToolkit from "hooks/useToolkit"
import { translate } from "locales/translate"
import { EmptyVoid } from "types/Common"
import { Team } from "types/GameState"
import { PromotionPiece } from "../types"
import "./PromotionPopup.scss"

interface PromotionPopupProps {
	team: Team | null
	onSelect: (piece: PromotionPiece) => void
	onCancel: EmptyVoid
}

const PROMOTION_CHOICES: { piece: PromotionPiece; icon: string; label: string }[] = [
	{ piece: "q", icon: "queen", label: "game.piece.queen" },
	{ piece: "r", icon: "rook", label: "game.piece.rook" },
	{ piece: "b", icon: "bishop", label: "game.piece.bishop" },
	{ piece: "n", icon: "knight", label: "game.piece.knight" }
]

export const PromotionPopup = (props: PromotionPopupProps) => {
	const { team, onSelect, onCancel } = props
	const { gameState } = useToolkit()
	const isOpen = gameState.popupState === PopupState.PROMOTION

	const onDialogClose = (_: unknown, reason?: "backdropClick" | "escapeKeyDown") => {
		// A choice is required, so ignore backdrop clicks; Escape cancels the move.
		if (reason === "backdropClick") return
		onCancel()
	}

	// `team` is only null in the brief window before a promotion opens; default to white.
	const pieceColorClass = team === "black" ? "black" : "white"

	return (
		<ResponsiveDialog
			drawerAnchor="bottom"
			open={isOpen}
			onClose={onDialogClose}
			maxWidth="xs"
			fullWidth
			disableEnforceFocus
		>
			<DialogTitle className="popup-title">
				<TTypography component="div" className="flex" content="game.promotion.title" />
			</DialogTitle>
			<Divider className="mt-5 mb-5" />
			<DialogContent>
				<TTypography
					component="div"
					className="promotion-subtitle"
					content="game.promotion.subtitle"
				/>
				<Stack direction="row" spacing={1.5} className="promotion-choices">
					{PROMOTION_CHOICES.map(choice => (
						<button
							key={choice.piece}
							type="button"
							className="promotion-choice"
							title={translate(choice.label)}
							aria-label={translate(choice.label)}
							onClick={() => onSelect(choice.piece)}
						>
							<i
								className={classnames(
									"promotion-piece",
									pieceColorClass,
									`fas fa-chess-${choice.icon}`
								)}
							/>
						</button>
					))}
				</Stack>
				<Stack direction="row" sx={{ justifyContent: "center", mt: 2 }}>
					<TButton
						variant="outlined"
						size="medium"
						value="game.promotion.cancel"
						onClick={onCancel}
					/>
				</Stack>
			</DialogContent>
		</ResponsiveDialog>
	)
}

export default PromotionPopup
