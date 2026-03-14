import os
import psycopg2
from dotenv import load_dotenv

# Load the database URL from the .env file
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def setup_database():
    print("Connecting to cloud database...")
    try:
        # Connect to Postgres
        conn = psycopg2.connect(DATABASE_URL)
        # Enable auto-commit so our tables are saved immediately
        conn.autocommit = True
        cursor = conn.cursor()

        # Read the SQL file from the database folder
        sql_file_path = os.path.join("..", "database", "schema.sql")
        with open(sql_file_path, "r") as file:
            sql_commands = file.read()

        print("Running schema.sql...")
        # Execute the SQL commands
        cursor.execute(sql_commands)
        
        print("✅ Success! All database tables created successfully.")
        
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
    finally:
        if 'conn' in locals():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    setup_database()