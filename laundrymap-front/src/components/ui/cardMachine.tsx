/**
 * MachineCard.tsx
 * Card d'une machine à laver — Mobile First, Tailwind CSS
 * Usage : <MachineCard capacity={12} duration={45} price={3} />
 */

export default function CardMachine({
  name = "Machine à laver",
  capacity = 12,
  duration = 45,
  price = 3,
  available = true,
}) {
  return (
    <div
      className={`
        flex items-center gap-4 
        bg-white rounded-2xl shadow-md
        px-4 py-3 my-2
        w-full max-w-sm
        border border-gray-100
        transition-all duration-200
        ${available ? "hover:shadow-lg hover:-translate-y-0.5" : "opacity-60 cursor-not-allowed"}
      `}
    >
      {/* ── Icône machine ── */}
      <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 bg-gray-100 rounded-xl">
        <span className="text-4xl select-none" role="img" aria-label="Icone Machine">
          🫧
        </span>
      </div>

      {/* ── Infos ── */}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="font-semibold text-gray-800 text-sm leading-tight truncate">
          {name}
        </span>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
          <span>
            Capacité&nbsp;:&nbsp;
            <span className="font-medium text-gray-700">{capacity}&nbsp;Kg</span>
          </span>
          <span>
            Programme&nbsp;:&nbsp;
            <span className="font-medium text-gray-700">{duration}&nbsp;min</span>
          </span>
        </div>

        {/* Badge disponibilité */}
        <span
          className={`
            inline-block w-fit mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide
            ${available
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
            }
          `}
        >
          {available ? "Disponible" : "Occupée"}
        </span>
      </div>

      {/* ── Prix ── */}
      <div className="flex-shrink-0 text-right">
        <span className="text-2xl font-extrabold text-gray-900 leading-none">
          {price}&nbsp;€
        </span>
      </div>
    </div>
  );
}