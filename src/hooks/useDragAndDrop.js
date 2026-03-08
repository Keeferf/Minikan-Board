import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Pointer-event based drag-and-drop for the Kanban board.
 *
 * Returns:
 *   dragging      — { cardId, x, y } or null
 *   dragOverCol   — column id the cursor is currently over, or null
 *   startDrag     — (e, cardId) call from a card's onPointerDown
 *   registerCol   — (colId) => (el) ref callback for each column section
 */
export function useDragAndDrop(onDrop) {
  const [dragging, setDragging] = useState(null); // { cardId, x, y }
  const [dragOverCol, setDragOverCol] = useState(null);
  const dragOverColRef = useRef(null); // ← ref keeps pointerup stable
  const colRefs = useRef({});

  // ── Global move / up listeners (only active during a drag) ────────────
  useEffect(() => {
    if (!dragging) return;

    const onPointerMove = (e) => {
      setDragging((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));

      // Hide the ghost momentarily so elementFromPoint sees through it
      const ghost = document.getElementById("drag-ghost");
      if (ghost) ghost.style.display = "none";
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (ghost) ghost.style.display = "";

      let found = null;
      for (const [id, ref] of Object.entries(colRefs.current)) {
        if (ref && ref.contains(el)) {
          found = id;
          break;
        }
      }
      dragOverColRef.current = found; // ← write ref first, then state
      setDragOverCol(found);
    };

    const onPointerUp = () => {
      // Read from ref — never stale, even if state update was batched
      if (dragging && dragOverColRef.current) {
        onDrop(dragging.cardId, dragOverColRef.current);
      }
      dragOverColRef.current = null;
      setDragging(null);
      setDragOverCol(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragging, onDrop]); // ← dragOverCol removed from deps

  // ── Called by a card's onPointerDown ──────────────────────────────────
  const startDrag = useCallback((e, cardId) => {
    e.preventDefault();
    setDragging({ cardId, x: e.clientX, y: e.clientY });
  }, []);

  // ── Ref callback factory for column sections ──────────────────────────
  const registerCol = useCallback(
    (colId) => (el) => {
      colRefs.current[colId] = el;
    },
    [],
  );

  return { dragging, dragOverCol, startDrag, registerCol };
}
