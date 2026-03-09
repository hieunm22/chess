import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { GameState } from "types/GameState"

const initialState: GameState = {
	board: [],
	selected: null,
	availableMoves: [],
  teamTurn: "white",
  animatingPiece: null
}

const gameSlice = createSlice({
	name: "game",
	initialState,
	reducers: {
		setGameState: (state, body: PayloadAction<GameState>) => {
			state.board = body.payload.board
			state.selected = body.payload.selected
			state.availableMoves = body.payload.availableMoves
      state.teamTurn = body.payload.teamTurn
      state.animatingPiece = body.payload.animatingPiece
		}
	}
})

export const { setGameState } = gameSlice.actions

const { reducer } = gameSlice
export default reducer
