import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { IdentifyIntervalChallenge } from "@/core/practice";
import type { IntervalName } from "@/types/music";

interface Props {
	challenge: IdentifyIntervalChallenge;
	onAnswer: (ans: IntervalName) => void;
}

export function ChallengeIdentifyInterval({ challenge, onAnswer }: Props) {
	const { t } = useTranslation();
	const [selected, setSelected] = useState<IntervalName | null>(null);

	function pick(opt: IntervalName) {
		if (selected) return;
		setSelected(opt);
		setTimeout(() => {
			setSelected(null);
			onAnswer(opt);
		}, 600);
	}

	function buttonVariant(opt: IntervalName) {
		if (!selected) return "outline" as const;
		if (opt === challenge.answer) return "default" as const;
		if (opt === selected) return "destructive" as const;
		return "outline" as const;
	}

	return (
		<div className="flex flex-col items-center gap-8 p-6 max-w-md mx-auto w-full">
			<p className="text-sm font-medium text-muted-foreground">
				{t("ui.practice.whatInterval")}
			</p>
			<div className="flex items-center gap-6">
				<span className="text-5xl font-bold">{challenge.root}</span>
				<span className="text-muted-foreground text-2xl">→</span>
				<span className="text-5xl font-bold">{challenge.target}</span>
			</div>
			<div className="grid grid-cols-2 gap-3 w-full">
				{challenge.options.map((opt) => (
					<Button
						key={opt}
						variant={buttonVariant(opt)}
						className="h-14 text-base"
						onClick={() => pick(opt)}
						disabled={Boolean(selected)}
					>
						{t(`ui.intervals.${opt}`)}
					</Button>
				))}
			</div>
		</div>
	);
}
