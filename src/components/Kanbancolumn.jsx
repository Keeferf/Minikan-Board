import KanbanCard from "./Kanbancard";
import { Plus } from "lucide-react";

/**
 * layout prop:
 *  "stack"      — full-width, no internal scroll (outer page scrolls)
 *  "grid"       — full cell of a 2×2 grid, internal scroll
 *  "horizontal" — fixed w-70, internal scroll
 *  "wide"       — fixed w-84, internal scroll, slightly roomier padding
 */
export default function KanbanColumn({
  column,
  cards,
  onAddTask,
  onDeleteCard,
  onPointerDown,
  isDragOver,
  draggingCardId,
  colRef,
  layout = "horizontal",
  activeTag = "",
}) {
  const isStack = layout === "stack";
  const isWide = layout === "wide";

  const widthClass =
    layout === "horizontal" || layout === "wide"
      ? "flex-1 min-w-[220px]"
      : "w-full";

  const scrollClass = isStack ? "" : "overflow-y-auto max-h-[60vh]";
  const headerPad = isWide ? "px-5 py-4" : isStack ? "px-3 py-3" : "px-4 py-4";
  const bodyPad = isWide ? "p-4" : "p-3";
  const minEmpty = isWide ? "min-h-28" : "min-h-20";

  // Inline styles for the dynamic column color so Tailwind doesn't need to
  // generate arbitrary color classes at runtime
  const dragOverStyle = isDragOver
    ? {
        borderColor: column.color,
        backgroundColor: `${column.color}0d`, // ~5% opacity
        boxShadow: `0 0 20px ${column.color}33`, // ~20% opacity glow
      }
    : {};

  const addBtnHoverStyle = {
    "--col-color": column.color,
  };

  return (
    <section
      ref={colRef}
      style={dragOverStyle}
      className={`
        flex flex-col
        bg-surface border-2 rounded-lg overflow-hidden
        transition-all duration-200
        ${widthClass}
        ${isStack ? "" : "min-h-80"}
        ${isDragOver ? "" : "border-border-subtle"}
      `}
    >
      {/* Header */}
      <header
        className={`flex items-center justify-between border-b border-border-subtle shrink-0 ${headerPad}`}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: column.color }}
          />
          <h3
            className={`font-extrabold uppercase tracking-[0.08em] text-text-primary ${
              isWide ? "text-[13px]" : "text-[12px]"
            }`}
          >
            {column.label}
          </h3>
          <span
            className="font-mono text-[11px] text-text-muted bg-card border border-border-subtle rounded-full px-1.5 py-px transition-colors duration-150"
            style={isDragOver ? { color: column.color } : {}}
          >
            {cards.length}
          </span>
        </div>

        {/* Add button — hover color matches the column */}
        <button
          onClick={() => onAddTask(column.id)}
          style={addBtnHoverStyle}
          className="
            w-6.5 h-6.5 flex items-center justify-center rounded-sm
            text-text-muted bg-card border border-border-subtle
            transition-all duration-150
            hover:border-(--col-color)
            hover:[background:color-mix(in_srgb,var(--col-color)_10%,transparent)]
          "
        >
          <Plus size={13} strokeWidth={2} />
        </button>
      </header>

      {/* Cards */}
      <div
        className={`
          flex flex-col gap-2
          ${bodyPad}
          ${scrollClass}
          ${isStack ? "" : "min-h-25"}
        `}
      >
        {cards.length === 0 ? (
          <div
            className={`
              ${minEmpty} flex items-center justify-center
              border-2 border-dashed rounded-md transition-all duration-200
            `}
            style={
              isDragOver
                ? {
                    borderColor: column.color,
                    backgroundColor: `${column.color}1a`,
                  }
                : {}
            }
          >
            <span
              className="font-mono text-[11px] text-text-muted transition-colors duration-150"
              style={isDragOver ? { color: column.color } : {}}
            >
              {isDragOver ? "⬇ Drop here" : "Drop tasks here"}
            </span>
          </div>
        ) : (
          cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onDelete={onDeleteCard}
              onPointerDown={onPointerDown}
              isDragging={card.id === draggingCardId}
              isWide={isWide}
              activeTag={activeTag}
            />
          ))
        )}
      </div>
    </section>
  );
}
