import { ChangeEvent, useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import {
	Box,
	Button,
	CssBaseline,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	Drawer,
	Grid,
	List,
	ListItem,
	ListItemButton,
	Switch,
	Toolbar
} from "@mui/material"
import i18n from "locales/i18n"
import { COUNTRIES_DROPDOWN, LS_DARKMODE, LS_LANGUAGE } from "common/constant"
import { TTypography } from "components/TranslationTag"
import { ComboBoxWithLabel } from "components/ComboBoxWithLabel"
import useToolkit from "hooks/useToolkit"
import { setDarkMode } from "toolkit/slice/home"
import { translate } from "locales/translate"
import "./Layout.scss"

const drawerWidth = 240

export default function Layout() {
	const [mobileOpen, setMobileOpen] = useState(false)
	const navigate = useNavigate()
	
	const [language, setLanguage] = useState("is")
	const [openSettings, setOpenSettings] = useState(false)
	const setDarkModeAction = (darkMode: boolean) => dispatch(setDarkMode(darkMode))
	const { state, dispatch } = useToolkit()

	useEffect(() => {
		if (openSettings) {
			const lang = localStorage.getItem(LS_LANGUAGE) || "vi"
			setLanguage(lang)
		}
	}, [openSettings])

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

	const handleCloseSettings = (_: any, reason: "backdropClick" | "escapeKeyDown") => {
		if (reason === "escapeKeyDown") {
			setOpenSettings(false)
		}
	}

	const textCenterStyle = {
		display: "flex",
		justifyContent: "center",
		alignItems: "center"
	}

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen)
	}

	const menuItems = [
		{ text: "Dashboard", icon: "fa-block-brick", click: () => navigate("/") },
		{ text: "Users", icon: "fa-users", click: () => navigate("/users") },
		{ text: "Analytics", icon: "fa-chart-mixed", click: () => navigate("/analytics") },
		{ text: "menu.setting.button", icon: "fa-gear", click: () => setOpenSettings(true) },
	]

	const drawerContent = (
		<>
			<Toolbar>
				<TTypography variant="h6" noWrap component="div" sx={{ fontWeight: "bold" }} content="Chess" />
			</Toolbar>

			<List>
				{menuItems.map(item => (
					<ListItem key={item.text} disablePadding>
						<ListItemButton onClick={item.click}>
							<i className={`fas ${item.icon} mr-10`} />
							<TTypography content={item.text} sx={{ fontSize: 14 }} />
						</ListItemButton>
					</ListItem>
				))}
			</List>

			<Divider sx={{ mt: "auto" }} />

			<List>
				<ListItem disablePadding>
					<ListItemButton>
            <i className="fas fa-right-from-bracket" />
						<TTypography content="menu.logout" sx={{ fontSize: 14, ml: 1 }} />
					</ListItemButton>
				</ListItem>
			</List>
		</>
	)

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />

			{/* Navigation */}
			<Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
				{/* Mobile drawer - temporary */}
				<Drawer
					variant="temporary"
					open={mobileOpen}
					onClose={handleDrawerToggle}
					ModalProps={{ keepMounted: true }}
					sx={{
						display: { xs: "block", sm: "none" },
						"& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
					}}
				>
					{drawerContent}
				</Drawer>

				{/* Desktop drawer - permanent */}
				<Drawer
					variant="permanent"
					sx={{
						display: { xs: "none", sm: "block" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: drawerWidth,
							borderRight: (theme) => `1px solid ${theme.palette.divider}`,
						},
					}}
					open
				>
					{drawerContent}
				</Drawer>
			</Box>

			{/* Main content */}
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					width: {
            sm: `calc(100% - ${drawerWidth}px)`,
            md: `calc(100% - ${drawerWidth}px)`,
            lg: `calc(100% - ${drawerWidth}px)`,
          },
					p: 1,
				}}
			>
				<Outlet />

				<Dialog
					open={openSettings}
					onClose={handleCloseSettings}
					maxWidth="xs"
				>
					<DialogTitle padding="5px 20px !important">
						<TTypography content="settings.header" sx={textCenterStyle} />
					</DialogTitle>
					<Divider sx={{ my: "5px" }} />
					<DialogContent className="dialog-content">
						<Grid container className="setting-row">
							<TTypography sx={{ minWidth: "100px" }} content="settings.language" />
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
			</Box>
		</Box>
	)
}
