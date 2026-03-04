import { useState, useCallback, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import KanbanColumn from "./Kanbancolumn.jsx";
import BoardHeader from "./Boardheader.jsx";
import AddTaskModal from "./Addtaskmodal.jsx";

const COLUMNS = [
  { id: "todo", label: "To Do", color: "#52525e" },
  { id: "progress", label: "In Progress", color: "#ffba49" },
  { id: "review", label: "Review", color: "#20a39e" },
  { id: "done", label: "Done", color: "#ef5b5b" },
];

let nextId = 100;

function deserializeCard(card) {
  return {
    ...card,
    tags: card.tags ? card.tags.split(",").filter(Boolean) : [],
  };
}

export default function KanbanBoard() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalColumn, setModalColumn] = useState("todo");
  const dragCardId = useRef(null);

  // ── Load all cards from Rust/SQLite on mount ──────────────────────────
  useEffect(() => {
    invoke("get_cards")
      .then((rows) => {
        const parsed = rows.map(deserializeCard);
        setCards(parsed);

        // Keep in-memory id counter above whatever is already persisted
        if (parsed.length > 0) {
          const maxNum = parsed
            .map((c) => parseInt(c.id.replace("c", ""), 10))
            .filter(Number.isFinite)
            .reduce((a, b) => Math.max(a, b), 0);
          if (maxNum >= nextId) nextId = maxNum + 1;
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Open modal ────────────────────────────────────────────────────────
  const openAddModal = useCallback((colId = "todo") => {
    setModalColumn(colId);
    setModalOpen(true);
  }, []);

  // ── Add card ──────────────────────────────────────────────────────────
  const handleAddCard = useCallback(async (data) => {
    const newCard = { id: `c${nextId++}`, ...data };

    setCards((prev) => [...prev, newCard]); // optimistic

    try {
      await invoke("add_card", {
        id: newCard.id,
        title: newCard.title,
        description: newCard.description ?? "",
        priority: newCard.priority,
        column: newCard.column,
        tags: (newCard.tags ?? []).join(","),
      });
    } catch (err) {
      console.error("add_card failed:", err);
      setCards((prev) => prev.filter((c) => c.id !== newCard.id)); // roll back
    }
  }, []);

  // ── Delete card ───────────────────────────────────────────────────────
  const handleDeleteCard = useCallback(async (cardId) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId)); // optimistic

    try {
      await invoke("delete_card", { id: cardId });
    } catch (err) {
      console.error("delete_card failed:", err);
      invoke("get_cards")
        .then((rows) => setCards(rows.map(deserializeCard)))
        .catch(console.error);
    }
  }, []);

  // ── Drag-and-drop ─────────────────────────────────────────────────────
  const handleDragStart = useCallback((e, cardId) => {
    dragCardId.current = cardId;
  }, []);

  const handleDrop = useCallback(async (targetColId) => {
    if (!dragCardId.current) return;
    const cardId = dragCardId.current;
    dragCardId.current = null;

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, column: targetColId } : c)),
    ); // optimistic

    try {
      await invoke("move_card", { id: cardId, column: targetColId });
    } catch (err) {
      console.error("move_card failed:", err);
      invoke("get_cards")
        .then((rows) => setCards(rows.map(deserializeCard)))
        .catch(console.error);
    }
  }, []);

  const cardsByColumn = (colId) => cards.filter((c) => c.column === colId);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-base">
      <BoardHeader
        totalCards={cards.length}
        onNewTask={() => openAddModal("todo")}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="font-mono text-sm text-text-muted animate-pulse">
            Loading…
          </span>
        </div>
      ) : (
        <div className="flex-1 flex gap-4 px-7 py-5 overflow-x-auto overflow-y-hidden items-start">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              cards={cardsByColumn(col.id)}
              onAddTask={openAddModal}
              onDeleteCard={handleDeleteCard}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <AddTaskModal
          defaultColumn={modalColumn}
          onAdd={handleAddCard}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
