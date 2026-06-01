import { describe, expect, it } from "vitest";
import {
	formatSpelled,
	intervalBetween,
	isValidInterval,
	normalizeNote,
	parseSpelledNote,
	resolveInterval,
	spellDegree,
	spelledToPitchClass,
	transpose,
} from "./notes";

describe("normalizeNote", () => {
	it("accepts sharps and naturals as-is", () => {
		expect(normalizeNote("C")).toBe("C");
		expect(normalizeNote("F#")).toBe("F#");
	});

	it("converts flats to sharps", () => {
		expect(normalizeNote("Db")).toBe("C#");
		expect(normalizeNote("Bb")).toBe("A#");
	});

	it("is case-insensitive on the letter", () => {
		expect(normalizeNote("c")).toBe("C");
		expect(normalizeNote("eb")).toBe("D#");
	});

	it("returns null for garbage", () => {
		expect(normalizeNote("H")).toBeNull();
		expect(normalizeNote("")).toBeNull();
	});
});

describe("note math", () => {
	it("transposes with octave wrap", () => {
		expect(transpose("A", 3)).toBe("C");
		expect(transpose("C", -1)).toBe("B");
	});

	it("computes the interval between two notes", () => {
		expect(intervalBetween("A", "C")).toBe("b3");
		expect(intervalBetween("C", "G")).toBe("5");
	});

	it("resolves an interval from a root", () => {
		expect(resolveInterval("A", "b3")).toBe("C");
		expect(resolveInterval("C", "5")).toBe("G");
	});

	it("validates interval tokens", () => {
		expect(isValidInterval("b3")).toBe(true);
		expect(isValidInterval("9")).toBe(false);
	});
});

describe("spelling helpers", () => {
	it("converts a spelled note to its pitch class", () => {
		expect(spelledToPitchClass({ letter: "D", accidental: -1 })).toBe("C#");
		expect(spelledToPitchClass({ letter: "B", accidental: 0 })).toBe("B");
		expect(spelledToPitchClass({ letter: "F", accidental: 2 })).toBe("G");
	});

	it("formats a spelled note", () => {
		expect(formatSpelled({ letter: "D", accidental: -1 })).toBe("Db");
		expect(formatSpelled({ letter: "F", accidental: 1 })).toBe("F#");
		expect(formatSpelled({ letter: "B", accidental: -2 })).toBe("Bbb");
		expect(formatSpelled({ letter: "F", accidental: 2 })).toBe("Fx");
	});

	it("parses a written note, preserving the chosen accidental", () => {
		expect(parseSpelledNote("Bb")).toEqual({ letter: "B", accidental: -1 });
		expect(parseSpelledNote("c#")).toEqual({ letter: "C", accidental: 1 });
		expect(parseSpelledNote("G")).toEqual({ letter: "G", accidental: 0 });
		expect(parseSpelledNote("H")).toBeNull();
	});

	it("rejects an uppercase B used as an accidental", () => {
		expect(parseSpelledNote("AB")).toBeNull();
	});

	it("spells a degree from a root and target pitch class", () => {
		// Db major: 4th degree is Gb, not F#
		const root = { letter: "D", accidental: -1 } as const;
		expect(spellDegree(root, 4, "F#")).toEqual({ letter: "G", accidental: -1 });
		// A minor pentatonic: b3 is C
		const a = { letter: "A", accidental: 0 } as const;
		expect(spellDegree(a, 3, "C")).toEqual({ letter: "C", accidental: 0 });
	});

	it("caps at single accidentals instead of emitting double accidentals", () => {
		// b2 of Db is the pitch D; strict degree spelling would be E𝄫 — fall back to D
		const db = { letter: "D", accidental: -1 } as const;
		expect(spellDegree(db, 2, "D")).toEqual({ letter: "D", accidental: 0 });
		// 3rd of D# is the pitch G; strict spelling would be Fx — fall back to G
		const dSharp = { letter: "D", accidental: 1 } as const;
		expect(spellDegree(dSharp, 3, "G")).toEqual({ letter: "G", accidental: 0 });
	});

	it("follows the root's leaning when falling back on a black key", () => {
		// Same overflow target (F#/Gb), spelled per the root's accidental direction
		const flatRoot = { letter: "A", accidental: 0 } as const; // natural → flats
		expect(spellDegree(flatRoot, 5, "F#")).toEqual({
			letter: "G",
			accidental: -1,
		});
		const sharpRoot = { letter: "A", accidental: 1 } as const; // sharp → sharps
		expect(spellDegree(sharpRoot, 5, "F#")).toEqual({
			letter: "F",
			accidental: 1,
		});
	});
});
