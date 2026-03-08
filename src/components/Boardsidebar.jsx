import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X, LayoutDashboard } from "lucide-react";

export default function BoardSidebar({
  boards,
  activeBoardId,
  onSelectBoard,
  onAddBoard,
  onRenameBoard,
  onDeleteBoard,
  collapsed,
  onToggle,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [newBoardName, setNewBoardName] = useState("");
  const [addingNew, setAddingNew] = useState(false);

  const startEdit = (board) => {
    setEditingId(board.id);
    setEditingName(board.name);
  };

  const commitEdit = () => {
    if (editingName.trim()) {
      onRenameBoard(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName("");
  };

  const commitNew = () => {
    if (newBoardName.trim()) {
      onAddBoard(newBoardName.trim());
    }
    setNewBoardName("");
    setAddingNew(false);
  };

  return (
    <aside
      className={`
        flex flex-col shrink-0 bg-surface border-r border-border-subtle
        transition-all duration-200 overflow-hidden
        ${collapsed ? "w-12" : "w-52"}
      `}
    >
      {/* Sidebar header */}
      <div
        className={`
          flex items-center border-b border-border-subtle shrink-0
          ${collapsed ? "justify-center px-0 py-4" : "justify-between px-4 py-4"}
        `}
      >
        {!collapsed && (
          <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-text-muted">
            Boards
          </span>
        )}
        <button
          onClick={onToggle}
          className="w-6 h-6 flex items-center justify-center rounded-sm text-text-muted hover:text-text-primary hover:bg-card transition-all duration-150"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <LayoutDashboard size={14} />
        </button>
      </div>

      {/* Board list */}
      <div className="flex-1 overflow-y-auto py-2">
        {boards.map((board) => {
          const isActive = board.id === activeBoardId;
          const isEditing = editingId === board.id;

          return (
            <div
              key={board.id}
              className={`
                group relative flex items-center gap-2 mx-2 mb-0.5 rounded-sm
                transition-all duration-150 cursor-pointer
                ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2"}
                ${
                  isActive
                    ? "bg-teal/10 text-teal"
                    : "text-text-secondary hover:bg-card hover:text-text-primary"
                }
              `}
              onClick={() => !isEditing && onSelectBoard(board.id)}
            >
              {/* Active indicator pip */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-teal rounded-r-sm" />
              )}

              {collapsed ? (
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-teal" : "bg-text-muted"}`}
                  title={board.name}
                />
              ) : isEditing ? (
                <div className="flex items-center gap-1.5 w-full">
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 min-w-0 bg-card border border-teal rounded-sm px-2 py-0.5 text-[12px] text-text-primary focus:outline-none"
                  />
                  <button
                    onClick={commitEdit}
                    className="text-teal hover:brightness-125"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-text-muted hover:text-text-primary"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 min-w-0 text-[12.5px] font-medium truncate">
                    {board.name}
                  </span>
                  {/* Action buttons — only visible on hover */}
                  <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(board);
                      }}
                      className="w-4 h-4 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBoard(board.id);
                      }}
                      className="w-4 h-4 flex items-center justify-center text-text-muted hover:text-coral transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Add board */}
      {!collapsed && (
        <div className="border-t border-border-subtle p-2">
          {addingNew ? (
            <div className="flex items-center gap-1.5 px-1">
              <input
                autoFocus
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitNew();
                  if (e.key === "Escape") {
                    setAddingNew(false);
                    setNewBoardName("");
                  }
                }}
                placeholder="Board name…"
                className="flex-1 min-w-0 bg-card border border-teal rounded-sm px-2 py-1 text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <button
                onClick={commitNew}
                className="text-teal hover:brightness-125"
              >
                <Check size={13} />
              </button>
              <button
                onClick={() => {
                  setAddingNew(false);
                  setNewBoardName("");
                }}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingNew(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-[12px] font-medium text-text-muted hover:text-text-primary hover:bg-card transition-all duration-150"
            >
              <Plus size={13} />
              New Board
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
