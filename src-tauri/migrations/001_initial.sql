-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    "column" TEXT DEFAULT 'todo' CHECK ("column" IN ('todo', 'progress', 'review', 'done')),
    tags TEXT DEFAULT '',
    created_at TEXT DEFAULT ''
);

-- Index for faster column filtering
CREATE INDEX IF NOT EXISTS idx_cards_column ON cards("column");