import useAutoTitle from "hooks/useAutoTitle"
import { translate } from "locales/translate"

export default function PlayPage() {
	useAutoTitle("page.history")
	return <h1>{translate("page.history")}</h1>
}
