use crate::models::card::{Card, NewCard};
use sqlx::{Pool, Sqlite};
use chrono::Utc;

pub struct CardRepo<'a> {
    pool: &'a Pool<Sqlite>,
}

impl<'a> CardRepo<'a> {
    pub fn new(pool: &'a Pool<Sqlite>) -> Self {
        Self { pool }
    }

    pub async fn get_all(&self, board_id: &str) -> Result<Vec<Card>, sqlx::Error> {
        sqlx::query_as::<_, Card>(
            r#"SELECT id, board_id, title, description, priority, "column", tags, created_at
               FROM cards
               WHERE board_id = ?1
               ORDER BY created_at DESC"#
        )
        .bind(board_id)
        .fetch_all(self.pool)
        .await
    }

    pub async fn create(&self, card: NewCard) -> Result<(), sqlx::Error> {
        let created_at = Utc::now();
        sqlx::query(
            r#"INSERT INTO cards (id, board_id, title, description, priority, "column", tags, created_at)
               VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)"#
        )
        .bind(&card.id)
        .bind(&card.board_id)
        .bind(&card.title)
        .bind(card.description.unwrap_or_default())
        .bind(&card.priority)
        .bind(&card.column)
        .bind(card.tags.unwrap_or_default())
        .bind(created_at)
        .execute(self.pool)
        .await?;
        Ok(())
    }

    pub async fn delete(&self, id: &str) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM cards WHERE id = ?1")
            .bind(id)
            .execute(self.pool)
            .await?;
        Ok(())
    }

    pub async fn move_card(&self, id: &str, column: &str) -> Result<(), sqlx::Error> {
        sqlx::query(r#"UPDATE cards SET "column" = ?1 WHERE id = ?2"#)
            .bind(column)
            .bind(id)
            .execute(self.pool)
            .await?;
        Ok(())
    }

    pub async fn update(
        &self,
        id: &str,
        title: Option<&str>,
        description: Option<&str>,
        priority: Option<&str>,
        tags: Option<&str>,
    ) -> Result<(), sqlx::Error> {
        if let Some(t) = title {
            sqlx::query("UPDATE cards SET title = ?1 WHERE id = ?2")
                .bind(t).bind(id).execute(self.pool).await?;
        }
        if let Some(d) = description {
            sqlx::query("UPDATE cards SET description = ?1 WHERE id = ?2")
                .bind(d).bind(id).execute(self.pool).await?;
        }
        if let Some(p) = priority {
            sqlx::query("UPDATE cards SET priority = ?1 WHERE id = ?2")
                .bind(p).bind(id).execute(self.pool).await?;
        }
        if let Some(t) = tags {
            sqlx::query("UPDATE cards SET tags = ?1 WHERE id = ?2")
                .bind(t).bind(id).execute(self.pool).await?;
        }
        Ok(())
    }
}