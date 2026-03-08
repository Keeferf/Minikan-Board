use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct Card {
    pub id: String,
    pub board_id: String,
    pub title: String,
    pub description: String,
    pub priority: String,
    pub column: String,
    pub tags: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct NewCard {
    pub id: String,
    pub board_id: String,
    pub title: String,
    pub description: Option<String>,
    pub priority: String,
    pub column: String,
    pub tags: Option<String>,
}