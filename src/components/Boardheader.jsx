export default function BoardHeader({ totalCards, onNewTask }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="flex items-center justify-between px-7 py-5 border-b border-border-subtle bg-base shrink-0">
      {/* Left — logo + title */}
      <div className="flex items-center gap-3.5">
        {/* Three-bar logomark using brand colors */}
        <div className="flex flex-col gap-0.75">
          <span className="block h-1.5 w-5.5 rounded-full bg-gold" />
          <span className="block h-1.5 w-4   rounded-full bg-teal" />
          <span className="block h-1.5 w-2.5 rounded-full bg-coral" />
        </div>

        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-text-primary leading-none">
            Kanban
          </h1>
          <p className="font-mono text-[11px] text-text-muted mt-0.5 tracking-wider">
            {dateStr}
          </p>
        </div>
      </div>

      {/* Right — task count + CTA */}
      <div className="flex items-center gap-4">
        <span className="font-mono text-xs text-text-muted">
          <strong className="text-text-secondary font-medium">
            {totalCards}
          </strong>{" "}
          tasks
        </span>

        <button
          onClick={onNewTask}
          className="
            flex items-center gap-1.5 px-4 py-2 rounded-sm
            bg-teal text-[#0a0a0c] text-[13px] font-bold
            transition-all duration-150
            hover:brightness-110 hover:-translate-y-px
            active:translate-y-0 active:brightness-95
          "
        >
          <span className="text-lg font-light leading-none -mt-px">+</span>
          New Task
        </button>
      </div>
    </header>
  );
}
