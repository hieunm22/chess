import { TTypography } from "components/TranslationTag"
import useAutoTitle from "hooks/useAutoTitle"

export default function HistoryPage() {
	useAutoTitle("page.history.title")
	return (
		<TTypography
			variant="h1"
			align="center"
			content="page.history.title"
		/>
	)
}
