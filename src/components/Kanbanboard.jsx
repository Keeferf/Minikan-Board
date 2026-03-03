import { useState, useCallback, useRef } from "react";
import KanbanColumn from "./Kanbancolumn.jsx";
import BoardHeader from "./BoardHeader";
import AddTaskModal from "./Addtaskmodal.jsx";

const COLUMNS = [
  { id: "todo", label: "To Do", color: "#52525e" },
  { id: "progress", label: "In Progress", color: "#ffba49" },
  { id: "review", label: "Review", color: "#20a39e" },
  { id: "done", label: "Done", color: "#ef5b5b" },
];

const SEED_CARDS = [
  {
    id: "c1",
    title: "Set up Tauri project scaffolding",
    description: "Init Vite + React + Tauri and verify builds.",
    priority: "high",
    column: "done",
    tags: ["setup"],
  },
  {
    id: "c2",
    title: "Design system & color tokens",
    description: "Define CSS variables from brand guide.",
    priority: "medium",
    column: "done",
    tags: ["design"],
  },
  {
    id: "c3",
    title: "Build Kanban board UI",
    description: "Modular components with DnD support.",
    priority: "high",
    column: "progress",
    tags: ["ui"],
  },
  {
    id: "c4",
    title: "Wire up drag-and-drop",
    description: "HTML5 DnD API between columns.",
    priority: "medium",
    column: "progress",
    tags: ["ui", "dnd"],
  },
  {
    id: "c5",
    title: "Persist board state to disk",
    description: "Use Tauri fs plugin for JSON storage.",
    priority: "medium",
    column: "review",
    tags: ["tauri"],
  },
  {
    id: "c6",
    title: "Add keyboard shortcuts",
    description: "n = new task, Esc = close modal.",
    priority: "low",
    column: "todo",
    tags: ["a11y"],
  },
  {
    id: "c7",
    title: "System tray integration",
    description: "Quick-add task from tray menu.",
    priority: "low",
    column: "todo",
    tags: ["tauri"],
  },
];

let nextId = 100;

export default function KanbanBoard() {
  const [cards, setCards] = useState(SEED_CARDS);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalColumn, setModalColumn] = useState("todo");
  const dragCardId = useRef(null);

  const openAddModal = useCallback((colId = "todo") => {
    setModalColumn(colId);
    setModalOpen(true);
  }, []);

  const handleAddCard = useCallback((data) => {
    setCards((prev) => [...prev, { id: `c${nextId++}`, ...data }]);
  }, []);

  const handleDeleteCard = useCallback((cardId) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  }, []);

  const handleDragStart = useCallback((e, cardId) => {
    dragCardId.current = cardId;
  }, []);

  const handleDrop = useCallback((targetColId) => {
    if (!dragCardId.current) return;
    setCards((prev) =>
      prev.map((c) =>
        c.id === dragCardId.current ? { ...c, column: targetColId } : c,
      ),
    );
    dragCardId.current = null;
  }, []);

  const cardsByColumn = (colId) => cards.filter((c) => c.column === colId);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-base">
      <BoardHeader
        totalCards={cards.length}
        onNewTask={() => openAddModal("todo")}
      />

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
