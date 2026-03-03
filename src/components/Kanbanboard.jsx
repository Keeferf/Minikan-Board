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

let nextId = 100;

export default function KanbanBoard() {
  const [cards, setCards] = useState([]);
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
