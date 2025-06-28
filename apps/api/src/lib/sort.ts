import { Match, RematchAnchorPoint } from "@gameday/models"

export const sortMatchesWithAnchored = (matches: Match[]): Match[] => {
	const anchoredMatches = matches.filter(
		(m): m is typeof m & { rematchAnchorPoint: RematchAnchorPoint } =>
			!!m.rematchAnchorPoint,
	)
	const baseMatches = matches.filter((m) => !m.rematchAnchorPoint)

	// Step 1: Sort base matches
	const baseSorted = [...baseMatches].sort(sortMatchesAsc)

	// Step 2: Create a lookup for anchors
	const anchorsByTarget: Record<
		string,
		(Match & { rematchAnchorPoint: RematchAnchorPoint })[]
	> = {}

	for (const match of anchoredMatches) {
		const key =
			match.rematchAnchorPoint.type === "after_last_qual"
				? "after_last_qual"
				: match.rematchAnchorPoint.breakId
		if (!anchorsByTarget[key]) anchorsByTarget[key] = []
		anchorsByTarget[key].push(match)
	}

	// Step 3: Sort anchored matches by order
	for (const key in anchorsByTarget) {
		anchorsByTarget[key]?.sort((a, b) => {
			const levelOrder = {
				before_break: 0,
				after_break: 1,
				after_last_qual: 2,
			}
			if (a.rematchAnchorPoint.type !== b.rematchAnchorPoint.type) {
				return (
					levelOrder[a.rematchAnchorPoint.type] -
					levelOrder[b.rematchAnchorPoint.type]
				)
			}
			return a.rematchAnchorPoint.order - b.rematchAnchorPoint.order
		})
	}

	// Step 4: Anchored matches
	const finalSorted: Match[] = []

	for (const match of baseSorted) {
		finalSorted.push(match)
		const anchors = anchorsByTarget[match.description]
		if (anchors) {
			finalSorted.push(...anchors)
		}
	}

	const anchorsAfterLastQual = anchorsByTarget["after_last_qual"]
	if (anchorsAfterLastQual) {
		finalSorted.push(...anchorsAfterLastQual)
	}

	return finalSorted
}

type PartialMatchForSort = Pick<
	Match,
	"matchNumber" | "series" | "tournamentLevel" | "rematchAnchorPoint"
>

export const sortMatchesAsc: (
	matchA: PartialMatchForSort,
	matchB: PartialMatchForSort,
) => number = (
	{ matchNumber: aMn, series: aS, tournamentLevel: aTL },
	{ matchNumber: bMn, series: bS, tournamentLevel: bTL },
) => {
	const levelOrder = { QUALIFICATION: 0, PLAYOFF: 1 }
	const aLevel = levelOrder[aTL]
	const bLevel = levelOrder[bTL]
	if (aLevel !== bLevel) return aLevel - bLevel
	if (aS !== bS) return aS - bS
	return aMn - bMn
}

export const sortMatchesDesc: (
	matchA: PartialMatchForSort,
	matchB: PartialMatchForSort,
) => number = (a, b) => sortMatchesAsc(a, b) * -1

type Numerable<T> = {
	[K in keyof T]: T[K] extends number | Date ? K : never
}[keyof T]

export const asc =
	<T, K extends Numerable<T>>(key: K) =>
	(a: T, b: T) =>
		Number(a[key]) - Number(b[key])

export const desc =
	<T, K extends Numerable<T>>(key: K) =>
	(a: T, b: T) =>
		asc<T, K>(key)(a, b) * -1
