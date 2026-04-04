// ── Types ────────────────────────────────────────────────────────────────────

export interface PeriodSchedule {
  start: string; // "HH:MM"
  end:   string; // "HH:MM"
}

export interface DaySchedule {
  morning:   PeriodSchedule;
  afternoon: PeriodSchedule;
}

/** Clés des 7 jours */
export type DayKey =
  | "lundi" | "mardi" | "mercredi" | "jeudi"
  | "vendredi" | "samedi" | "dimanche";

export type WeekSchedule = Record<DayKey, DaySchedule>;

export interface WeekSchedulePickerProps {
  value:    WeekSchedule;
  onChange: (schedule: WeekSchedule) => void;
}

// ── Constantes ────────────────────────────────────────────────────────────────

const DAYS: { key: DayKey; label: string }[] = [
  { key: "lundi",     label: "Lundi"     },
  { key: "mardi",     label: "Mardi"     },
  { key: "mercredi",  label: "Mercredi"  },
  { key: "jeudi",     label: "Jeudi"     },
  { key: "vendredi",  label: "Vendredi"  },
  { key: "samedi",    label: "Samedi"    },
  { key: "dimanche",  label: "Dimanche"  },
];

export const DEFAULT_WEEK_SCHEDULE: WeekSchedule = {
  lundi:    { morning: { start: "08:00", end: "12:00" }, afternoon: { start: "14:00", end: "19:00" } },
  mardi:    { morning: { start: "08:00", end: "12:00" }, afternoon: { start: "14:00", end: "19:00" } },
  mercredi: { morning: { start: "08:00", end: "12:00" }, afternoon: { start: "14:00", end: "19:00" } },
  jeudi:    { morning: { start: "08:00", end: "12:00" }, afternoon: { start: "14:00", end: "19:00" } },
  vendredi: { morning: { start: "08:00", end: "12:00" }, afternoon: { start: "14:00", end: "19:00" } },
  samedi:   { morning: { start: "09:00", end: "13:00" }, afternoon: { start: "14:00", end: "18:00" } },
  dimanche: { morning: { start: "09:00", end: "12:00" }, afternoon: { start: "",      end: ""      } },
};

// ── TimePair ──────────────────────────────────────────────────────────────────

interface TimePairProps {
  label:         string;
  startId:       string;
  endId:         string;
  start:         string;
  end:           string;
  onChangeStart: (v: string) => void;
  onChangeEnd:   (v: string) => void;
}

function TimePair({ label, startId, endId, start, end, onChangeStart, onChangeEnd }: TimePairProps) {
  const inputClass = `
    w-full text-center rounded-xl border px-2 py-1.5
    text-xs font-medium text-gray-800 bg-gray-50 border-gray-200
    focus:outline-none focus:ring-2 focus:ring-gray-200
    transition-all duration-150
  `;

  return (
    <div className="grid grid-cols-[80px_1fr_auto_1fr] items-center gap-2">
      <span className="text-xs font-medium text-gray-500">{label}</span>

      <div className="flex flex-col gap-0.5">
        <label htmlFor={startId} className="text-[9px] font-medium text-gray-400 uppercase tracking-wide">
          Ouverture
        </label>
        <input
          id={startId}
          type="time"
          value={start}
          onChange={(e) => onChangeStart(e.target.value)}
          className={inputClass}
        />
      </div>

      <span className="text-gray-300 text-xs mt-3.5 select-none">→</span>

      <div className="flex flex-col gap-0.5">
        <label htmlFor={endId} className="text-[9px] font-medium text-gray-400 uppercase tracking-wide">
          Fermeture
        </label>
        <input
          id={endId}
          type="time"
          value={end}
          onChange={(e) => onChangeEnd(e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function WeekSchedulePicker({ value, onChange }: WeekSchedulePickerProps) {
  const patch = (
    day: DayKey,
    period: "morning" | "afternoon",
    changes: Partial<PeriodSchedule>
  ) =>
    onChange({
      ...value,
      [day]: {
        ...value[day],
        [period]: { ...value[day][period], ...changes },
      },
    });

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white shadow-md overflow-hidden">

      {/* ── En-tête ── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
          className="text-gray-400"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8"  y1="2" x2="8"  y2="6" />
          <line x1="3"  y1="10" x2="21" y2="10" />
        </svg>
        <span className="text-sm font-semibold text-gray-900">Horaires de la semaine</span>
      </div>

      {/* ── 7 jours ── */}
      {DAYS.map(({ key, label }, index) => (
        <div
          key={key}
          className={`px-4 py-3 flex flex-col gap-2 ${index < DAYS.length - 1 ? "border-b border-gray-100" : ""}`}
        >
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            {label}
          </span>

          <TimePair
            label="Matin"
            startId={`${key}-morning-start`}
            endId={`${key}-morning-end`}
            start={value[key].morning.start}
            end={value[key].morning.end}
            onChangeStart={(v) => patch(key, "morning", { start: v })}
            onChangeEnd={(v)   => patch(key, "morning", { end: v   })}
          />

          <TimePair
            label="Après-midi"
            startId={`${key}-afternoon-start`}
            endId={`${key}-afternoon-end`}
            start={value[key].afternoon.start}
            end={value[key].afternoon.end}
            onChangeStart={(v) => patch(key, "afternoon", { start: v })}
            onChangeEnd={(v)   => patch(key, "afternoon", { end: v   })}
          />
        </div>
      ))}

    </div>
  );
}