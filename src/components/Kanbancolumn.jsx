import KanbanCard from "./Kanbancard";

export default function KanbanColumn({
  column,
  cards,
  onAddTask,
  onDeleteCard,
  onPointerDown,
  isDragOver,
  draggingCardId,
  colRef,
  isVertical = false,
}) {
  return (
    <section
      ref={colRef}
      className={`
        flex flex-col
        bg-surface border-2 rounded-lg overflow-hidden
        transition-all duration-200
        ${isVertical ? "w-full" : "flex-none w-70 max-h-full"}
        ${
          isDragOver
            ? "border-teal bg-teal/5 shadow-[0_0_20px_rgba(32,163,158,0.2)]"
            : "border-border-subtle"
        }
      `}
    >
      {/* Header */}
      <header
        className={`
          flex items-center justify-between border-b border-border-subtle shrink-0
          ${isVertical ? "px-3 py-3" : "px-4 py-4"}
        `}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: column.color }}
          />
          <h3 className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-text-primary">
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

      {/* Cards — in vertical mode let content grow naturally, outer page scrolls */}
      <div
        className={`
          flex flex-col gap-2
          ${isVertical ? "p-2" : "flex-1 overflow-y-auto p-3 min-h-25"}
        `}
      >
        {cards.length === 0 ? (
          <div
            className={`
              min-h-20 flex items-center justify-center
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
            />
          ))
        )}
      </div>
    </section>
  );
}
