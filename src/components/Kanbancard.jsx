import { useState } from "react";

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

// Left-edge pip color per priority
const PIP = {
  low: "bg-text-muted",
  medium: "bg-gold",
  high: "bg-coral",
};

export default function KanbanCard({ card, onDelete, onDragStart }) {
  const [isDragging, setIsDragging] = useState(false);
  const p = PRIORITY[card.priority] ?? PRIORITY.low;

  const handleDragStart = (e) => {
    setIsDragging(true);
    onDragStart(e, card.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <article
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
      className={`
        relative group
        bg-card border border-border-subtle rounded-md
        px-3.5 pt-3.5 pb-2.5
        cursor-grab select-none
        transition-all duration-200
        hover:bg-card-hover hover:border-border-medium hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]
        ${isDragging ? "dragging shadow-[0_20px_48px_rgba(0,0,0,0.5)]" : ""}
      `}
    >
      {/* Priority pip — left edge */}
      <span
        className={`
          absolute left-0 top-1/2 -translate-y-1/2
          w-[3px] rounded-r-sm opacity-70
          transition-all duration-200
          group-hover:opacity-100
          ${PIP[card.priority] ?? PIP.low}
        `}
        style={{ height: isDragging ? "65%" : undefined }}
      />

      {/* Title + desc */}
      <div className="mb-2.5">
        <p className="text-[13.5px] font-semibold text-text-primary leading-snug tracking-[0.01em]">
          {card.title}
        </p>
        {card.description && (
          <p className="mt-1 font-mono text-xs text-text-secondary leading-relaxed">
            {card.description}
          </p>
        )}
      </div>

      {/* Footer — priority + tags + delete */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Priority badge */}
        <span
          className={`font-mono text-[10px] uppercase tracking-widest border rounded px-1.5 py-0.5 ${p.color}`}
        >
          {p.label}
        </span>

        {card.tags?.map((tag) => (
          <span
            key={tag}
            className="font-mono text-[10px] uppercase tracking-widest text-text-muted border border-border-subtle bg-white/[0.03] rounded px-1.5 py-0.5"
          >
            {tag}
          </span>
        ))}

        {/* Delete — pushes to far right */}
        <button
          onClick={() => onDelete(card.id)}
          aria-label="Delete card"
          className="
            ml-auto w-5 h-5 rounded-full flex items-center justify-center
            text-base leading-none text-text-muted
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
