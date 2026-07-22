import {
	Box,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from "@mui/material"
import parse from "html-react-parser"
import { TTypography } from "components/TranslationTag"
import { translate } from "locales/translate"
import "./Guide.scss"

export const Guide = () => {
	const pieceSymbols = [
		{ icon: "king", name: translate("guide.piece.king"), count: 1 },
		{ icon: "queen", name: translate("guide.piece.queen"), count: 1 },
		{ icon: "bishop", name: translate("guide.piece.bishop"), count: 2 },
		{ icon: "knight", name: translate("guide.piece.knight"), count: 2 },
		{ icon: "rook", name: translate("guide.piece.rook"), count: 2 },
		{ icon: "pawn", name: translate("guide.piece.pawn"), count: 8 },
	]

	return (
		<Box className="guide-popup">
			{/* Objective */}
			<TTypography variant="h5" className="section" content="guide.section.objective" />
			<Typography component="div">
				{parse(translate("guide.objective.paragraph1"))}
			</Typography>

			{/* Pieces */}
			<TTypography variant="h5" className="section" content="guide.section.pieces" />
			<Typography component="div">
				{parse(translate("guide.pieces.paragraph1"))}
			</Typography>
			<TableContainer className="piece-table">
				<Table border={1}>
					<TableHead>
						<TableRow className="table-header">
							<TableCell>{translate("guide.table.piece")}</TableCell>
							<TableCell>{translate("guide.table.symbol")}</TableCell>
							<TableCell>{translate("guide.table.quantity")}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{pieceSymbols.map(piece => (
							<TableRow key={piece.name}>
								<TableCell>{piece.name}</TableCell>
								<TableCell>
									<Box className="piece-chip">
										<Chip
											label={<i className={`piece-icon fas fa-chess-${piece.icon}`} />}
											className="piece-white sample"
											title={piece.name}
										/>
										<Chip
											label={<i className={`piece-icon fas fa-chess-${piece.icon}`} />}
											className="piece-black sample"
											title={piece.name}
										/>
									</Box>
								</TableCell>
								<TableCell>{piece.count}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Moving Pieces */}
			<TTypography variant="h5" className="section" content="guide.section.moving-pieces" />
			<Typography component="div">
				{parse(translate("guide.moving-pieces.paragraph1"))}
			</Typography>

			{/* King */}
			<TTypography variant="subtitle1" className="paragraph" content="guide.king.paragraph1" />
			<Typography component="div">
				{parse(translate("guide.king.paragraph2"))}
			</Typography>

			{/* Queen */}
			<TTypography variant="subtitle1" className="paragraph" content="guide.queen.paragraph1" />
			<Typography component="div">
				{parse(translate("guide.queen.paragraph2"))}
			</Typography>

			{/* Bishop */}
			<TTypography variant="subtitle1" className="paragraph" content="guide.bishop.paragraph1" />
			<Typography component="div">
				{parse(translate("guide.bishop.paragraph2"))}
			</Typography>

			{/* Rook */}
			<TTypography variant="subtitle1" className="paragraph" content="guide.rook.paragraph1" />
			<Typography component="div">
				{parse(translate("guide.rook.paragraph2"))}
			</Typography>

			{/* Knight */}
			<TTypography variant="subtitle1" className="paragraph" content="guide.knight.paragraph1" />
			<Typography component="div">
				{parse(translate("guide.knight.paragraph2"))}
			</Typography>

			{/* Pawn */}
			<TTypography variant="subtitle1" className="paragraph" content="guide.pawn.paragraph1" />
			<Typography component="div">
				{parse(translate("guide.pawn.paragraph2"))}
			</Typography>

			{/* Special moves */}
			<TTypography variant="subtitle1" className="paragraph" content="guide.special-moves.paragraph1" />
			<Typography component="div" className="list-item">
				{parse(translate("guide.special-moves.paragraph2"))}
			</Typography>
			<Typography component="div" className="list-item">
				{parse(translate("guide.special-moves.paragraph3"))}
			</Typography>
			<Typography component="div" className="list-item">
				{parse(translate("guide.special-moves.paragraph4"))}
			</Typography>

			{/* Capturing */}
			<TTypography variant="h5" className="section" content="guide.section.capturing" />
			<Typography component="div" className="list-item">
				{parse(translate("guide.capturing.paragraph1"))}
			</Typography>
			<Typography component="div" className="list-item">
				{parse(translate("guide.capturing.paragraph2"))}
			</Typography>
			<Typography component="div" className="list-item">
				{parse(translate("guide.capturing.paragraph3"))}
			</Typography>

			{/* Check */}
			<TTypography variant="h5" className="section" content="guide.section.check" />
			<Typography component="div">
				{parse(translate("guide.check.paragraph1"))}
			</Typography>
			<Typography component="div">
				{parse(translate("guide.check.paragraph2"))}
			</Typography>
			<Typography component="div" className="list-item">
				{parse(translate("guide.check.paragraph3"))}
			</Typography>
			<Typography component="div" className="list-item">
				{parse(translate("guide.check.paragraph4"))}
			</Typography>
			<Typography component="div" className="list-item">
				{parse(translate("guide.check.paragraph5"))}
			</Typography>
			<Typography component="div" className="list-item">
				{parse(translate("guide.check.paragraph6"))}
			</Typography>

			{/* Result */}
			<TTypography variant="h5" className="section" content="guide.section.result" />
			<Typography component="div" className="list-item">
				{parse(translate("guide.result.paragraph1"))}
			</Typography>
			<Typography component="div" className="list-item">
				{parse(translate("guide.result.paragraph2"))}
			</Typography>
			<Typography component="div" className="list-item">
				{parse(translate("guide.result.paragraph3"))}
			</Typography>
			<Typography component="div" className="list-item">
				{parse(translate("guide.result.paragraph4"))}
			</Typography>
			<Typography component="div" className="list-item">
				{parse(translate("guide.result.paragraph5"))}
			</Typography>
		</Box>
	)
}
