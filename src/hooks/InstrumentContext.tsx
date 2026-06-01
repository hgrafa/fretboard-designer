import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { INSTRUMENTS, matchInstrument } from "@/core/instruments";
import { loadTuningState, saveTuningState } from "@/lib/tuningStorage";
import type { NoteName, Tuning } from "@/types/music";

interface InstrumentState {
	tuning: Tuning;
	instrumentId: string;
	setInstrument: (id: string) => void;
	setStringTuning: (stringIndex: number, note: NoteName) => void;
	setStringCount: (n: number) => void;
}

const InstrumentContext = createContext<InstrumentState | null>(null);

export function InstrumentProvider({ children }: { children: ReactNode }) {
	const [tuning, setTuning] = useState<Tuning>(() => loadTuningState().tuning);
	const instrumentId = useMemo(() => matchInstrument(tuning), [tuning]);

	useEffect(() => {
		saveTuningState({ instrumentId, tuning });
	}, [instrumentId, tuning]);

	const setInstrument = useCallback((id: string) => {
		const inst = INSTRUMENTS.find((i) => i.id === id);
		if (!inst) return;
		setTuning([...inst.tuning]);
	}, []);

	const setStringTuning = useCallback((stringIndex: number, note: NoteName) => {
		setTuning((prev) => {
			const next = [...prev];
			next[stringIndex] = note;
			return next;
		});
	}, []);

	const setStringCount = useCallback((n: number) => {
		const count = Math.max(1, Math.min(12, n));
		setTuning((prev) => {
			if (count === prev.length) return prev;
			if (count < prev.length) {
				return prev.slice(prev.length - count);
			}
			const toAdd = count - prev.length;
			return [...(Array(toAdd).fill("E") as NoteName[]), ...prev];
		});
	}, []);

	const value = useMemo<InstrumentState>(
		() => ({
			tuning,
			instrumentId,
			setInstrument,
			setStringTuning,
			setStringCount,
		}),
		[tuning, instrumentId, setInstrument, setStringTuning, setStringCount],
	);

	return (
		<InstrumentContext.Provider value={value}>
			{children}
		</InstrumentContext.Provider>
	);
}

export function useInstrument(): InstrumentState {
	const ctx = useContext(InstrumentContext);
	if (!ctx) {
		throw new Error("useInstrument must be used within a FretboardProvider");
	}
	return ctx;
}
