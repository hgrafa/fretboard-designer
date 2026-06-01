import { describe, expect, it } from "vitest";
import { parseInput } from "./parser";

describe("parseInput — notes mode", () => {
	it("parses a space/comma separated note list", () => {
		const out = parseInput("C E G Bb");
		expect(out.success).toBe(true);
		if (out.success) {
			expect(out.noteSet.notes).toEqual(["C", "E", "G", "A#"]);
			expect(out.noteSet.root).toBeUndefined();
		}
	});

	it("dedupes repeated notes", () => {
		const out = parseInput("C C E");
		expect(out.success && out.noteSet.notes).toEqual(["C", "E"]);
	});

	it("rejects an invalid note", () => {
		const out = parseInput("C H");
		expect(out).toEqual({ success: false, error: 'Invalid note: "H"' });
	});
});

describe("parseInput — intervals mode", () => {
	it("resolves intervals against a root", () => {
		const out = parseInput("root: A\n1 b3 4 5 b7");
		expect(out.success).toBe(true);
		if (out.success) {
			expect(out.noteSet.notes).toEqual(["A", "C", "D", "E", "G"]);
			expect(out.noteSet.root).toBe("A");
		}
	});

	it("rejects an invalid interval", () => {
		const out = parseInput("root: A\n1 b9");
		expect(out).toEqual({ success: false, error: 'Invalid interval: "b9"' });
	});
});

describe("parseInput — errors", () => {
	it("rejects empty input", () => {
		expect(parseInput("   ")).toEqual({ success: false, error: "Empty input" });
	});
});
