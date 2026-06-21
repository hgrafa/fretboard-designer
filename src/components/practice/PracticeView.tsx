import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useInstrument } from "@/hooks/useFretboardContext";
import { usePracticeGame } from "@/hooks/usePracticeGame";
import { formatDate, formatTime, loadScores } from "@/lib/practiceScores";
import { ChallengeFretboardMark } from "./ChallengeFretboardMark";
import { ChallengeIdentifyInterval } from "./ChallengeIdentifyInterval";
import { ChallengeIdentifyNote } from "./ChallengeIdentifyNote";
import { GameHeader } from "./GameHeader";
import { GameOverScreen } from "./GameOverScreen";

export function PracticeView() {
	const { t } = useTranslation();
	const { tuning } = useInstrument();
	const {
		state,
		totalTimeMs,
		start,
		answer,
		togglePosition,
		submitFretboard,
		restart,
	} = usePracticeGame(tuning);

	if (state.phase === "game_over") {
		return (
			<div className="flex items-center justify-center h-full p-4">
				<div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-lg">
					<GameOverScreen
						score={state.score}
						totalTimeMs={totalTimeMs}
						endedAt={state.endedAt}
						onRestart={restart}
					/>
				</div>
			</div>
		);
	}

	if (state.phase === "idle") {
		const scores = loadScores();
		return (
			<div className="flex items-center justify-center h-full p-4 overflow-y-auto">
				<div className="flex flex-col items-center gap-8 text-center py-8 w-full max-w-xs">
					<div className="space-y-2">
						<h1 className="text-3xl font-black">{t("ui.practice.title")}</h1>
						<p className="text-sm text-muted-foreground">
							{t("ui.practice.description")}
						</p>
					</div>
					<Button size="lg" onClick={start} className="px-10">
						{t("ui.practice.start")}
					</Button>
					{scores.length > 0 && (
						<div className="w-full space-y-2">
							<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
								{t("ui.practice.bestScores")}
							</p>
							<div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
								{scores.slice(0, 5).map((s, i) => (
									<div
										key={`${s.date}-${i}`}
										className="flex items-center justify-between px-4 py-2.5 bg-card text-sm"
									>
										<span className="font-black text-base w-6 text-muted-foreground">
											{i + 1}
										</span>
										<span className="font-bold text-lg tabular-nums">
											{s.score}
										</span>
										<span className="text-muted-foreground tabular-nums text-xs">
											{formatTime(s.totalTimeMs)}
										</span>
										<span className="text-muted-foreground text-xs">
											{formatDate(s.date)}
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		);
	}

	// playing — natural-height card centered on the page
	const isFretboard = state.challenge?.type === "fretboard-mark";
	return (
		<div className="flex items-center justify-center h-full p-4">
			<div
				className={`w-full rounded-2xl border border-border shadow-lg overflow-hidden ${isFretboard ? "max-w-2xl" : "max-w-md"}`}
			>
				<GameHeader
					score={state.score}
					lives={state.lives}
					timerMs={state.currentTimerMs}
					timerStartedAt={state.timerStartedAt}
				/>
				<div className="p-6">
					{state.challenge?.type === "identify-interval" && (
						<ChallengeIdentifyInterval
							challenge={state.challenge}
							onAnswer={answer}
						/>
					)}
					{state.challenge?.type === "identify-note" && (
						<ChallengeIdentifyNote
							challenge={state.challenge}
							onAnswer={answer}
						/>
					)}
					{state.challenge?.type === "fretboard-mark" && (
						<ChallengeFretboardMark
							challenge={state.challenge}
							tuning={tuning}
							markedPositions={state.markedPositions}
							onToggle={togglePosition}
							onSubmit={submitFretboard}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
