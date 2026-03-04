pub mod commands;
pub mod db;
pub mod models;

use commands::{AppState, get_cards, add_card, delete_card, move_card, update_card};
use db::Database;
use std::sync::Arc;
use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            tauri::async_runtime::block_on(async move {
                // Initialize database
                let database = Database::new()
                    .await
                    .expect("Failed to create database");
                
                // Run migrations
                database.run_migrations()
                    .await
                    .expect("Failed to run migrations");
                
                // Debug info
                let count = db::CardsRepo::new(database.get_pool())
                    .count()
                    .await
                    .unwrap_or(0);
                println!("Database ready. Cards: {}", count);
                
                // Manage state
                app.manage(AppState {
                    db: Arc::new(database),
                });
                
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