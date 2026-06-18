/**
 * MachineCard.tsx
 * Card d'une machine à laver — Mobile First, Tailwind CSS
 * Usage : <MachineCard capacity={12} duration={45} price={3} />
 */

import { useTranslation } from 'react-i18next'

export default function CardMachine({
  name = "Machine à laver",
  capacity = 12,
  duration = 45,
  price = 3,
  statusCode = null as number | null,
  statusText = null as string | null,
}) {
  const { t, i18n } = useTranslation()

  // On ne connaît qu'une partie des codes Wi-Line (table dans i18n.ts) :
  // si le code est traduit, on l'affiche en français/anglais, sinon on garde le texte brut Wi-Line.
  const statusKey = statusCode !== null ? `wiline_status_${statusCode}` : null;
  const displayStatus = statusKey && i18n.exists(statusKey)
    ? t(statusKey)
    : statusText ?? t('machine_status_unavailable');

  return (
    <div
      className={`
        flex items-center gap-4
        bg-card rounded-2xl shadow-md
        px-4 py-3 my-2
        w-full max-w-sm
        border border-border
        transition-all duration-200
        hover:shadow-lg hover:-translate-y-0.5
      `}
    >
      {/* ── Icône machine ── */}
      <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 bg-muted rounded-xl">
        <span className="text-4xl select-none" role="img" aria-label="Icone Machine">
          🫧
        </span>
      </div>

      {/* ── Infos ── */}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="font-semibold text-foreground text-sm leading-tight truncate">
          {name}
        </span>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span>
            Capacité&nbsp;:&nbsp;
            <span className="font-medium text-foreground">{capacity}&nbsp;Kg</span>
          </span>
          <span>
            Programme&nbsp;:&nbsp;
            <span className="font-medium text-foreground">{duration}&nbsp;min</span>
          </span>
        </div>

        {/* Badge statut temps réel (Wi-Line) */}
        <span
          className={`
            inline-block w-fit mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide
            ${statusText
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }
          `}
        >
          {displayStatus}
        </span>
      </div>

      {/* ── Prix ── */}
      <div className="flex-shrink-0 text-right">
        <span className="text-2xl font-extrabold text-foreground leading-none">
          {price}&nbsp;€
        </span>
      </div>
    </div>
  );
}