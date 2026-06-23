import { Minus, Pause, Play, Plus, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type TimerMode, useStudyTimer } from "@/hooks/StudyTimerContext";

const PRESETS = [5, 15, 25, 45] as const;
const MODES: TimerMode[] = ["up", "down"];

function formatClock(total: number): string {
	const s = Math.max(0, Math.floor(total));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	const pad = (n: number) => n.toString().padStart(2, "0");
	return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export function StudyTimerPanel() {
	const { t } = useTranslation();
	const {
		mode,
		setMode,
		running,
		elapsed,
		durationMin,
		setDurationMin,
		remaining,
		finished,
		goal,
		setGoal,
		start,
		pause,
		reset,
		dismissFinished,
	} = useStudyTimer();

	const display = mode === "up" ? elapsed : remaining;

	return (
		<div className="flex w-72 flex-col gap-3">
			<div className="flex items-center justify-between">
				<span className="font-display font-bold text-sm">
					{t("ui.timer.title")}
				</span>
				<div className="flex gap-0.5 rounded-lg bg-[#ece6dd] p-0.5">
					{MODES.map((m) => (
						<button
							key={m}
							type="button"
							onClick={() => setMode(m)}
							className={`rounded-md px-2 py-1 font-medium text-xs transition-colors ${
								mode === m
									? "bg-card text-foreground shadow-sm"
									: "text-secondary-foreground hover:text-foreground"
							}`}
						>
							{t(`ui.timer.${m}`)}
						</button>
					))}
				</div>
			</div>

			<div className="text-center font-bold font-display text-5xl text-foreground tabular-nums tracking-tight">
				{formatClock(display)}
			</div>

			{mode === "down" && (
				<div className="flex flex-col items-center gap-2">
					<div className="flex items-center gap-2">
						<button
							type="button"
							aria-label="-5 min"
							disabled={running}
							onClick={() => setDurationMin(durationMin - 5)}
							className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-secondary-foreground hover:bg-muted disabled:opacity-40"
						>
							<Minus className="size-4" />
						</button>
						<span className="w-20 text-center font-mono font-semibold text-sm tabular-nums">
							{durationMin} {t("ui.timer.min")}
						</span>
						<button
							type="button"
							aria-label="+5 min"
							disabled={running}
							onClick={() => setDurationMin(durationMin + 5)}
							className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-secondary-foreground hover:bg-muted disabled:opacity-40"
						>
							<Plus className="size-4" />
						</button>
					</div>
					<div className="flex gap-1">
						{PRESETS.map((p) => (
							<button
								key={p}
								type="button"
								disabled={running}
								onClick={() => setDurationMin(p)}
								className={`rounded-md px-2 py-0.5 font-mono text-xs transition-colors disabled:opacity-40 ${
									durationMin === p
										? "bg-foreground text-background"
										: "text-secondary-foreground hover:bg-muted"
								}`}
							>
								{p}
							</button>
						))}
					</div>
				</div>
			)}

			<div className="flex gap-2">
				<button
					type="button"
					onClick={running ? pause : start}
					className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-foreground font-semibold text-background text-sm"
				>
					{running ? (
						<>
							<Pause className="size-4" /> {t("ui.timer.pause")}
						</>
					) : (
						<>
							<Play className="size-4" /> {t("ui.timer.start")}
						</>
					)}
				</button>
				<button
					type="button"
					aria-label={t("ui.timer.reset")}
					onClick={reset}
					className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-secondary-foreground hover:bg-muted"
				>
					<RotateCcw className="size-4" />
				</button>
			</div>

			{finished && (
				<div className="rounded-xl border border-[#22c55e]/40 bg-[#22c55e]/10 p-3 text-center">
					<p className="font-display font-bold text-sm text-foreground">
						🎉 {t("ui.timer.congrats")}
					</p>
					{goal.trim() && (
						<p className="mt-1 text-secondary-foreground text-xs">{goal}</p>
					)}
					<button
						type="button"
						onClick={dismissFinished}
						className="mt-2 font-semibold text-[#15803d] text-xs hover:underline"
					>
						{t("ui.timer.dismiss")}
					</button>
				</div>
			)}

			<div className="flex flex-col gap-1">
				<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wide">
					{t("ui.timer.goalLabel")}
				</span>
				<textarea
					value={goal}
					onChange={(e) => setGoal(e.target.value)}
					placeholder={t("ui.timer.goalPlaceholder")}
					rows={2}
					className="w-full resize-none rounded-[11px] border border-input bg-muted px-3 py-2 text-foreground text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
				/>
			</div>
		</div>
	);
}
