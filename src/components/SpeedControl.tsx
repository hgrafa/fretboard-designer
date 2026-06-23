import { Gauge } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

const SPEED_PRESETS = [0.5, 0.75, 1, 1.5, 2] as const;

const formatSpeed = (r: number) => `${+r.toFixed(2)}×`;
const formatPreset = (r: number) =>
	r < 1 ? `.${r.toString().split(".")[1]}` : `${r}`;

interface SpeedControlProps {
	value: number;
	onChange: (rate: number) => void;
	onOpenChange?: (open: boolean) => void;
}

export function SpeedControl({
	value,
	onChange,
	onOpenChange,
}: SpeedControlProps) {
	const { t } = useTranslation();

	return (
		<Popover onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label={t("ui.showroom.speed")}
					className="flex h-7 items-center gap-1 rounded-md bg-white/10 px-2 font-mono font-semibold text-white text-xs transition-colors hover:bg-white/20 data-[state=open]:bg-white data-[state=open]:text-[#23201c]"
				>
					<Gauge className="size-3.5 shrink-0" />
					<span className="w-10 text-center tabular-nums">
						{formatSpeed(value)}
					</span>
				</button>
			</PopoverTrigger>
			<PopoverContent
				side="top"
				align="end"
				sideOffset={10}
				collisionPadding={12}
				className="w-44 border-white/10 bg-[#2b2724] text-white"
			>
				<div className="flex flex-col items-center gap-3">
					<span className="font-display font-bold text-3xl tabular-nums tracking-tight">
						{formatSpeed(value)}
					</span>
					<input
						type="range"
						aria-label={t("ui.showroom.playbackSpeed")}
						min={0.25}
						max={2}
						step={0.05}
						value={value}
						onChange={(e) => onChange(Number(e.target.value))}
						className="w-full accent-white"
					/>
					<div className="flex w-full items-center justify-between">
						{SPEED_PRESETS.map((rate) => (
							<button
								key={rate}
								type="button"
								onClick={() => onChange(rate)}
								className={`rounded px-1.5 py-0.5 font-mono text-xs transition-colors ${
									Math.abs(value - rate) < 0.001
										? "font-semibold text-white"
										: "text-white/50 hover:text-white"
								}`}
							>
								{formatPreset(rate)}
							</button>
						))}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
