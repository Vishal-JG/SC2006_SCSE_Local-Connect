import sqlite3

def init_db():
    db_path = 'database.db'  
    conn = sqlite3.connect(db_path)
    with open('schema.sql', 'r') as f:
        schema_sql = f.read()
    try:
        conn.executescript(schema_sql)
        print("Database schema created successfully.")
    except Exception as e:
        print(f"Error creating database schema: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    init_db()
