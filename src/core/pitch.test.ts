import { describe, expect, it } from "vitest";
import type { Tuning } from "@/types/music";
import { assignOctaves, getPitchAtPosition, midiNumber } from "./pitch";

const GUITAR: Tuning = ["E", "A", "D", "G", "B", "E"];

describe("assignOctaves", () => {
	it("assigns ascending octaves to standard guitar tuning", () => {
		expect(assignOctaves(GUITAR)).toEqual([
			{ note: "E", octave: 2 },
			{ note: "A", octave: 2 },
			{ note: "D", octave: 3 },
			{ note: "G", octave: 3 },
			{ note: "B", octave: 3 },
			{ note: "E", octave: 4 },
		]);
	});
});

describe("getPitchAtPosition", () => {
	it("adds frets to the open string, carrying octaves", () => {
		expect(getPitchAtPosition(GUITAR, 0, 0)).toEqual({ note: "E", octave: 2 });
		expect(getPitchAtPosition(GUITAR, 0, 12)).toEqual({ note: "E", octave: 3 });
		expect(getPitchAtPosition(GUITAR, 0, 8)).toEqual({ note: "C", octave: 3 });
	});
});

describe("midiNumber", () => {
	it("matches the MIDI standard (A4 = 69, C4 = 60)", () => {
		expect(midiNumber({ note: "A", octave: 4 })).toBe(69);
		expect(midiNumber({ note: "C", octave: 4 })).toBe(60);
		expect(midiNumber({ note: "E", octave: 2 })).toBe(40);
	});
});
