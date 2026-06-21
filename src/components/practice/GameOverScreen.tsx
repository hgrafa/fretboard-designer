import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface GameOverScreenProps {
	score: number;
	onRestart: () => void;
}

export function GameOverScreen({ score, onRestart }: GameOverScreenProps) {
	const { t } = useTranslation();
	return (
		<div className="flex flex-col items-center justify-center h-full gap-6">
			<div className="text-center">
				<p className="text-lg font-medium text-muted-foreground mb-1">
					{t("ui.practice.timeUp")}
				</p>
				<p className="text-4xl font-bold tabular-nums">{score}</p>
				<p className="text-sm text-muted-foreground mt-1">
					{t("ui.practice.finalScore")}
				</p>
			</div>
			<Button onClick={onRestart}>{t("ui.practice.restart")}</Button>
		</div>
	);
}
