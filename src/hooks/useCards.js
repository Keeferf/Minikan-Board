import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { nanoid } from "nanoid";
import { deserializeCard } from "../lib/kanbanConstants";

export function useCards(boardId) {
  // ← accept boardId
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Load whenever the active board changes ────────────────────────────
  useEffect(() => {
    if (!boardId) return; // ← don't fetch until we have a board

    setLoading(true);
    setCards([]);

    invoke("get_cards", { boardId })
      .then((rows) => setCards(rows.map(deserializeCard)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [boardId]); // ← re-fetch when board switches

  // ── Add ───────────────────────────────────────────────────────────────
  const addCard = useCallback(
    async (data) => {
      // Tags arrive as a string (e.g. "design,ux") or null from the modal.
      // The UI expects an array, so normalise here for the optimistic card.
      const tagsArray = data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      const tagsString = tagsArray.join(",");

      const newCard = {
        id: nanoid(), // ← consistent with board IDs, no fragile counter
        ...data,
        tags: tagsArray,
        board_id: boardId,
      };

      setCards((prev) => [...prev, newCard]); // optimistic

      try {
        await invoke("add_card", {
          card: {
            id: newCard.id,
            board_id: boardId, // ← was missing, caused the rollback
            title: newCard.title,
            description: newCard.description ?? "",
            priority: newCard.priority,
            column: newCard.column,
            tags: tagsString,
          },
        });
      } catch (err) {
        console.error("add_card failed:", err);
        setCards((prev) => prev.filter((c) => c.id !== newCard.id)); // roll back
      }
    },
    [boardId],
  );

  // ── Delete ────────────────────────────────────────────────────────────
  const deleteCard = useCallback(
    async (cardId) => {
      setCards((prev) => prev.filter((c) => c.id !== cardId)); // optimistic

      try {
        await invoke("delete_card", { id: cardId });
      } catch (err) {
        console.error("delete_card failed:", err);
        invoke("get_cards", { boardId })
          .then((rows) => setCards(rows.map(deserializeCard)))
          .catch(console.error);
      }
    },
    [boardId],
  );

  // ── Update ────────────────────────────────────────────────────────────
  const updateCard = useCallback(
    async (updated) => {
      // Normalise tags to array for the UI
      const tagsArray = updated.tags
        ? typeof updated.tags === "string"
          ? updated.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : updated.tags
        : [];

      setCards((prev) =>
        prev.map((c) =>
          c.id === updated.id ? { ...c, ...updated, tags: tagsArray } : c,
        ),
      ); // optimistic

      try {
        await invoke("update_card", {
          id: updated.id,
          title: updated.title ?? null,
          description: updated.description ?? null,
          priority: updated.priority ?? null,
          tags: tagsArray.join(",") || null,
        });

        // If the column changed, move it too
        const original = cards.find((c) => c.id === updated.id);
        if (original && original.column !== updated.column) {
          await invoke("move_card", { id: updated.id, column: updated.column });
        }
      } catch (err) {
        console.error("update_card failed:", err);
        invoke("get_cards", { boardId })
          .then((rows) => setCards(rows.map(deserializeCard)))
          .catch(console.error);
      }
    },
    [boardId, cards],
  );

  // ── Move (called by drag-and-drop) ────────────────────────────────────
  const moveCard = useCallback(
    async (cardId, targetColumn) => {
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, column: targetColumn } : c)),
      ); // optimistic

      try {
        await invoke("move_card", { id: cardId, column: targetColumn });
      } catch (err) {
        console.error("move_card failed:", err);
        invoke("get_cards", { boardId })
          .then((rows) => setCards(rows.map(deserializeCard)))
          .catch(console.error);
      }
    },
    [boardId],
  );

  return { cards, loading, addCard, updateCard, deleteCard, moveCard };
}
