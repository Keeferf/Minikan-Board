pub mod card_commands;
pub mod board_commands;

pub use card_commands::*;
pub use board_commands::*;

use crate::db::Database;
use std::sync::Arc;

pub struct AppState {
    pub db: Arc<Database>,
}