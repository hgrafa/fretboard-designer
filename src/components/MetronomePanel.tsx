import { Minus, Pause, Play, Plus } from "lucide-react";
import { tempoMarking } from "@/audio/metronomeMath";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useMetronome } from "@/hooks/MetronomeContext";

const BEATS_PER_BAR = [2, 3, 4, 5, 6] as const;

export function MetronomePanel() {
	const {
		isPlaying,
		bpm,
		beatsPerBar,
		accent,
		activeBeat,
		toggle,
		setBpm,
		setBeatsPerBar,
		reset,
	} = useMetronome();

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted data-[state=open]:border-foreground/30 data-[state=open]:text-foreground"
				>
					<Play className="size-3.5" />
					Metronome
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				sideOffset={10}
				className="w-72 overflow-hidden rounded-3xl border-zinc-800 bg-zinc-950 p-6 text-zinc-50 shadow-2xl"
			>
				{/* Beat indicator */}
				<div className="mb-5 flex items-center justify-center gap-2">
					{Array.from({ length: beatsPerBar }, (_, i) => {
						const on = activeBeat === i;
						const downbeat = i === 0 && accent;
						return (
							<span
								// biome-ignore lint/suspicious/noArrayIndexKey: beats are a fixed positional sequence; index is their identity
								key={i}
								className={`h-1.5 rounded-full transition-all duration-150 ${
									on
										? `${downbeat ? "bg-amber-400" : "bg-zinc-100"} w-6`
										: "w-3 bg-zinc-700"
								}`}
							/>
						);
					})}
				</div>

				{/* Title + tempo marking */}
				<div className="mb-4 text-center">
					<p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-zinc-400">
						BPM
					</p>
					<p className="mt-0.5 text-sm font-medium text-amber-400">
						{tempoMarking(bpm)}
					</p>
				</div>

				{/* Stepper */}
				<div className="flex items-stretch gap-2">
					<button
						type="button"
						onClick={() => setBpm(bpm - 1)}
						aria-label="Decrease tempo"
						className="flex w-14 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-200 transition-colors hover:bg-zinc-700 active:bg-zinc-600"
					>
						<Minus className="size-5" />
					</button>
					<div className="flex flex-1 items-center justify-center rounded-2xl bg-zinc-900 py-4 ring-1 ring-inset ring-zinc-800">
						<span className="text-6xl font-bold leading-none tabular-nums tracking-tight">
							{bpm}
						</span>
					</div>
					<button
						type="button"
						onClick={() => setBpm(bpm + 1)}
						aria-label="Increase tempo"
						className="flex w-14 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-200 transition-colors hover:bg-zinc-700 active:bg-zinc-600"
					>
						<Plus className="size-5" />
					</button>
				</div>

				{/* Transport */}
				<button
					type="button"
					onClick={toggle}
					className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-colors ${
						isPlaying
							? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
							: "bg-amber-400 text-zinc-950 hover:bg-amber-300"
					}`}
				>
					{isPlaying ? (
						<>
							<Pause className="size-4" /> Stop
						</>
					) : (
						<>
							<Play className="size-4" /> Start
						</>
					)}
				</button>

				{/* Beats per bar */}
				<div className="mt-5 flex items-center justify-center gap-1.5">
					{BEATS_PER_BAR.map((n) => (
						<button
							key={n}
							type="button"
							onClick={() => setBeatsPerBar(n)}
							className={`size-8 rounded-lg text-xs font-medium tabular-nums transition-colors ${
								beatsPerBar === n
									? "bg-zinc-100 text-zinc-950"
									: "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
							}`}
						>
							{n}
						</button>
					))}
				</div>

				{/* Reset */}
				<button
					type="button"
					onClick={reset}
					className="mt-4 w-full text-center text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
				>
					Reset
				</button>
			</PopoverContent>
		</Popover>
	);
}
