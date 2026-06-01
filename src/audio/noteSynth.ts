// A Web Audio synth for playing pitched notes (single notes or a sequence).
// Runs on its OWN AudioContext so it can be routed to a different output device
// than the metronome — that independence is what enables multi-output control.

import { applySink } from "./devices";
import { frequencyFromMidi } from "./pitchAudio";

export type Waveform = "sine" | "triangle" | "sawtooth" | "square";

export interface NoteSynthConfig {
	volume: number; // 0..1
	waveform: Waveform;
	noteDuration: number; // seconds a single note rings
}

// Envelope timings (seconds), shaping each note to avoid clicks.
const ATTACK_S = 0.01;
const RELEASE_S = 0.08;

export class NoteSynth {
	private ctx: AudioContext | null = null;
	private deviceId = "";
	private sequenceTimer: ReturnType<typeof setTimeout> | null = null;

	private config: NoteSynthConfig = {
		volume: 0.5,
		waveform: "triangle",
		noteDuration: 0.45,
	};

	configure(partial: Partial<NoteSynthConfig>): void {
		this.config = { ...this.config, ...partial };
	}

	getConfig(): NoteSynthConfig {
		return { ...this.config };
	}

	async setOutputDevice(deviceId: string): Promise<void> {
		this.deviceId = deviceId;
		if (this.ctx) await applySink(this.ctx, deviceId);
	}

	// Lazily create + resume the context (browsers require a user gesture).
	private async ensureContext(): Promise<AudioContext> {
		if (!this.ctx) {
			this.ctx = new AudioContext();
			if (this.deviceId) await applySink(this.ctx, this.deviceId);
		}
		await this.ctx.resume();
		return this.ctx;
	}

	// Play a single MIDI note now.
	async playMidi(midi: number): Promise<void> {
		const ctx = await this.ensureContext();
		this.scheduleNote(ctx, frequencyFromMidi(midi), ctx.currentTime);
	}

	// Play a sequence of MIDI notes, one every `noteDuration` seconds.
	async playSequence(midis: number[]): Promise<void> {
		if (midis.length === 0) return;
		const ctx = await this.ensureContext();
		this.stopSequence();

		const step = this.config.noteDuration;
		midis.forEach((midi, i) => {
			this.scheduleNote(
				ctx,
				frequencyFromMidi(midi),
				ctx.currentTime + i * step,
			);
		});
	}

	// Cancel any pending sequence callbacks (already-scheduled audio still rings
	// out its short envelope, which is intentional and click-free).
	stopSequence(): void {
		if (this.sequenceTimer !== null) {
			clearTimeout(this.sequenceTimer);
			this.sequenceTimer = null;
		}
	}

	async dispose(): Promise<void> {
		this.stopSequence();
		if (this.ctx) {
			await this.ctx.close();
			this.ctx = null;
		}
	}

	private scheduleNote(ctx: AudioContext, freq: number, time: number): void {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = this.config.waveform;
		osc.frequency.value = freq;

		const end = time + this.config.noteDuration;
		gain.gain.setValueAtTime(0, time);
		gain.gain.linearRampToValueAtTime(this.config.volume, time + ATTACK_S);
		gain.gain.setValueAtTime(this.config.volume, end - RELEASE_S);
		gain.gain.exponentialRampToValueAtTime(0.0001, end);

		osc.connect(gain).connect(ctx.destination);
		osc.start(time);
		osc.stop(end);
	}
}
