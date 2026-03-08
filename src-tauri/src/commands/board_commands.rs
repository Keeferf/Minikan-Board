use crate::db::BoardRepo;
use crate::models::board::{Board, NewBoard};
use tauri::State;
use crate::commands::AppState;

fn map_err(e: sqlx::Error) -> String {
    e.to_string()
}

#[tauri::command]
pub async fn get_boards(state: State<'_, AppState>) -> Result<Vec<Board>, String> {
    BoardRepo::new(state.db.get_pool())
        .get_all()
        .await
        .map_err(map_err)
}

#[tauri::command]
pub async fn add_board(
    state: State<'_, AppState>,
    board: NewBoard,
) -> Result<Board, String> {
    BoardRepo::new(state.db.get_pool())
        .create(board)
        .await
        .map_err(map_err)
}

#[tauri::command]
pub async fn rename_board(
    state: State<'_, AppState>,
    id: String,
    name: String,
) -> Result<(), String> {
    BoardRepo::new(state.db.get_pool())
        .rename(&id, &name)
        .await
        .map_err(map_err)
}

#[tauri::command]
pub async fn delete_board(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    // Single repo instance for both operations
    let repo = BoardRepo::new(state.db.get_pool());

    if repo.count().await.map_err(map_err)? <= 1 {
        return Err("Cannot delete the last board".to_string());
    }

    repo.delete(&id).await.map_err(map_err)
}