import useGameToolkit from "hooks/useGameToolkit"
import { Team } from "types/GameState"
import "./Opponent.scss"

type OpponentProps = {
	team: Team
	name: string
}

const Opponent = ({ team, name }: OpponentProps) => {
	const { state } = useGameToolkit()
	const styleName = { color: team }
	return (
		<div className="opponent-container" style={styleName}>
			<div className="opponent-avatar">
				<i className="fas fa-user fa-3x" />
			</div>
			<div className="opponent-info">
				<div>{name}</div>
				<div className="captured-pieces">
					{state.capturedPieces[team].map((piece, index) => (
						<i key={index} className={`fas fa-chess-${piece} captured-piece`} />
					))}
				</div>
			</div>
		</div>
	)
}

export default Opponent
