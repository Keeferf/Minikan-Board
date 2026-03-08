-- Create boards table
CREATE TABLE IF NOT EXISTS boards (
    id          TEXT PRIMARY KEY NOT NULL,
    name        TEXT NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
);

-- Insert a default board so existing cards have somewhere to live
INSERT INTO boards (id, name, created_at)
VALUES ('default', 'My Board', datetime('now'));

-- Add board_id to cards, defaulting existing cards to the default board
ALTER TABLE cards ADD COLUMN board_id TEXT NOT NULL DEFAULT 'default';