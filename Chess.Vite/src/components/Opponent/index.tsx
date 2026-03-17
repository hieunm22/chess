import "./Opponent.scss"

const Opponent = () => {
	const name = `Guest-${Math.floor(Math.random() * 1000000)}`
	return (
		<div className="opponent-container">
			<div className="opponent-avatar">
				<i className="fas fa-user fa-3x" />
			</div>
			<div className="opponent-info">
				<div>{name}</div>
				<div>{name}</div>
			</div>
		</div>
	)
}

export default Opponent
