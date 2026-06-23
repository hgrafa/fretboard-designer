import { Clock, Guitar, Music4, Target } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StudyTimerPanel } from "@/components/StudyTimerPanel";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useStudyTimer } from "@/hooks/StudyTimerContext";
import { useView } from "@/hooks/ViewContext";
import type { AppView } from "@/types/showroom";

export function FloatingNav() {
	const { t } = useTranslation();
	const { view, setView } = useView();
	const { running } = useStudyTimer();
	const [expanded, setExpanded] = useState(false);

	const NAV: { view: AppView; label: string; icon: typeof Guitar }[] = [
		{ view: "fretboard", label: t("ui.sidebar.fretboard"), icon: Guitar },
		{ view: "showroom", label: t("ui.sidebar.showroom"), icon: Music4 },
		{ view: "practice", label: t("ui.sidebar.practice"), icon: Target },
	];

	return (
		<nav
			onMouseEnter={() => setExpanded(true)}
			onMouseLeave={() => setExpanded(false)}
			className={`-translate-y-1/2 absolute top-1/2 left-3 z-30 flex flex-col gap-1 rounded-2xl border border-border bg-background/80 p-1.5 shadow-lg backdrop-blur-lg transition-[width] duration-200 ${
				expanded ? "w-44" : "w-[52px]"
			}`}
		>
			{NAV.map(({ view: v, label, icon: Icon }) => {
				const active = view === v;
				return (
					<button
						key={v}
						type="button"
						onClick={() => setView(v)}
						aria-current={active ? "page" : undefined}
						title={label}
						className={`flex h-10 items-center gap-3 overflow-hidden rounded-xl px-2.5 font-medium text-sm transition-colors ${
							active
								? "bg-brand-gradient text-white"
								: "text-muted-foreground hover:bg-muted"
						}`}
					>
						<Icon className="size-5 shrink-0" />
						{expanded && <span className="whitespace-nowrap">{label}</span>}
					</button>
				);
			})}

			<div className="mx-1 my-0.5 h-px bg-border" />

			<Popover>
				<PopoverTrigger asChild>
					<button
						type="button"
						title={t("ui.timer.title")}
						className="flex h-10 items-center gap-3 overflow-hidden rounded-xl px-2.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted data-[state=open]:bg-muted data-[state=open]:text-foreground"
					>
						<span className="relative shrink-0">
							<Clock className="size-5" />
							{running && (
								<span className="-top-0.5 -right-0.5 absolute size-2 rounded-full bg-[#22c55e] ring-2 ring-background" />
							)}
						</span>
						{expanded && (
							<span className="whitespace-nowrap">{t("ui.timer.title")}</span>
						)}
					</button>
				</PopoverTrigger>
				<PopoverContent
					side="right"
					align="end"
					sideOffset={12}
					collisionPadding={12}
					className="w-auto"
				>
					<StudyTimerPanel />
				</PopoverContent>
			</Popover>
		</nav>
	);
}
