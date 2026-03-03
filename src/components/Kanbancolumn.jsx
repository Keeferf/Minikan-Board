import { useState } from "react";
import KanbanCard from "./KanbanCard";

export default function KanbanColumn({
  column,
  cards,
  onAddTask,
  onDeleteCard,
  onDragStart,
  onDrop,
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(column.id);
  };

  return (
    <section
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        flex-none w-[280px] flex flex-col max-h-full
        bg-surface border rounded-lg overflow-hidden
        transition-all duration-200
        ${
          isDragOver
            ? "border-teal shadow-[0_0_0_1px_#20a39e,inset_0_0_24px_rgba(32,163,158,0.05)]"
            : "border-border-subtle"
        }
      `}
    >
      {/* Column header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-border-subtle flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Colored dot */}
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: column.color }}
          />
          <h3 className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-text-primary">
            {column.label}
          </h3>
          <span className="font-mono text-[11px] text-text-muted bg-card border border-border-subtle rounded-full px-1.5 py-px leading-relaxed">
            {cards.length}
          </span>
        </div>

        <button
          onClick={() => onAddTask(column.id)}
          aria-label={`Add task to ${column.label}`}
          className="
            w-[26px] h-[26px] flex items-center justify-center rounded-sm
            text-lg font-light text-text-muted bg-card border border-border-subtle
            transition-all duration-150
            hover:text-teal hover:border-teal hover:bg-teal/10
          "
        >
          +
        </button>
      </header>

      {/* Drop pulse indicator */}
      {isDragOver && (
        <div className="h-0.5 mx-4 mt-1.5 bg-teal rounded-full animate-pulse-line flex-shrink-0" />
      )}

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {cards.length === 0 ? (
          <div className="flex-1 min-h-[80px] flex items-center justify-center border border-dashed border-border-subtle rounded-md my-1">
            <span className="font-mono text-[11px] text-text-muted tracking-wider">
              Drop tasks here
            </span>
          </div>
        ) : (
          cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onDelete={onDeleteCard}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </section>
  );
}
