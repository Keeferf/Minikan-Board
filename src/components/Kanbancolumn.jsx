import KanbanCard from "./Kanbancard";

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

  // Width: stack & grid fill their container; horizontal/wide flex fluidly
  // min-w sets the point at which a scrollbar appears rather than clipping
  const widthClass =
    layout === "horizontal" || layout === "wide"
      ? "flex-1 min-w-[220px]"
      : "w-full"; // stack & grid

  // In grid/horizontal/wide the column scrolls internally only when it has room
  const scrollClass = isStack ? "" : "overflow-y-auto max-h-[60vh]";

  // Padding scales up slightly on wide
  const headerPad = isWide ? "px-5 py-4" : isStack ? "px-3 py-3" : "px-4 py-4";
  const bodyPad = isWide ? "p-4" : "p-3";
  const minEmpty = isWide ? "min-h-28" : "min-h-20";

  return (
    <section
      ref={colRef}
      className={`
        flex flex-col
        bg-surface border-2 rounded-lg overflow-hidden
        transition-all duration-200
        ${widthClass}
        ${isStack ? "" : "min-h-80"}
        ${
          isDragOver
            ? "border-teal bg-teal/5 shadow-[0_0_20px_rgba(32,163,158,0.2)]"
            : "border-border-subtle"
        }
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
          <span className="font-mono text-[11px] text-text-muted bg-card border border-border-subtle rounded-full px-1.5 py-px">
            {cards.length}
          </span>
        </div>

        <button
          onClick={() => onAddTask(column.id)}
          className="w-6.5 h-6.5 flex items-center justify-center rounded-sm text-lg font-light text-text-muted bg-card border border-border-subtle transition-all hover:text-teal hover:border-teal hover:bg-teal/10"
        >
          +
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
              border-2 border-dashed rounded-md transition-colors
              ${isDragOver ? "border-teal bg-teal/10" : "border-border-subtle"}
            `}
          >
            <span className="font-mono text-[11px] text-text-muted">
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
