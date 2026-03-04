use serde::{Deserialize, Serialize};
use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite, migrate::MigrateDatabase};
use std::sync::Arc;
use tauri::{State, Manager};
use chrono::Utc;

// ── Data Models ─────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct Card {
    pub id: String,
    pub title: String,
    pub description: String,
    pub priority: String,
    pub column: String,
    pub tags: String,
    pub created_at: String,
}

pub struct AppState {
    db: Pool<Sqlite>,
}

// ── Database Initialization ─────────────────────────────────────────────────

async fn init_database() -> Result<Pool<Sqlite>, sqlx::Error> {
    let app_dir = dirs::data_dir()
        .expect("Failed to get data directory")
        .join("kanban-app");
    
    // Create directory if it doesn't exist
    if !app_dir.exists() {
        std::fs::create_dir_all(&app_dir).expect("Failed to create app directory");
    }
    
    let db_path = app_dir.join("kanban.db");
    let db_url = format!("sqlite:{}", db_path.display());
    
    println!("Database path: {}", db_path.display());
    
    // Create database file if it doesn't exist
    if !db_path.exists() {
        Sqlite::create_database(&db_url).await?;
    }
    
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;
    
    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await?;

    // Debug: Check if data exists
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM cards")
        .fetch_one(&pool)
        .await?;
    println!("Database initialized. Total cards: {}", count);
    
    Ok(pool)
}

// ── Tauri Commands ──────────────────────────────────────────────────────────

#[tauri::command]
async fn get_cards(state: State<'_, Arc<AppState>>) -> Result<Vec<Card>, String> {
    let cards = sqlx::query_as::<_, Card>(
        r#"SELECT id, title, description, priority, "column", tags, created_at 
           FROM cards 
           ORDER BY created_at DESC"#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    Ok(cards)
}

#[tauri::command]
async fn add_card(
    state: State<'_, Arc<AppState>>,
    id: String,
    title: String,
    description: String,
    priority: String,
    column: String,
    tags: String,
) -> Result<(), String> {
    let created_at = Utc::now().to_rfc3339();
    
    sqlx::query(
        r#"INSERT INTO cards (id, title, description, priority, "column", tags, created_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)"#
    )
    .bind(&id)
    .bind(&title)
    .bind(&description)
    .bind(&priority)
    .bind(&column)
    .bind(&tags)
    .bind(&created_at)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
async fn delete_card(state: State<'_, Arc<AppState>>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM cards WHERE id = ?1")
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
async fn move_card(
    state: State<'_, Arc<AppState>>, 
    id: String, 
    column: String
) -> Result<(), String> {
    sqlx::query(r#"UPDATE cards SET "column" = ?1 WHERE id = ?2"#)
        .bind(&column)
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
async fn update_card(
    state: State<'_, Arc<AppState>>,
    id: String,
    title: Option<String>,
    description: Option<String>,
    priority: Option<String>,
    tags: Option<String>,
) -> Result<(), String> {
    if let Some(title) = title {
        sqlx::query("UPDATE cards SET title = ?1 WHERE id = ?2")
            .bind(&title)
            .bind(&id)
            .execute(&state.db)
            .await
            .map_err(|e| e.to_string())?;
    }
    
    if let Some(desc) = description {
        sqlx::query("UPDATE cards SET description = ?1 WHERE id = ?2")
            .bind(&desc)
            .bind(&id)
            .execute(&state.db)
            .await
            .map_err(|e| e.to_string())?;
    }
    
    if let Some(priority) = priority {
        sqlx::query("UPDATE cards SET priority = ?1 WHERE id = ?2")
            .bind(&priority)
            .bind(&id)
            .execute(&state.db)
            .await
            .map_err(|e| e.to_string())?;
    }
    
    if let Some(tags) = tags {
        sqlx::query("UPDATE cards SET tags = ?1 WHERE id = ?2")
            .bind(&tags)
            .bind(&id)
            .execute(&state.db)
            .await
            .map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

// ── Main Entry Point ────────────────────────────────────────────────────────

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            tauri::async_runtime::block_on(async move {
                let pool = init_database().await.expect("Failed to initialize database");
                app.manage(Arc::new(AppState { db: pool }));
                Ok(())
            })
        })
        .invoke_handler(tauri::generate_handler![
            get_cards,
            add_card,
            delete_card,
            move_card,
            update_card,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}