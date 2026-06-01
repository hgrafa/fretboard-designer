import { describe, expect, it } from "vitest";
import { buildAscendingMidis } from "./noteSequence";
import { frequencyFromMidi } from "./pitchAudio";

describe("frequencyFromMidi", () => {
	it("maps A4 to 440 Hz", () => {
		expect(frequencyFromMidi(69)).toBeCloseTo(440);
	});
	it("maps A5 to 880 Hz (one octave up)", () => {
		expect(frequencyFromMidi(81)).toBeCloseTo(880);
	});
	it("maps middle C (60) to ~261.63 Hz", () => {
		expect(frequencyFromMidi(60)).toBeCloseTo(261.63, 1);
	});
});

describe("buildAscendingMidis", () => {
	it("builds an A minor pentatonic run closing on the octave", () => {
		// A C D E G at octave 4 → A4 C5 D5 E5 G5 A5
		expect(buildAscendingMidis("A", ["A", "C", "D", "E", "G"])).toEqual([
			69, 72, 74, 76, 79, 81,
		]);
	});

	it("orders notes ascending from the root regardless of input order", () => {
		expect(buildAscendingMidis("C", ["G", "E", "C"])).toEqual([60, 64, 67, 72]);
	});

	it("collapses duplicate pitch classes", () => {
		expect(buildAscendingMidis("C", ["C", "C", "E"])).toEqual([60, 64, 72]);
	});

	it("respects the octave argument", () => {
		expect(buildAscendingMidis("C", ["C"], 3)).toEqual([48, 60]);
	});
});
