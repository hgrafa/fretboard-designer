// Pure pitch↔frequency math for audio synthesis. No Web Audio, no DOM.

// Equal-temperament frequency of a MIDI note number. A4 (MIDI 69) = 440 Hz.
export function frequencyFromMidi(midi: number): number {
	return 440 * 2 ** ((midi - 69) / 12);
}
