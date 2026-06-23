import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StudyTimerPanel } from "@/components/StudyTimerPanel";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { formatClock, useStudyTimer } from "@/hooks/StudyTimerContext";

export function StudyTimerButton() {
	const { t } = useTranslation();
	const { mode, running, elapsed, remaining } = useStudyTimer();
	const display = mode === "up" ? elapsed : remaining;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label={t("ui.timer.title")}
					className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 font-semibold text-secondary-foreground text-sm transition-colors hover:bg-muted data-[state=open]:border-transparent data-[state=open]:bg-foreground data-[state=open]:text-background"
				>
					<Clock className="size-4" />
					<span className="font-mono tabular-nums">{formatClock(display)}</span>
					{running && (
						<span className="size-1.5 rounded-full bg-[#22c55e] shadow-[0_0_0_3px_rgba(34,197,94,0.2)]" />
					)}
				</button>
			</PopoverTrigger>
			<PopoverContent align="end" sideOffset={10} className="w-auto">
				<StudyTimerPanel />
			</PopoverContent>
		</Popover>
	);
}
