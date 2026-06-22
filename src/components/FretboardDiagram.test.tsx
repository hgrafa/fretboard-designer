import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { FretPosition } from "@/types/music";
import { FretboardDiagram, MAIN_DIMENSIONS } from "./FretboardDiagram";

describe("FretboardDiagram", () => {
	it("renders root-note dot with brand color", () => {
		const positions: FretPosition[] = [
			{
				string: 1,
				fret: 0,
				note: "C",
				spelled: { letter: "C", accidental: 0 },
			},
		];

		const { container } = render(
			<FretboardDiagram
				positions={positions}
				stringCount={6}
				minFret={0}
				maxFret={12}
				dimensions={MAIN_DIMENSIONS}
				displayMode="notes"
				highlightRoot={true}
				rootPitchClass="C"
			/>,
		);

		const rootDot = container.querySelector("circle[class*='fill-brand']");
		expect(rootDot).toBeInTheDocument();
		expect(rootDot).not.toHaveClass("fill-rose-500");
	});
});
