/**
 * layout-aware header:
 *  "stack"  — tight, logo only + task count hidden, CTA stays
 *  "grid"   — moderate, date hidden on narrow
 *  "horizontal" / "wide" — full chrome
 */
export default function BoardHeader({
  totalCards,
  onNewTask,
  layout = "horizontal",
  filterTag,
  onFilterTag,
}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const isStack = layout === "stack";
  const isCompact = layout === "stack" || layout === "grid";
  const isWide = layout === "wide";

  return (
    <header
      className={`
        flex items-center justify-between border-b border-border-subtle bg-base shrink-0
        ${isStack ? "px-4 py-3" : isWide ? "px-10 py-6" : "px-7 py-5"}
      `}
    >
      {/* Left — logo + title */}
      <div className="flex items-center gap-3">
        {/* Three-bar logomark */}
        <div className="flex flex-col gap-0.75">
          <span
            className={`block h-1.5 rounded-full bg-gold ${isStack ? "w-4" : "w-5.5"}`}
          />
          <span
            className={`block h-1.5 rounded-full bg-teal ${isStack ? "w-3" : "w-4"}`}
          />
          <span
            className={`block h-1.5 rounded-full bg-coral ${isStack ? "w-2" : "w-2.5"}`}
          />
        </div>

        <div>
          <h1
            className={`font-extrabold tracking-tight text-text-primary leading-none ${
              isStack ? "text-base" : isWide ? "text-2xl" : "text-xl"
            }`}
          >
            Kanban
          </h1>
          {/* Hide date on stack to save space */}
          {!isStack && (
            <p className="font-mono text-[11px] text-text-muted mt-0.5 tracking-wider">
              {dateStr}
            </p>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Tag search */}
        {!isStack && (
          <div className="relative">
            <input
              type="text"
              value={filterTag}
              onChange={(e) => onFilterTag(e.target.value)}
              placeholder="Filter by tag…"
              className={`
                bg-surface border border-border-subtle rounded-sm
                pl-3 pr-7 py-1.5 font-mono text-[11px] text-text-primary
                placeholder:text-text-muted
                focus:outline-none focus:border-teal
                transition-colors duration-150
                ${isWide ? "w-44" : "w-36"}
              `}
            />
            {filterTag ? (
              <button
                onClick={() => onFilterTag("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                ×
              </button>
            ) : (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted text-[11px]">
                #
              </span>
            )}
          </div>
        )}
        {/* Hide task count on stack */}
        {!isStack && (
          <span className="font-mono text-xs text-text-muted">
            <strong className="text-text-secondary font-medium">
              {totalCards}
            </strong>{" "}
            tasks
          </span>
        )}

        <button
          onClick={onNewTask}
          className={`
            flex items-center gap-1.5 rounded-sm
            bg-teal text-[#0a0a0c] font-bold
            transition-all duration-150
            hover:brightness-110 hover:-translate-y-px
            active:translate-y-0 active:brightness-95
            ${isStack ? "px-3 py-1.5 text-[12px]" : isWide ? "px-5 py-2.5 text-[14px]" : "px-4 py-2 text-[13px]"}
          `}
        >
          <span className="text-lg font-light leading-none -mt-px">+</span>
          {isStack ? "Task" : "New Task"}
        </button>
      </div>
    </header>
  );
}
