import { Outlet } from "react-router-dom"
import MenuBar from "components/MenuBar"
import "./Layout.scss"

function Layout() {
	return (
		<div className="layout-wrapper">
			<MenuBar />
			<main className="layout-content">
				<Outlet />
			</main>
		</div>
	)
}

export default Layout
