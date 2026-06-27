import { useTranslation } from "react-i18next";
import { BoxFretboard } from "@/components/BoxFretboard";
import { BoxPatternDialog } from "@/components/BoxPatternDialog";
import { BoxPlayControls } from "@/components/BoxPlayControls";
import { spelledToPitchClass } from "@/core/notes";
import {
	useDerived,
	useDisplay,
	useInput,
	useInstrument,
} from "@/hooks/useFretboardContext";

export function BoxPatterns() {
	const { t } = useTranslation();
	const { boxPatterns } = useDerived();
	const { displayMode, highlightRoot } = useDisplay();
	const { noteSet } = useInput();
	const { tuning } = useInstrument();

	if (!noteSet || boxPatterns.length === 0) return null;

	const rootPitchClass = noteSet.root
		? spelledToPitchClass(noteSet.root)
		: undefined;

	return (
		<div className="space-y-3.5">
			<h2 className="font-display font-semibold text-lg tracking-[-0.02em]">
				{t("ui.boxPatterns.heading")}
			</h2>
			<div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
				{boxPatterns.map((pattern) => (
					<div
						key={pattern.index}
						className="overflow-hidden rounded-2xl border border-border bg-card p-3.5"
					>
						<div className="mb-2.5 flex items-center justify-between">
							<p className="font-bold text-[13px]">
								{t("ui.boxPatterns.pattern", { n: pattern.index + 1 })}
							</p>
							<BoxPatternDialog
								pattern={pattern}
								stringCount={tuning.length}
								displayMode={displayMode}
								highlightRoot={highlightRoot}
								rootPitchClass={rootPitchClass}
								tuning={tuning}
							/>
						</div>
						<div className="overflow-x-auto">
							<BoxFretboard
								pattern={pattern}
								stringCount={tuning.length}
								displayMode={displayMode}
								highlightRoot={highlightRoot}
								rootPitchClass={rootPitchClass}
							/>
						</div>
						<div className="mt-3 flex justify-end">
							<BoxPlayControls
								id={`box-${pattern.index}`}
								pattern={pattern}
								tuning={tuning}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
