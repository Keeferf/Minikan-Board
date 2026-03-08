use crate::db::CardRepo;
use crate::models::card::{Card, NewCard};
use tauri::State;
use crate::commands::AppState;

fn map_err(e: sqlx::Error) -> String {
    e.to_string()
}

#[tauri::command]
pub async fn get_cards(
    state: State<'_, AppState>,
    board_id: String,
) -> Result<Vec<Card>, String> {
    CardRepo::new(state.db.get_pool())
        .get_all(&board_id)
        .await
        .map_err(map_err)
}

#[tauri::command]
pub async fn add_card(
    state: State<'_, AppState>,
    card: NewCard,
) -> Result<(), String> {
    CardRepo::new(state.db.get_pool())
        .create(card)
        .await
        .map_err(map_err)
}

#[tauri::command]
pub async fn delete_card(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    CardRepo::new(state.db.get_pool())
        .delete(&id)
        .await
        .map_err(map_err)
}

#[tauri::command]
pub async fn move_card(
    state: State<'_, AppState>,
    id: String,
    column: String,
) -> Result<(), String> {
    CardRepo::new(state.db.get_pool())
        .move_card(&id, &column)
        .await
        .map_err(map_err)
}

#[tauri::command]
pub async fn update_card(
    state: State<'_, AppState>,
    id: String,
    title: Option<String>,
    description: Option<String>,
    priority: Option<String>,
    tags: Option<String>,
) -> Result<(), String> {
    CardRepo::new(state.db.get_pool())
        .update(
            &id,
            title.as_deref(),
            description.as_deref(),
            priority.as_deref(),
            tags.as_deref(),
        )
        .await
        .map_err(map_err)
}