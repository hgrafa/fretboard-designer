import { Music, Play, RefreshCw } from "lucide-react";
import type { Waveform } from "@/audio/noteSynth";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useNotesAudio } from "@/hooks/NotesAudioContext";

const WAVEFORMS: { value: Waveform; label: string }[] = [
	{ value: "sine", label: "Sine" },
	{ value: "triangle", label: "Triangle" },
	{ value: "sawtooth", label: "Saw" },
	{ value: "square", label: "Square" },
];

export function NotesPanel() {
	const {
		volume,
		waveform,
		noteDuration,
		canPlay,
		routingSupported,
		devices,
		deviceId,
		setVolume,
		setWaveform,
		setNoteDuration,
		setDeviceId,
		refreshDevices,
		playScale,
	} = useNotesAudio();

	return (
		<Dialog>
			<DialogTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
				>
					<Music className="size-3.5" />
					Notes
				</button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Notes</DialogTitle>
					<DialogDescription>
						Hear the notes on the fretboard. Click any dot to play it, or play
						the whole set as a scale.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-2">
					{/* Play the current note set */}
					<Button
						onClick={playScale}
						disabled={!canPlay}
						className="w-full"
						size="lg"
					>
						<Play className="size-4" /> Play scale
					</Button>

					{/* Tone */}
					<div className="space-y-2">
						<Label>Tone</Label>
						<div className="flex rounded-md border border-input">
							{WAVEFORMS.map((w) => (
								<button
									key={w.value}
									type="button"
									onClick={() => setWaveform(w.value)}
									className={`flex-1 px-2 py-1.5 text-xs font-medium transition-colors first:rounded-l-md last:rounded-r-md ${
										waveform === w.value
											? "bg-primary text-primary-foreground"
											: "bg-background text-muted-foreground hover:bg-muted"
									}`}
								>
									{w.label}
								</button>
							))}
						</div>
					</div>

					{/* Note length */}
					<div className="space-y-2">
						<div className="flex items-baseline justify-between">
							<Label>Note length</Label>
							<span className="text-xs text-muted-foreground tabular-nums">
								{Math.round(noteDuration * 1000)} ms
							</span>
						</div>
						<Slider
							value={[noteDuration]}
							min={0.1}
							max={1}
							step={0.05}
							onValueChange={([v]) => setNoteDuration(v)}
							aria-label="Note length in seconds"
						/>
					</div>

					{/* Volume */}
					<div className="flex items-center gap-2">
						<Label className="text-xs text-muted-foreground">Volume</Label>
						<Slider
							value={[volume]}
							min={0}
							max={1}
							step={0.01}
							onValueChange={([v]) => setVolume(v)}
							aria-label="Volume"
						/>
					</div>

					{/* Output device */}
					<div className="space-y-2">
						<Label>Output device</Label>
						{routingSupported ? (
							<div className="flex items-center gap-2">
								<Select value={deviceId} onValueChange={setDeviceId}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="System default" />
									</SelectTrigger>
									<SelectContent>
										{devices.map((d) => (
											<SelectItem key={d.deviceId} value={d.deviceId}>
												{d.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Button
									variant="outline"
									size="icon"
									onClick={() => void refreshDevices()}
									aria-label="Refresh devices and show names"
								>
									<RefreshCw className="size-4" />
								</Button>
							</div>
						) : (
							<p className="text-xs text-muted-foreground">
								This browser plays through the system default output. Per-device
								routing needs Chrome or Edge.
							</p>
						)}
						<p className="text-xs text-muted-foreground">
							Pick a different device here than the metronome to hear them
							separately (e.g. notes on headphones, metronome on speakers).
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
