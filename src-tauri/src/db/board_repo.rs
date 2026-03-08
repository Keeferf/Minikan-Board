use crate::models::board::{Board, NewBoard};
use sqlx::{Pool, Sqlite};
use chrono::Utc;

pub struct BoardRepo<'a> {
    pool: &'a Pool<Sqlite>,
}

impl<'a> BoardRepo<'a> {
    pub fn new(pool: &'a Pool<Sqlite>) -> Self {
        Self { pool }
    }

    pub async fn get_all(&self) -> Result<Vec<Board>, sqlx::Error> {
        sqlx::query_as::<_, Board>(
            "SELECT id, name, created_at FROM boards ORDER BY created_at ASC"
        )
        .fetch_all(self.pool)
        .await
    }

    pub async fn create(&self, board: NewBoard) -> Result<Board, sqlx::Error> {
        let created_at = Utc::now();
        sqlx::query(
            "INSERT INTO boards (id, name, created_at) VALUES (?1, ?2, ?3)"
        )
        .bind(&board.id)
        .bind(&board.name)
        .bind(created_at)
        .execute(self.pool)
        .await?;

        sqlx::query_as::<_, Board>(
            "SELECT id, name, created_at FROM boards WHERE id = ?1"
        )
        .bind(&board.id)
        .fetch_one(self.pool)
        .await
    }

    pub async fn rename(&self, id: &str, name: &str) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE boards SET name = ?1 WHERE id = ?2")
            .bind(name)
            .bind(id)
            .execute(self.pool)
            .await?;
        Ok(())
    }

    pub async fn delete(&self, id: &str) -> Result<(), sqlx::Error> {
    // Manually cascade since ALTER TABLE can't set up FK cascade
    sqlx::query("DELETE FROM cards WHERE board_id = ?1")
        .bind(id)
        .execute(self.pool)
        .await?;

    sqlx::query("DELETE FROM boards WHERE id = ?1")
        .bind(id)
        .execute(self.pool)
        .await?;
    Ok(())
}

    pub async fn count(&self) -> Result<i64, sqlx::Error> {
        sqlx::query_scalar("SELECT COUNT(*) FROM boards")
            .fetch_one(self.pool)
            .await
    }
}