import { useMemo } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import {
	createTheme,
	CssBaseline,
	ThemeProvider,
	type PaletteMode
} from "@mui/material"
import { LS_DARKMODE } from "common/constant"
import Layout from "components/Layout"
import HomePage from "pages/Home"
import useToolkit from "hooks/useToolkit"
import "App.scss"
import "styles/responsive.scss"
import "styles/common.scss"

function App() {
	const darkMode = localStorage.getItem(LS_DARKMODE) || "light"
	const { state } = useToolkit()

	const createThemeCallback = () =>
		createTheme({
			typography: {
				fontSize: 14
			},
			components: {
				MuiButton: {
					styleOverrides: {
						root: {
							textTransform: "none"
						}
					}
				},
				MuiInputBase: {
					styleOverrides: {
						root: {
							fontSize: "14px"
						}
					}
				},
				MuiListItemText: {
					styleOverrides: {
						primary: {
							fontSize: "14px"
						}
					}
				}
			},
			palette: {
				mode: darkMode as PaletteMode
			}
		})

	const theme = useMemo(createThemeCallback, [state.darkMode])

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Routes>
				<Route element={<Layout />}>
					<Route path="/" element={<HomePage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Route>
			</Routes>
		</ThemeProvider>
	)
}

export default App
