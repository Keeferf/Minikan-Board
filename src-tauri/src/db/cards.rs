use crate::models::card::{Card, NewCard};
use sqlx::Pool;
use sqlx::Sqlite;
use chrono::Utc;

pub struct CardsRepo<'a> {
    pool: &'a Pool<Sqlite>,
}

impl<'a> CardsRepo<'a> {
    pub fn new(pool: &'a Pool<Sqlite>) -> Self {
        Self { pool }
    }
    
    pub async fn get_all(&self) -> Result<Vec<Card>, sqlx::Error> {
        sqlx::query_as::<_, Card>(
            r#"SELECT id, title, description, priority, "column", tags, created_at 
               FROM cards 
               ORDER BY created_at DESC"#
        )
        .fetch_all(self.pool)
        .await
    }
    
    pub async fn create(&self, card: NewCard) -> Result<(), sqlx::Error> {
        let created_at = Utc::now();
        
        sqlx::query(
            r#"INSERT INTO cards (id, title, description, priority, "column", tags, created_at) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)"#
        )
        .bind(&card.id)
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
    
    // For individual field updates
    pub async fn update_field(
        &self, 
        id: &str, 
        field: &str, 
        value: &str
    ) -> Result<(), sqlx::Error> {
        // Note: In production, validate field names against whitelist
        let query = format!("UPDATE cards SET {} = ?1 WHERE id = ?2", field);
        sqlx::query(&query)
            .bind(value)
            .bind(id)
            .execute(self.pool)
            .await?;
        Ok(())
    }
    
    // Batch update for multiple fields
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
    
    pub async fn count(&self) -> Result<i64, sqlx::Error> {
        sqlx::query_scalar("SELECT COUNT(*) FROM cards")
            .fetch_one(self.pool)
            .await
    }
}