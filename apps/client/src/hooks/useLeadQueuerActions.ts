import { Match } from "@gameday/models"
import { useState } from "react"

const useLeadQueuerActions = () => {
	const [selectedMatchId, setSelectedMatchId] = useState<string>()
	const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)

	const openLeadQueuerActions = (current: Match) => {
		setSelectedMatchId(current.description)
		setIsDrawerOpen(true)
	}

	return {
		openLeadQueuerActions,
		isDrawerOpen,
		selectedMatchId,
		setIsDrawerOpen,
	}
}

export default useLeadQueuerActions
