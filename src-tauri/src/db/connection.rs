use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite, migrate::MigrateDatabase};

pub struct Database {
    pool: Pool<Sqlite>,
}

impl Database {
    pub async fn new() -> Result<Self, sqlx::Error> {
        let app_dir = dirs::data_dir()
            .ok_or_else(|| std::io::Error::new(
                std::io::ErrorKind::NotFound, 
                "Data directory not found"
            ))?
            .join("minikan-board");
        
        std::fs::create_dir_all(&app_dir)?;
        
        let db_path = app_dir.join("minikan.db");
        let db_url = format!("sqlite:{}", db_path.display());
        
        println!("Database path: {}", db_path.display());
        
        if !Sqlite::database_exists(&db_url).await.unwrap_or(false) {
            Sqlite::create_database(&db_url).await?;
        }
        
        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(&db_url)
            .await?;
        
        Ok(Self { pool })
    }
    
    pub async fn run_migrations(&self) -> Result<(), sqlx::Error> {
        // Convert MigrateError to sqlx::Error
        sqlx::migrate!("./migrations")
            .run(&self.pool)
            .await
            .map_err(|e| sqlx::Error::Migrate(Box::new(e)))?;
        Ok(())
    }
    
    pub fn get_pool(&self) -> &Pool<Sqlite> {
        &self.pool
    }
}