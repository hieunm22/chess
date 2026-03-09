import { useEffect, useState, type ChangeEvent } from "react"
import { Link as RouterLink } from "react-router-dom"
import { Link as MuiLink } from "@mui/material"
import {
	Button,
	DialogContent,
	DialogTitle,
	Dialog,
	Divider,
	Grid,
	Switch
} from "@mui/material"
import { COUNTRIES_DROPDOWN, LS_DARKMODE, LS_LANGUAGE } from "common/constant"
import { TTypography } from "components/TranslationTag"
import { ComboBoxWithLabel } from "components/ComboBoxWithLabel"
import i18n from "locales/i18n"
import { translate } from "locales/translate"
import { setDarkMode } from "toolkit/slice/home"
import useToolkit from "hooks/useToolkit"
import "./MenuBar.scss"

function MenuBar() {
	const [language, setLanguage] = useState("en")
	const [openSettings, setOpenSettings] = useState(false)
	const setDarkModeAction = (darkMode: boolean) =>
		dispatch(setDarkMode(darkMode))
	const { state, dispatch } = useToolkit()

	useEffect(() => {
		if (openSettings) {
			const lang = localStorage.getItem(LS_LANGUAGE) || "vi"
			setLanguage(lang)
		}
	}, [openSettings])

	const showSettings = (_: React.MouseEvent<HTMLElement>) => {
		setOpenSettings(true)
	}

	useEffect(() => {
		const isDarkMode = localStorage.getItem(LS_DARKMODE) === "dark"
		setDarkModeAction(isDarkMode)
	}, [])

	const onChangeLanguage = (e: any) => {
		setLanguage(e.target.value)
		i18n.changeLanguage(e.target.value)
		localStorage.setItem(LS_LANGUAGE, e.target.value)
	}

	const toogleDarkMode = (e: ChangeEvent<HTMLElement>) => {
		e.stopPropagation()
		const isDarkMode = localStorage.getItem(LS_DARKMODE) === "dark"
		setDarkModeAction(!isDarkMode)
		localStorage.setItem(LS_DARKMODE, isDarkMode ? "light" : "dark")
	}

	const handleCloseSettings = (
		_: any,
		reason: "backdropClick" | "escapeKeyDown"
	) => {
		if (reason === "escapeKeyDown") {
			setOpenSettings(false)
		}
	}

	const textCenterStyle = {
		display: "flex",
		justifyContent: "center",
		alignItems: "center"
	}

	return (
		<>
			<nav className="menu-bar">
				<div className="menu-bar__links">
					<MuiLink
						color="text.primary"
						component={RouterLink}
						className=""
						underline="hover"
						to="/"
					>
						{translate("menu.home")}
					</MuiLink>
					&nbsp;|&nbsp;
					<MuiLink
						color="text.primary"
						component={RouterLink}
						className=""
						underline="hover"
						to="/history"
					>
						{translate("menu.history")}
					</MuiLink>
					&nbsp;|&nbsp;
					<MuiLink
						color="text.primary"
						component={RouterLink}
						className=""
						underline="hover"
						to="/about"
					>
						{translate("menu.about")}
					</MuiLink>
				</div>

				<Button
					variant="outlined"
					size="small"
					onClick={showSettings}
					startIcon={<i className="fas fa-gear" />}
				>
					{translate("menu.setting.button")}
				</Button>
			</nav>

			<Dialog
				open={openSettings}
				onClose={handleCloseSettings}
				maxWidth="xs"
			>
				<DialogTitle padding="5px 20px !important">
					<TTypography
						content="settings.header"
						sx={textCenterStyle}
					/>
				</DialogTitle>
				<Divider sx={{ my: "5px" }} />
				<DialogContent className="dialog-content">
					<Grid container className="setting-row">
						<TTypography
							sx={{ minWidth: "100px" }}
							content="settings.language"
						/>
						<ComboBoxWithLabel
							id="language"
							options={COUNTRIES_DROPDOWN}
							value={language}
							change={onChangeLanguage}
						/>
					</Grid>
					<Grid container className="setting-row">
						<TTypography content="settings.dark-mode" />
						<Switch
							className="ios-switch"
							checked={state.darkMode}
							onChange={toogleDarkMode}
						/>
					</Grid>
					<Grid container justifyContent="center">
						<Button
							className="btn btn-primary mt-20 center"
							variant="outlined"
							onClick={() => setOpenSettings(false)}
						>
							{translate("settings.close")}
						</Button>
					</Grid>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default MenuBar
