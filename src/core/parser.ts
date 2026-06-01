import type {
	IntervalName,
	NoteName,
	ParseOutput,
	SpelledNote,
} from "@/types/music";
import {
	INTERVAL_DEGREE,
	isValidInterval,
	parseSpelledNote,
	resolveInterval,
	spellDegree,
	spelledToPitchClass,
} from "./notes";

/**
 * Parses user input text into a NoteSet of SpelledNotes.
 *
 * Supported formats:
 *   Notes mode:     "C E G Bb"   (written accidentals preserved)
 *   Intervals mode: "root: G\n1 b3 4 5 b7"  (each degree spelled on its letter)
 */
export function parseInput(text: string): ParseOutput {
	const trimmed = text.trim();
	if (!trimmed) {
		return { success: false, error: "Empty input" };
	}

	const lines = trimmed
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);

	const rootLine = lines.find((l) => l.toLowerCase().startsWith("root:"));
	if (rootLine) {
		return parseIntervalsMode(lines, rootLine);
	}
	return parseNotesMode(lines.join(" "));
}

function pushUnique(
	notes: SpelledNote[],
	seen: Set<NoteName>,
	note: SpelledNote,
): void {
	const pc = spelledToPitchClass(note);
	if (!seen.has(pc)) {
		seen.add(pc);
		notes.push(note);
	}
}

function parseNotesMode(text: string): ParseOutput {
	const tokens = text.split(/[\s,]+/).filter(Boolean);
	const notes: SpelledNote[] = [];
	const seen = new Set<NoteName>();

	for (const token of tokens) {
		const note = parseSpelledNote(token);
		if (!note) {
			return { success: false, error: `Invalid note: "${token}"` };
		}
		pushUnique(notes, seen, note);
	}

	if (notes.length === 0) {
		return { success: false, error: "No valid notes found" };
	}

	return { success: true, noteSet: { notes } };
}

function parseIntervalsMode(lines: string[], rootLine: string): ParseOutput {
	const rootValue = rootLine.split(":")[1]?.trim();
	if (!rootValue) {
		return { success: false, error: "Missing root note after 'root:'" };
	}

	const root = parseSpelledNote(rootValue);
	if (!root) {
		return { success: false, error: `Invalid root note: "${rootValue}"` };
	}

	const intervalLines = lines.filter(
		(l) => !l.toLowerCase().startsWith("root:"),
	);
	const tokens = intervalLines
		.join(" ")
		.split(/[\s,]+/)
		.filter(Boolean);

	if (tokens.length === 0) {
		return { success: false, error: "No intervals provided" };
	}

	const notes: SpelledNote[] = [];
	const seen = new Set<NoteName>();
	for (const token of tokens) {
		if (!isValidInterval(token)) {
			return { success: false, error: `Invalid interval: "${token}"` };
		}
		const interval = token as IntervalName;
		const targetPc = resolveInterval(spelledToPitchClass(root), interval);
		const spelled = spellDegree(root, INTERVAL_DEGREE[interval], targetPc);
		pushUnique(notes, seen, spelled);
	}

	return { success: true, noteSet: { notes, root } };
}
