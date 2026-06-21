import { useTranslation } from "react-i18next";

interface GameHeaderProps {
	score: number;
	timerMs: number;
	timerStartedAt: number;
}

export function GameHeader({
	score,
	timerMs,
	timerStartedAt,
}: GameHeaderProps) {
	const { t } = useTranslation();
	return (
		<div className="flex flex-col gap-2 px-6 py-3 border-b border-border">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium text-muted-foreground">
					{t("ui.practice.score")}
				</span>
				<span className="text-lg font-bold tabular-nums">{score}</span>
			</div>
			<div className="w-full h-2 rounded-full bg-muted overflow-hidden">
				<div
					key={timerStartedAt}
					className="h-full bg-primary rounded-full"
					style={{
						animation: `shrink ${timerMs}ms linear forwards`,
					}}
				/>
			</div>
			<style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
		</div>
	);
}
