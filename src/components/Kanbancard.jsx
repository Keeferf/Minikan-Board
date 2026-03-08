const PRIORITY = {
  low: {
    label: "Low",
    color: "text-text-muted  border-text-muted/30  bg-text-muted/5",
  },
  medium: {
    label: "Med",
    color: "text-gold        border-gold/40        bg-gold/5",
  },
  high: {
    label: "High",
    color: "text-coral       border-coral/40       bg-coral/5",
  },
};

const PIP = {
  low: "bg-text-muted",
  medium: "bg-gold",
  high: "bg-coral",
};

export default function KanbanCard({
  card,
  onDelete,
  onPointerDown,
  isDragging,
  isWide = false,
}) {
  const p = PRIORITY[card.priority] ?? PRIORITY.low;

  return (
    <article
      onPointerDown={(e) => onPointerDown(e, card.id)}
      style={{ touchAction: "none" }}
      className={`
        relative group
        bg-card border border-border-subtle rounded-md
        cursor-grab select-none
        transition-all duration-200
        ${isWide ? "px-4 pt-4 pb-3" : "px-3.5 pt-3.5 pb-2.5"}
        ${
          isDragging
            ? "opacity-40 scale-[0.97] border-dashed"
            : "hover:bg-card-hover hover:border-border-medium hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        }
      `}
    >
      {/* Priority pip — left edge */}
      <span
        className={`
          absolute left-0 top-1/2 -translate-y-1/2
          w-0.75 rounded-r-sm opacity-70
          transition-all duration-200
          group-hover:opacity-100
          ${PIP[card.priority] ?? PIP.low}
        `}
        style={{ height: isDragging ? "65%" : "40%" }}
      />

      {/* Title + desc */}
      <div className="mb-2.5">
        <p
          className={`font-semibold text-text-primary leading-snug tracking-[0.01em] ${
            isWide ? "text-[14px]" : "text-[13.5px]"
          }`}
        >
          {card.title}
        </p>
        {card.description && (
          <p
            className={`mt-1 font-mono text-text-secondary leading-relaxed ${
              isWide ? "text-[11.5px]" : "text-xs"
            }`}
          >
            {card.description}
          </p>
        )}
      </div>

      {/* Footer — priority + tags + delete */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className={`font-mono text-[10px] uppercase tracking-widest border rounded px-1.5 py-0.5 ${p.color}`}
        >
          {p.label}
        </span>

        {card.tags?.map((tag) => (
          <span
            key={tag}
            className="font-mono text-[10px] uppercase tracking-widest text-text-muted border border-border-subtle bg-white/3 rounded px-1.5 py-0.5"
          >
            {tag}
          </span>
        ))}

        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(card.id)}
          aria-label="Delete card"
          className="
            ml-auto w-5 h-5 rounded-full flex items-center justify-center
            text-base leading-none
            transition-all duration-150
            hover:text-coral hover:bg-coral/10
          "
        >
          ×
        </button>
      </div>
    </article>
  );
}
