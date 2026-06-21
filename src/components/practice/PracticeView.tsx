import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useInstrument } from "@/hooks/useFretboardContext";
import { usePracticeGame } from "@/hooks/usePracticeGame";
import { ChallengeIdentifyInterval } from "./ChallengeIdentifyInterval";
import { ChallengeIdentifyNote } from "./ChallengeIdentifyNote";
import { GameHeader } from "./GameHeader";
import { GameOverScreen } from "./GameOverScreen";

export function PracticeView() {
	const { t } = useTranslation();
	const { tuning } = useInstrument();
	const { state, start, answer, restart } = usePracticeGame(tuning);

	if (state.phase === "game_over") {
		return <GameOverScreen score={state.score} onRestart={restart} />;
	}

	if (state.phase === "idle") {
		return (
			<div className="flex flex-col items-center justify-center h-full gap-4">
				<h1 className="text-2xl font-bold">{t("ui.practice.title")}</h1>
				<Button size="lg" onClick={start}>
					{t("ui.practice.start")}
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full">
			<GameHeader
				score={state.score}
				timerMs={state.currentTimerMs}
				timerStartedAt={state.timerStartedAt}
			/>
			<div className="flex-1 flex items-center justify-center">
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
					<div className="text-muted-foreground">
						Fretboard challenge — coming in next task
					</div>
				)}
			</div>
		</div>
	);
}
