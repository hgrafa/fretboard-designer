import { ArrowDown, ArrowUp, Play, Square } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { boxPlaybackSequence, type PlaybackDirection } from "@/core/playback";
import { useNotePlayback } from "@/hooks/NotePlaybackContext";
import type { BoxPattern, Tuning } from "@/types/music";

// The transport for one box pattern: a primary "up & down" run (the default
// practice direction) plus one-way ascending / descending drills. Clicking the
// active direction again stops it. Shared between the pattern card and the
// expand modal, so `id` must be stable per pattern across both.
export function BoxPlayControls({
	id,
	pattern,
	tuning,
}: {
	id: string;
	pattern: BoxPattern;
	tuning: Tuning;
}) {
	const { t } = useTranslation();
	const { playing, play, stop } = useNotePlayback();

	const isActive = (direction: PlaybackDirection) =>
		playing?.id === id && playing.direction === direction;

	const toggle = (direction: PlaybackDirection) => {
		if (isActive(direction)) {
			stop();
			return;
		}
		play(
			id,
			boxPlaybackSequence(pattern.positions, tuning, direction),
			direction,
		);
	};

	return (
		<div className="flex items-center gap-1.5">
			<Button
				type="button"
				size="sm"
				variant={isActive("up-down") ? "default" : "secondary"}
				onClick={() => toggle("up-down")}
				aria-pressed={isActive("up-down")}
				title={t("ui.boxPatterns.playUpDown")}
				className="gap-1.5"
			>
				{isActive("up-down") ? (
					<Square className="fill-current" />
				) : (
					<Play className="fill-current" />
				)}
				{isActive("up-down")
					? t("ui.boxPatterns.stop")
					: t("ui.boxPatterns.play")}
			</Button>
			<Button
				type="button"
				size="icon-sm"
				variant="outline"
				onClick={() => toggle("up")}
				aria-pressed={isActive("up")}
				aria-label={t("ui.boxPatterns.playUp")}
				title={t("ui.boxPatterns.playUp")}
			>
				{isActive("up") ? <Square className="fill-current" /> : <ArrowUp />}
			</Button>
			<Button
				type="button"
				size="icon-sm"
				variant="outline"
				onClick={() => toggle("down")}
				aria-pressed={isActive("down")}
				aria-label={t("ui.boxPatterns.playDown")}
				title={t("ui.boxPatterns.playDown")}
			>
				{isActive("down") ? <Square className="fill-current" /> : <ArrowDown />}
			</Button>
		</div>
	);
}
