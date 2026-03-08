import { useState, useEffect } from "react";

const COLUMNS = [
  { id: "todo", label: "To Do" },
  { id: "progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

const PRIORITY_STYLES = {
  active: {
    low: "text-text-secondary border-text-secondary/50 bg-text-secondary/10",
    medium: "text-gold  border-gold/50  bg-gold/10",
    high: "text-coral border-coral/50 bg-coral/10",
  },
  idle: "text-text-muted border-border-subtle bg-surface hover:text-text-primary hover:border-border-medium",
};

export default function AddTaskModal({
  defaultColumn,
  onAdd,
  onClose,
  layout = "horizontal",
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("medium");
  const [column, setColumn] = useState(defaultColumn ?? "todo");
  const [tags, setTags] = useState("");
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
    onAdd({
      title: title.trim(),
      description: desc.trim(),
      priority,
      column,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    onClose();
  };

  // Modal width scales with layout
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
          <h2 className="text-base font-extrabold tracking-tight">New Task</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xl text-text-muted transition-all duration-150 hover:text-text-primary hover:bg-border-subtle"
          >
            ×
          </button>
        </div>

        {/* Body — every field is a <div> so gap-4 drives all spacing uniformly */}
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
            <select
              value={column}
              onChange={(e) => setColumn(e.target.value)}
              className={`${inputBase} appearance-none cursor-pointer pr-8`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8a96' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
              }}
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
          </div>

          <div>
            <Label>Priority</Label>
            <div className="flex gap-1.5">
              {["low", "medium", "high"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`
                    flex-1 py-2 rounded-sm text-[11px] font-bold uppercase tracking-wide border
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
            className="px-6 py-2 rounded-sm text-[13px] font-bold text-[#0a0a0c] bg-teal transition-all duration-150 hover:brightness-110 hover:-translate-y-px active:translate-y-0"
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
