import {
	BOX_DIMENSIONS,
	FretboardDiagram,
	type FretboardDimensions,
} from "@/components/FretboardDiagram";
import type { BoxPattern, DisplayMode, NoteName } from "@/types/music";

const MIN_DISPLAY_FRETS = 7;

// Renders a single box pattern on the shared fretboard primitive, padding the
// pattern's fret span out to a readable window. The `dimensions` preset lets the
// same pattern render compact in a card or larger in the expand modal.
export function BoxFretboard({
	pattern,
	stringCount,
	displayMode,
	highlightRoot,
	rootPitchClass,
	dimensions = BOX_DIMENSIONS,
}: {
	pattern: BoxPattern;
	stringCount: number;
	displayMode: DisplayMode;
	highlightRoot: boolean;
	rootPitchClass?: NoteName;
	dimensions?: FretboardDimensions;
}) {
	const { minFret, maxFret, positions } = pattern;

	const patternSpan = maxFret - minFret;
	const extraFrets = Math.max(
		2,
		Math.ceil((MIN_DISPLAY_FRETS - patternSpan) / 2),
	);
	const displayMinFret = Math.max(0, minFret - extraFrets);
	const displayMaxFret = Math.max(
		displayMinFret + MIN_DISPLAY_FRETS,
		maxFret + extraFrets,
	);

	return (
		<FretboardDiagram
			positions={positions}
			stringCount={stringCount}
			minFret={displayMinFret}
			maxFret={displayMaxFret}
			dimensions={dimensions}
			displayMode={displayMode}
			highlightRoot={highlightRoot}
			rootPitchClass={rootPitchClass}
		/>
	);
}
