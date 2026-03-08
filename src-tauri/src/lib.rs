pub mod commands;
pub mod db;
pub mod models;

use commands::{
    AppState,
    get_cards, add_card, delete_card, move_card, update_card,
    get_boards, add_board, rename_board, delete_board,
};
use db::Database;
use std::sync::Arc;
use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            tauri::async_runtime::block_on(async move {
                let database = Database::new()
                    .await
                    .expect("Failed to create database");

                database.run_migrations()
                    .await
                    .expect("Failed to run migrations");

                let board_count = db::BoardRepo::new(database.get_pool())
                    .count()
                    .await
                    .unwrap_or(0);
                println!("Database ready. Boards: {}", board_count);

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
            get_boards,
            add_board,
            rename_board,
            delete_board,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}