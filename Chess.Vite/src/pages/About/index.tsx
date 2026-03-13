import { TTypography } from "components/TranslationTag"
import useAutoTitle from "hooks/useAutoTitle"

export default function AboutPage() {
	useAutoTitle("page.about.title")
	return <TTypography
		variant="h1"
		align="center"
		content="page.about.title"
	/>
}
