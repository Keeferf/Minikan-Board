import { useState, useEffect } from "react";
import { X, ChevronDown, Plus, Pencil } from "lucide-react";
import { COLUMNS } from "../lib/kanbanConstants";

const PRIORITY_STYLES = {
  active: {
    low: "text-text-secondary border-text-secondary/50 bg-text-secondary/10",
    medium: "text-gold  border-gold/50  bg-gold/10",
    high: "text-coral border-coral/50 bg-coral/10",
  },
  idle: "text-text-muted border-border-subtle bg-surface hover:text-text-primary hover:border-border-medium",
};

// Pass initialCard to open in edit mode, omit it for add mode
export default function AddTaskModal({
  defaultColumn,
  onAdd,
  onEdit,
  onClose,
  layout = "horizontal",
  initialCard = null,
}) {
  const isEditing = initialCard !== null;

  const [title, setTitle] = useState(initialCard?.title ?? "");
  const [desc, setDesc] = useState(initialCard?.description ?? "");
  const [priority, setPriority] = useState(initialCard?.priority ?? "medium");
  const [column, setColumn] = useState(
    initialCard?.column ?? defaultColumn ?? "todo",
  );
  const [tags, setTags] = useState(
    initialCard ? (initialCard.tags ?? []).join(", ") : "",
  );
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    const payload = {
      title: title.trim(),
      description: desc.trim() || null,
      priority,
      column,
      tags:
        tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .join(",") || null,
    };

    if (isEditing) {
      onEdit({ ...initialCard, ...payload });
    } else {
      onAdd(payload);
    }
    onClose();
  };

  const modalWidth =
    layout === "stack"
      ? "w-[calc(100vw-2rem)]"
      : layout === "wide"
        ? "w-[520px]"
        : "w-[460px]";

  const inputBase = `
    w-full bg-surface border border-border-subtle rounded-sm
    px-3 py-2.5 text-[13px] text-text-primary
    placeholder:text-text-muted
    focus:outline-none focus:border-teal
    transition-colors duration-150
  `;

  const Label = ({ children }) => (
    <label className="block text-[10.5px] font-bold uppercase tracking-[0.08em] text-text-muted mb-1.5">
      {children}
    </label>
  );

  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-md flex items-center justify-center z-1000 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`
          ${modalWidth} max-w-[calc(100vw-2rem)]
          bg-modal border border-border-medium rounded-lg overflow-hidden
          shadow-[0_32px_80px_rgba(0,0,0,0.6)] animate-slide-up
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle">
          <h2 className="font-extrabold tracking-tight text-text-bright">
            {isEditing ? "Edit Task" : "New Task"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted transition-all duration-150 hover:text-text-primary hover:bg-border-subtle"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <Label>Title</Label>
            <input
              className={`${inputBase} ${shake ? "animate-shake border-coral!" : ""}`}
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>

          <div>
            <Label>
              Description{" "}
              <span className="normal-case tracking-normal font-normal">
                (optional)
              </span>
            </Label>
            <textarea
              className={`${inputBase} resize-none`}
              placeholder="Add more context…"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={layout === "wide" ? 4 : 3}
            />
          </div>

          <div>
            <Label>Column</Label>
            <div className="relative">
              <select
                value={column}
                onChange={(e) => setColumn(e.target.value)}
                className={`${inputBase} appearance-none cursor-pointer pr-8`}
              >
                {COLUMNS.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                    style={{ background: "#1a1a21" }}
                  >
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                strokeWidth={2}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
            </div>
          </div>

          <div>
            <Label>Priority</Label>
            <div className="flex gap-1.5">
              {["low", "medium", "high"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`
                    flex-1 pt-2 pb-2 rounded-sm text-[11px] font-bold uppercase tracking-wide border
                    flex items-center justify-center leading-none
                    transition-all duration-150 min-w-0 overflow-hidden
                    ${priority === p ? PRIORITY_STYLES.active[p] : PRIORITY_STYLES.idle}
                  `}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>
              Tags{" "}
              <span className="normal-case tracking-normal font-normal">
                (comma-separated)
              </span>
            </Label>
            <input
              className={inputBase}
              placeholder="design, backend, ux"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 justify-end px-6 py-4 border-t border-border-subtle">
          <button
            onClick={onClose}
            className="px-4.5 py-2 rounded-sm text-[13px] font-semibold text-text-secondary bg-surface border border-border-subtle transition-all duration-150 hover:text-text-primary hover:border-border-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-6 py-2 rounded-sm text-[13px] font-bold text-[#0a0a0c] bg-teal transition-all duration-150 hover:brightness-110 hover:-translate-y-px active:translate-y-0"
          >
            {isEditing ? (
              <>
                <Pencil size={14} strokeWidth={2.5} /> Save Changes
              </>
            ) : (
              <>
                <Plus size={14} strokeWidth={2.5} /> Add Task
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
