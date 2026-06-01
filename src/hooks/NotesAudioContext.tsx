import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { OutputDevice } from "@/audio/devices";
import { buildAscendingMidis } from "@/audio/noteSequence";
import { NoteSynth, type Waveform } from "@/audio/noteSynth";
import { spelledToPitchClass } from "@/core/notes";
import { getPitchAtPosition, midiNumber } from "@/core/pitch";
import type { FretPosition } from "@/types/music";
import { useAudioDevices } from "./AudioDevicesContext";
import { useInput } from "./InputContext";
import { useInstrument } from "./InstrumentContext";

interface NotesAudioState {
	volume: number;
	waveform: Waveform;
	noteDuration: number; // seconds per note
	canPlay: boolean; // there's a note set to play
	// Output routing (shares the device list, keeps its own selection)
	routingSupported: boolean;
	devices: OutputDevice[];
	deviceId: string;
	setVolume: (v: number) => void;
	setWaveform: (w: Waveform) => void;
	setNoteDuration: (s: number) => void;
	setDeviceId: (id: string) => void;
	refreshDevices: () => Promise<void>;
	playScale: () => void;
	playPosition: (pos: FretPosition) => void;
}

const NotesAudioContext = createContext<NotesAudioState | null>(null);

export function NotesAudioProvider({ children }: { children: ReactNode }) {
	const synthRef = useRef<NoteSynth | null>(null);
	if (synthRef.current === null) synthRef.current = new NoteSynth();
	const synth = synthRef.current;

	const { noteSet } = useInput();
	const { tuning } = useInstrument();
	const {
		routingSupported,
		devices,
		refresh: refreshDevices,
	} = useAudioDevices();

	const [volume, setVolumeState] = useState(0.5);
	const [waveform, setWaveformState] = useState<Waveform>("triangle");
	const [noteDuration, setNoteDurationState] = useState(0.45);
	const [deviceId, setDeviceIdState] = useState("");

	// Release the audio context on unmount.
	useEffect(() => {
		return () => {
			void synth.dispose();
		};
	}, [synth]);

	const setVolume = useCallback(
		(v: number) => {
			setVolumeState(v);
			synth.configure({ volume: v });
		},
		[synth],
	);

	const setWaveform = useCallback(
		(w: Waveform) => {
			setWaveformState(w);
			synth.configure({ waveform: w });
		},
		[synth],
	);

	const setNoteDuration = useCallback(
		(s: number) => {
			setNoteDurationState(s);
			synth.configure({ noteDuration: s });
		},
		[synth],
	);

	const setDeviceId = useCallback(
		(id: string) => {
			setDeviceIdState(id);
			void synth.setOutputDevice(id);
		},
		[synth],
	);

	const playScale = useCallback(() => {
		if (!noteSet) return;
		const root = noteSet.root ?? noteSet.notes[0];
		if (!root) return;
		const rootPc = spelledToPitchClass(root);
		const pitchClasses = noteSet.notes.map(spelledToPitchClass);
		void synth.playSequence(buildAscendingMidis(rootPc, pitchClasses));
	}, [synth, noteSet]);

	const playPosition = useCallback(
		(pos: FretPosition) => {
			// FretPosition.string is 1 = highest pitch; tuning is low→high.
			const stringIndex = tuning.length - pos.string;
			const pitch = getPitchAtPosition(tuning, stringIndex, pos.fret);
			void synth.playMidi(midiNumber(pitch));
		},
		[synth, tuning],
	);

	const value = useMemo<NotesAudioState>(
		() => ({
			volume,
			waveform,
			noteDuration,
			canPlay: Boolean(noteSet && noteSet.notes.length > 0),
			routingSupported,
			devices,
			deviceId,
			setVolume,
			setWaveform,
			setNoteDuration,
			setDeviceId,
			refreshDevices,
			playScale,
			playPosition,
		}),
		[
			volume,
			waveform,
			noteDuration,
			noteSet,
			routingSupported,
			devices,
			deviceId,
			setVolume,
			setWaveform,
			setNoteDuration,
			setDeviceId,
			refreshDevices,
			playScale,
			playPosition,
		],
	);

	return (
		<NotesAudioContext.Provider value={value}>
			{children}
		</NotesAudioContext.Provider>
	);
}

export function useNotesAudio(): NotesAudioState {
	const ctx = useContext(NotesAudioContext);
	if (!ctx) {
		throw new Error("useNotesAudio must be used within a NotesAudioProvider");
	}
	return ctx;
}
