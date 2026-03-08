import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import KanbanColumn from "./Kanbancolumn";
import BoardHeader from "./Boardheader";
import AddTaskModal from "./Addtaskmodal";
import BoardSidebar from "./Boardsidebar";
import { COLUMNS } from "../lib/kanbanConstants";
import { useCards } from "../hooks/useCards";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useWindowWidth } from "../hooks/useWindowWidth";
import { nanoid } from "nanoid";

function getLayout(width) {
  if (width < 640) return "stack";
  if (width < 1100) return "grid";
  if (width < 1600) return "horizontal";
  return "wide";
}

export default function KanbanBoard() {
  // ── Boards state ──────────────────────────────────────────────────────
  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [boardsLoading, setBoardsLoading] = useState(true);

  useEffect(() => {
    invoke("get_boards").then((data) => {
      setBoards(data);
      if (data.length > 0) setActiveBoardId(data[0].id);
      setBoardsLoading(false);
    });
  }, []);

  const handleAddBoard = useCallback(async (name) => {
    const board = await invoke("add_board", { board: { id: nanoid(), name } });
    setBoards((prev) => [...prev, board]);
    setActiveBoardId(board.id);
  }, []);

  const handleRenameBoard = useCallback(async (id, name) => {
    await invoke("rename_board", { id, name });
    setBoards((prev) => prev.map((b) => (b.id === id ? { ...b, name } : b)));
  }, []);

  const handleDeleteBoard = useCallback(
    async (id) => {
      try {
        await invoke("delete_board", { id });
        setBoards((prev) => {
          const next = prev.filter((b) => b.id !== id);
          if (activeBoardId === id && next.length > 0) {
            setActiveBoardId(next[0].id);
          }
          return next;
        });
      } catch (e) {
        console.error(e);
      }
    },
    [activeBoardId],
  );

  // ── Cards state (scoped to active board) ──────────────────────────────
  const { cards, loading, addCard, deleteCard, moveCard } =
    useCards(activeBoardId);
  const { dragging, dragOverCol, startDrag, registerCol } =
    useDragAndDrop(moveCard);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalColumn, setModalColumn] = useState("todo");
  const [filterTag, setFilterTag] = useState("");

  const width = useWindowWidth();
  const sidebarWidth = sidebarCollapsed ? 48 : 208;
  const availableWidth = width - sidebarWidth;
  const layout = getLayout(availableWidth);

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
  const activeBoard = boards.find((b) => b.id === activeBoardId);

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

  if (boardsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-base">
        <span className="font-mono text-sm text-text-muted animate-pulse">
          Loading…
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen bg-base overflow-hidden"
      style={{ userSelect: dragging ? "none" : undefined }}
    >
      {/* Sidebar */}
      <BoardSidebar
        boards={boards}
        activeBoardId={activeBoardId}
        onSelectBoard={(id) => {
          setActiveBoardId(id);
          setFilterTag("");
        }}
        onAddBoard={handleAddBoard}
        onRenameBoard={handleRenameBoard}
        onDeleteBoard={handleDeleteBoard}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <BoardHeader
          totalCards={cards.length}
          onNewTask={() => openAddModal("todo")}
          layout={layout}
          filterTag={filterTag}
          onFilterTag={setFilterTag}
          boardName={activeBoard?.name}
        />

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="font-mono text-sm text-text-muted animate-pulse">
              Loading…
            </span>
          </div>
        ) : layout === "stack" ? (
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 flex flex-col gap-3">
            {COLUMNS.map(renderColumn)}
          </div>
        ) : layout === "grid" ? (
          <div className="flex-1 min-h-0 overflow-y-auto p-3">
            <div className="grid grid-cols-2 gap-3 min-h-full">
              {COLUMNS.map(renderColumn)}
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 px-7 py-5 overflow-x-auto overflow-y-auto">
            <div className="flex gap-4 h-full w-full">
              {COLUMNS.map(renderColumn)}
            </div>
          </div>
        )}

        {/* Drag ghost */}
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
            onAdd={(card) => addCard({ ...card, board_id: activeBoardId })}
            onClose={() => setModalOpen(false)}
            layout={layout}
          />
        )}
      </div>
    </div>
  );
}
