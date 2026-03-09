import { X, Pencil } from "lucide-react";

const PRIORITY = {
  low: {
    label: "Low",
    color: "text-text-muted  border-text-muted/30  bg-text-muted/5",
    hoverBorder: "rgba(82,82,94,0.4)",
  },
  medium: {
    label: "Med",
    color: "text-gold border-gold/40 bg-gold/5",
    hoverBorder: "rgba(255,186,73,0.35)",
  },
  high: {
    label: "High",
    color: "text-coral border-coral/40 bg-coral/5",
    hoverBorder: "rgba(239,91,91,0.35)",
  },
};

const PIP = {
  low: "bg-text-muted",
  medium: "bg-gold",
  high: "bg-coral",
};

const TAG_MATCH_STYLES = [
  "text-gold  border-gold/50  bg-gold/10",
  "text-coral border-coral/50 bg-coral/10",
  "text-teal  border-teal/50  bg-teal/10",
];

export default function KanbanCard({
  card,
  onDelete,
  onEdit,
  onPointerDown,
  isDragging,
  isWide = false,
  activeTag = "",
}) {
  const p = PRIORITY[card.priority] ?? PRIORITY.low;

  return (
    <article
      onPointerDown={(e) => onPointerDown(e, card.id)}
      style={{
        touchAction: "none",
        "--hover-border": p.hoverBorder,
      }}
      className={`
        relative group
        bg-card border border-border-subtle rounded-md
        cursor-grab select-none
        transition-all duration-200
        ${isWide ? "px-4 pt-4 pb-3" : "px-3.5 pt-3.5 pb-2.5"}
        ${
          isDragging
            ? "opacity-40 scale-[0.97] border-dashed"
            : "hover:bg-card-hover hover:border-(--hover-border) hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
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
            className={`mt-1 font-mono text-text-secondary leading-relaxed wrap-break-word whitespace-pre-wrap ${
              isWide ? "text-[11.5px]" : "text-xs"
            }`}
          >
            {card.description}
          </p>
        )}
      </div>

      {/* Footer — priority + tags + actions */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className={`font-mono text-[10px] uppercase tracking-widest border rounded px-1.5 py-0.5 ${p.color}`}
        >
          {p.label}
        </span>

        {card.tags?.map((tag, i) => {
          const isMatch =
            activeTag && tag.toLowerCase().includes(activeTag.toLowerCase());
          const matchStyle = TAG_MATCH_STYLES[i % TAG_MATCH_STYLES.length];
          return (
            <span
              key={tag}
              className={`
                font-mono text-[10px] uppercase tracking-widest rounded px-1.5 py-0.5 border
                transition-colors duration-150
                ${isMatch ? matchStyle : "text-text-muted border-border-subtle bg-white/3"}
              `}
            >
              {tag}
            </span>
          );
        })}

        {/* Edit + Delete — appear on hover, grouped on the right */}
        <div className="ml-auto flex items-center gap-1">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onEdit(card)}
            aria-label="Edit card"
            className="
              w-5 h-5 rounded-full flex items-center justify-center
              text-text-muted opacity-0 group-hover:opacity-100
              transition-all duration-150
              hover:text-teal hover:bg-teal/10
            "
          >
            <Pencil size={11} strokeWidth={2.5} />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(card.id)}
            aria-label="Delete card"
            className="
              w-5 h-5 rounded-full flex items-center justify-center
              text-text-muted opacity-0 group-hover:opacity-100
              transition-all duration-150
              hover:text-coral hover:bg-coral/10
            "
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </article>
  );
}
