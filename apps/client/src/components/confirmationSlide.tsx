import useDefinedMemo from "@/hooks/useDefinedMemo"
import { cn } from "@/lib/utils"
import { ChevronsRight } from "lucide-react"
import { DOMAttributes, ReactNode, useEffect, useRef, useState } from "react"

const ConfirmationSlide = ({
	onConfirm,
	children,
	className,
	highlighted,
}: {
	onConfirm: () => void
	children: ReactNode
	className?: string
	highlighted?: boolean
}) => {
	const sliderContainer = useRef<HTMLDivElement>(null)
	const slider = useRef<HTMLDivElement>(null)
	const [xInitial, setXInitial] = useState(0)
	const [sliderPosition, setSliderPosition] = useState(0)

	const maxSlide = useDefinedMemo(
		() => {
			if (slider.current && sliderContainer.current) {
				return (
					sliderContainer.current.clientWidth -
					slider.current.clientWidth
				)
			}
		},
		[slider.current, sliderContainer.current],
		0,
	)

	const touchStartHandler: DOMAttributes<HTMLDivElement>["onTouchStart"] = (
		e,
	) => {
		setXInitial(e.touches[0].clientX)
	}

	const touchEndHandler: DOMAttributes<HTMLDivElement>["onTouchEnd"] = () => {
		if (sliderPosition === maxSlide) {
			onConfirm()
		} else {
			setSliderPosition(0)
		}
	}

	useEffect(() => {
		const container = sliderContainer.current
		if (!container) return

		const handleTouchMove = (e: TouchEvent) => {
			e.preventDefault()
			const touchX = e.touches[0].clientX
			setSliderPosition(
				Math.max(0, Math.min(maxSlide, (xInitial - touchX) * -1)),
			)
		}

		container.addEventListener("touchmove", handleTouchMove, {
			passive: false,
		})

		return () => {
			container.removeEventListener("touchmove", handleTouchMove)
		}
	}, [xInitial, maxSlide])

	return (
		<div
			ref={sliderContainer}
			onTouchStart={touchStartHandler}
			onTouchEnd={touchEndHandler}
			className={cn(
				"h-10 w-full border bg-white rounded-md relative shadow-sm",
				className,
			)}
		>
			<div
				ref={slider}
				className={cn(
					"flex items-center justify-center h-full w-[75px] border border-blue-200 bg-blue-200 rounded-md",
					{
						"transition-all duration-300": sliderPosition === 0,
					},
				)}
				style={{
					transform: `translateX(${sliderPosition}px)`,
				}}
			>
				<ChevronsRight
					className={cn({ "animate-bounce-left": highlighted })}
				/>
			</div>
			<div
				style={{
					transitionDuration: "150ms",
				}}
				className={cn(
					"absolute opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all",
					{
						"animate-pulse": highlighted && sliderPosition === 0,
						"opacity-0": sliderPosition > 0,
					},
				)}
			>
				{children}
			</div>
		</div>
	)
}

export default ConfirmationSlide
