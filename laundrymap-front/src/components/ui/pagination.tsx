export function PaginationBar({
    page,
    totalPages,
    onChange,
}: {
    page: number
    totalPages: number
    onChange: (p: number) => void
}) {
    const pages: (number | "…")[] = []

    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
        pages.push(1)
        if (page > 3) pages.push("…")
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
            pages.push(i)
        }
        if (page < totalPages - 2) pages.push("…")
        pages.push(totalPages)
    }

    return (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-1 mt-8">
            <button
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
                aria-label="Page précédente"
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors text-base"
            >
                ‹
            </button>

            {pages.map((p, i) =>
                p === "…" ? (
                    <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onChange(p as number)}
                        aria-current={p === page ? "page" : undefined}
                        aria-label={`Page ${p}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                            p === page
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                onClick={() => onChange(page + 1)}
                disabled={page === totalPages}
                aria-label="Page suivante"
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors text-base"
            >
                ›
            </button>
        </nav>
    )
}
