import classnames from "classnames"
import { TI } from "components/TranslationTag"
import { CapturedPieces, Team } from "types/GameState"

interface CapturedPiecesDisplayProps {
	capturedPieces: CapturedPieces
	team: Team
}

export default function CapturedPiecesDisplay(props: CapturedPiecesDisplayProps) {
	const { capturedPieces, team } = props
	const capturedTeam = team === "white" ? "black" : "white"
	const capturedList = capturedPieces[team]

	const containerClass = classnames("captured-pieces-display", `team-${capturedTeam}`)

	return (
		<div className={containerClass}>
			{capturedList.map((symbol, index) => {
				return (
					<TI
						className={`captured-piece fas fa-chess-${symbol}`}
						key={`${symbol}-${index}`}
					/>
				)
			})}
		</div>
	)
}
