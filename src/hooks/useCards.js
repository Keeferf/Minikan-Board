import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { deserializeCard } from "../lib/kanbanConstants";

let nextId = 100;

export function useCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Load on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    invoke("get_cards")
      .then((rows) => {
        const parsed = rows.map(deserializeCard);
        setCards(parsed);

        // Keep the in-memory counter above whatever is persisted
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

  // ── Add ───────────────────────────────────────────────────────────────
  const addCard = useCallback(async (data) => {
    const newCard = { id: `c${nextId++}`, ...data };
    setCards((prev) => [...prev, newCard]); // optimistic

    try {
      await invoke("add_card", {
        card: {
          id: newCard.id,
          title: newCard.title,
          description: newCard.description ?? "",
          priority: newCard.priority,
          column: newCard.column,
          tags: (newCard.tags ?? []).join(","),
        },
      });
    } catch (err) {
      console.error("add_card failed:", err);
      setCards((prev) => prev.filter((c) => c.id !== newCard.id)); // roll back
    }
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────
  const deleteCard = useCallback(async (cardId) => {
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

  // ── Move (called by drag-and-drop) ────────────────────────────────────
  const moveCard = useCallback(async (cardId, targetColumn) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, column: targetColumn } : c)),
    ); // optimistic

    try {
      await invoke("move_card", { id: cardId, column: targetColumn });
    } catch (err) {
      console.error("move_card failed:", err);
      invoke("get_cards")
        .then((rows) => setCards(rows.map(deserializeCard)))
        .catch(console.error);
    }
  }, []);

  return { cards, loading, addCard, deleteCard, moveCard };
}
