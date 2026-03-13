import { Outlet } from "react-router-dom"
import MenuBar from "components/MenuBar"
import "./Layout.scss"

function Layout() {
	return (
		<>
			<MenuBar />
			<Outlet />
		</>
	)
}

export default Layout
