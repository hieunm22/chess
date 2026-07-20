import classnames from "classnames"
import { TI } from "components/TranslationTag"
import { getPieceFromCharacter, getTeamFromPieceChar } from "../common"
import { CapturedPieces, Team } from "types/GameState"

interface CapturedPiecesDisplayProps {
	capturedPieces: CapturedPieces
	team: Team
}

export default function CapturedPiecesDisplay(props: CapturedPiecesDisplayProps) {
	const { capturedPieces, team } = props
	const capturedTeam = team === "white" ? "black" : "white"
	const capturedList = capturedPieces[capturedTeam]

	const containerClass = classnames("captured-pieces-display", `team-${capturedTeam}`)

	return (
		<div className={containerClass}>
			{capturedList.map((symbol, index) => {
				// PieceCharacter (FEN char) -> piece name for the icon + team for the color
				const pieceName = getPieceFromCharacter(symbol)
				const pieceTeam = getTeamFromPieceChar(symbol)
				if (!pieceName) {
					return null
				}

				const pieceClass = classnames(
					"captured-piece fas",
					`fa-chess-${pieceName}`,
					pieceTeam && `team-${pieceTeam}`
				)

				return <TI className={pieceClass} key={`${symbol}-${index}`} />
			})}
		</div>
	)
}
