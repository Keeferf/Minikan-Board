import { useState, useCallback } from "react";
import KanbanColumn from "./Kanbancolumn";
import BoardHeader from "./Boardheader";
import AddTaskModal from "./Addtaskmodal";
import { COLUMNS } from "../lib/kanbanConstants";
import { useCards } from "../hooks/useCards";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useWindowWidth } from "../hooks/useWindowWidth";

// 4 columns × 280px + 3 gaps × 16px + 2 × 28px padding
const HORIZONTAL_BREAKPOINT = 1200;

export default function KanbanBoard() {
  const { cards, loading, addCard, deleteCard, moveCard } = useCards();
  const { dragging, dragOverCol, startDrag, registerCol } =
    useDragAndDrop(moveCard);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalColumn, setModalColumn] = useState("todo");

  const width = useWindowWidth();
  const isVertical = width < HORIZONTAL_BREAKPOINT;

  const openAddModal = useCallback((colId = "todo") => {
    setModalColumn(colId);
    setModalOpen(true);
  }, []);

  const cardsByColumn = (colId) => cards.filter((c) => c.column === colId);
  const draggingCard = dragging
    ? cards.find((c) => c.id === dragging.cardId)
    : null;

  return (
    <div
      className={`flex flex-col bg-base ${isVertical ? "min-h-screen" : "h-screen overflow-hidden"}`}
      style={{ userSelect: dragging ? "none" : undefined }}
    >
      <BoardHeader
        totalCards={cards.length}
        onNewTask={() => openAddModal("todo")}
        isCompact={isVertical}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="font-mono text-sm text-text-muted animate-pulse">
            Loading…
          </span>
        </div>
      ) : isVertical ? (
        // ── Vertical layout — columns stack, page scrolls as one unit ────
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
          {COLUMNS.map((col) => (
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
              isVertical
            />
          ))}
        </div>
      ) : (
        // ── Horizontal layout — columns side by side, board scrolls x ────
        <div className="flex-1 px-7 py-5 overflow-x-auto overflow-y-hidden">
          <div
            className="flex gap-4 min-w-max mx-auto"
            style={{ width: "fit-content" }}
          >
            {COLUMNS.map((col) => (
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
              />
            ))}
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
            width: 272,
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
        />
      )}
    </div>
  );
}
