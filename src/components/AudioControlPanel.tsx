import { RefreshCw, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { NoteTone } from "@/audio/notePlayer";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useMetronome } from "@/hooks/MetronomeContext";
import { useNotePlayback } from "@/hooks/NotePlaybackContext";

// Radix <Select.Item> forbids an empty-string value (it's reserved for "clear
// selection"), but the default output's deviceId IS "". Bridge with a sentinel.
const DEFAULT_VALUE = "__default__";
const toSelectValue = (deviceId: string) =>
	deviceId === "" ? DEFAULT_VALUE : deviceId;
const fromSelectValue = (value: string) =>
	value === DEFAULT_VALUE ? "" : value;

// One routable audio output. Each source (metronome, notes, …) is a row here
// with its own device dropdown, so sounds can play on different devices.
interface OutputRow {
	id: string;
	label: string;
	deviceId: string;
	setDeviceId: (id: string) => void;
}

const TONE_OPTIONS: { value: NoteTone; labelKey: string }[] = [
	{ value: "plucked", labelKey: "ui.audio.tonePlucked" },
	{ value: "clean", labelKey: "ui.audio.toneClean" },
	{ value: "warm", labelKey: "ui.audio.toneWarm" },
];

export function AudioControlPanel() {
	const { t } = useTranslation();
	const { routingSupported, devices, deviceId, setDeviceId, refreshDevices } =
		useMetronome();
	const {
		deviceId: notesDeviceId,
		setDeviceId: setNotesDeviceId,
		tone,
		setTone,
		volume,
		setVolume,
	} = useNotePlayback();

	const rows: OutputRow[] = [
		{ id: "metronome", label: t("ui.audio.metronome"), deviceId, setDeviceId },
		{
			id: "notes",
			label: t("ui.audio.notes"),
			deviceId: notesDeviceId,
			setDeviceId: setNotesDeviceId,
		},
	];

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 font-semibold text-secondary-foreground text-sm transition-colors hover:bg-muted data-[state=open]:border-transparent data-[state=open]:bg-foreground data-[state=open]:text-background"
				>
					<SlidersHorizontal className="size-3.5" />
					{t("ui.audio.trigger")}
				</button>
			</PopoverTrigger>
			<PopoverContent align="start" sideOffset={10} className="w-80">
				<div className="space-y-1">
					<p className="text-sm font-semibold">{t("ui.audio.outputTitle")}</p>
					<p className="text-xs text-muted-foreground">
						{t("ui.audio.outputDesc")}
					</p>
				</div>

				{routingSupported ? (
					<div className="mt-4 space-y-3">
						{rows.map((row) => (
							<div key={row.id} className="space-y-1.5">
								<div className="flex items-center justify-between">
									<span className="text-xs font-medium">{row.label}</span>
									<button
										type="button"
										onClick={() => void refreshDevices()}
										className="flex items-center gap-1 text-[0.7rem] text-muted-foreground transition-colors hover:text-foreground"
									>
										<RefreshCw className="size-3" />
										{t("ui.audio.refresh")}
									</button>
								</div>
								<Select
									value={toSelectValue(row.deviceId)}
									onValueChange={(v) => row.setDeviceId(fromSelectValue(v))}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder={t("ui.audio.systemDefault")} />
									</SelectTrigger>
									<SelectContent>
										{devices.map((d) => (
											<SelectItem
												key={d.deviceId || DEFAULT_VALUE}
												value={toSelectValue(d.deviceId)}
											>
												{d.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						))}
						<p className="pt-1 text-[0.7rem] leading-relaxed text-muted-foreground">
							{t("ui.audio.tip")}
						</p>
					</div>
				) : (
					<p className="mt-4 text-xs leading-relaxed text-muted-foreground">
						{t("ui.audio.noRoutingMsg")}
					</p>
				)}

				{/* Note-playback voice — works regardless of per-device routing. */}
				<div className="mt-4 space-y-3 border-t border-border pt-4">
					<p className="text-sm font-semibold">{t("ui.audio.notesTitle")}</p>

					<div className="space-y-1.5">
						<span className="text-xs font-medium">{t("ui.audio.tone")}</span>
						<div className="grid grid-cols-3 gap-1.5">
							{TONE_OPTIONS.map((opt) => (
								<Button
									key={opt.value}
									type="button"
									size="sm"
									variant={tone === opt.value ? "default" : "outline"}
									aria-pressed={tone === opt.value}
									onClick={() => setTone(opt.value)}
								>
									{t(opt.labelKey)}
								</Button>
							))}
						</div>
					</div>

					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium">
								{t("ui.audio.volume")}
							</span>
							<span className="text-[0.7rem] text-muted-foreground tabular-nums">
								{Math.round(volume * 100)}%
							</span>
						</div>
						<Slider
							value={[Math.round(volume * 100)]}
							min={0}
							max={100}
							step={1}
							aria-label={t("ui.audio.volume")}
							onValueChange={([v]) => setVolume(v / 100)}
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
