import { useState, useCallback } from "react";
import KanbanColumn from "./Kanbancolumn";
import BoardHeader from "./Boardheader";
import AddTaskModal from "./Addtaskmodal";
import { COLUMNS } from "../lib/kanbanConstants";
import { useCards } from "../hooks/useCards";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useWindowWidth } from "../hooks/useWindowWidth";

/**
 * Layout breakpoints:
 *  "stack"      < 640px   — 1-col vertical stack, page scrolls
 *  "grid"       640–1100  — 2×2 grid, each cell scrolls independently
 *  "horizontal" 1100–1600 — 4-col side-by-side, standard width (w-70)
 *  "wide"       > 1600    — 4-col side-by-side, wider columns (w-84)
 */
function getLayout(width) {
  if (width < 640) return "stack";
  if (width < 1100) return "grid";
  if (width < 1600) return "horizontal";
  return "wide";
}

export default function KanbanBoard() {
  const { cards, loading, addCard, deleteCard, moveCard } = useCards();
  const { dragging, dragOverCol, startDrag, registerCol } =
    useDragAndDrop(moveCard);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalColumn, setModalColumn] = useState("todo");
  const [filterTag, setFilterTag] = useState("");

  const width = useWindowWidth();
  const layout = getLayout(width);

  const openAddModal = useCallback((colId = "todo") => {
    setModalColumn(colId);
    setModalOpen(true);
  }, []);

  const cardsByColumn = (colId) => {
    const query = filterTag.trim().toLowerCase();
    return cards
      .filter((c) => c.column === colId)
      .filter((c) =>
        query ? c.tags?.some((t) => t.toLowerCase().includes(query)) : true,
      );
  };
  const draggingCard = dragging
    ? cards.find((c) => c.id === dragging.cardId)
    : null;

  // ── Shared column renderer ────────────────────────────────────────────────
  const renderColumn = (col) => (
    <KanbanColumn
      key={col.id}
      column={col}
      cards={cardsByColumn(col.id)}
      onAddTask={openAddModal}
      onDeleteCard={deleteCard}
      onPointerDown={startDrag}
      isDragOver={dragOverCol === col.id}
      draggingCardId={dragging?.cardId}
      colRef={registerCol(col.id)}
      layout={layout}
      activeTag={filterTag.trim().toLowerCase()}
    />
  );

  return (
    <div
      className="flex flex-col bg-base min-h-screen h-screen overflow-y-auto"
      style={{ userSelect: dragging ? "none" : undefined }}
    >
      <BoardHeader
        totalCards={cards.length}
        onNewTask={() => openAddModal("todo")}
        layout={layout}
        filterTag={filterTag}
        onFilterTag={setFilterTag}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="font-mono text-sm text-text-muted animate-pulse">
            Loading…
          </span>
        </div>
      ) : layout === "stack" ? (
        // ── Stack: 1-col, outer page scrolls ─────────────────────────────
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 flex flex-col gap-3">
          {COLUMNS.map(renderColumn)}
        </div>
      ) : layout === "grid" ? (
        // ── Grid: 2×2, each column scrolls internally ────────────────────
        <div className="flex-1 min-h-0 overflow-y-auto p-3">
          <div className="grid grid-cols-2 gap-3 min-h-full">
            {COLUMNS.map(renderColumn)}
          </div>
        </div>
      ) : (
        // ── Horizontal / Wide: 4-col row, fluid columns fill available space ──
        <div className="flex-1 min-h-0 px-7 py-5 overflow-x-auto overflow-y-auto">
          <div className="flex gap-4 h-full w-full">
            {COLUMNS.map(renderColumn)}
          </div>
        </div>
      )}

      {/* Floating ghost card that follows the cursor */}
      {dragging && draggingCard && (
        <div
          id="drag-ghost"
          style={{
            position: "fixed",
            left: dragging.x + 14,
            top: dragging.y - 18,
            width: layout === "wide" ? 316 : 272,
            pointerEvents: "none",
            zIndex: 9999,
            opacity: 0.88,
            transform: "rotate(2deg)",
          }}
          className="bg-card border border-teal rounded-md px-3.5 pt-3.5 pb-2.5 shadow-[0_20px_48px_rgba(0,0,0,0.55)]"
        >
          <p className="text-[13.5px] font-semibold text-text-primary leading-snug truncate">
            {draggingCard.title}
          </p>
          {draggingCard.description && (
            <p className="mt-1 font-mono text-xs text-text-secondary leading-relaxed line-clamp-2">
              {draggingCard.description}
            </p>
          )}
        </div>
      )}

      {modalOpen && (
        <AddTaskModal
          defaultColumn={modalColumn}
          onAdd={addCard}
          onClose={() => setModalOpen(false)}
          layout={layout}
        />
      )}
    </div>
  );
}
