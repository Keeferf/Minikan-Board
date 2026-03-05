export const COLUMNS = [
  { id: "todo", label: "To Do", color: "#52525e" },
  { id: "progress", label: "In Progress", color: "#ffba49" },
  { id: "review", label: "Review", color: "#20a39e" },
  { id: "done", label: "Done", color: "#ef5b5b" },
];

export function deserializeCard(card) {
  return {
    ...card,
    tags: card.tags ? card.tags.split(",").filter(Boolean) : [],
  };
}
