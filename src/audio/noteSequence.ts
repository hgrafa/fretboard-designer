// Pure logic for turning a note set into an ascending sequence of MIDI numbers
// to play as a scale run. No Web Audio, no DOM.

import { noteIndex } from "@/core/notes";
import type { NoteName } from "@/types/music";

// MIDI number of a pitch class at a given octave (C4 = 60).
function midiOf(pitchClass: number, octave: number): number {
	return (octave + 1) * 12 + pitchClass;
}

// Build an ascending run of MIDI notes for a scale/chord: starting on the root,
// each subsequent pitch class placed at its smallest positive offset above the
// root, finishing on the root one octave up. Duplicate pitch classes collapse.
//
// e.g. root A + {A C D E G} (A minor pentatonic) at octave 4
//   → [69, 72, 74, 76, 79, 81]  (A C D E G A')
export function buildAscendingMidis(
	root: NoteName,
	notes: NoteName[],
	octave = 4,
): number[] {
	const rootPc = noteIndex(root);
	const rootMidi = midiOf(rootPc, octave);

	const offsets = notes
		.map((n) => (((noteIndex(n) - rootPc) % 12) + 12) % 12)
		.filter((offset, i, all) => all.indexOf(offset) === i)
		.sort((a, b) => a - b);

	const midis = offsets.map((offset) => rootMidi + offset);
	midis.push(rootMidi + 12); // close the run on the octave
	return midis;
}
