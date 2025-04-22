# update daily to falso for all dishes
# then get from api
# then look through scraped and update dishes
import sqlite3

conn = sqlite3.connect('your_database.db')
cursor = conn.cursor()

cursor.execute("PRAGMA foreign_keys = OFF;")
cursor.execute("BEGIN TRANSACTION;")

cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
tables = cursor.fetchall()

for table_name in tables:
    cursor.execute(f'DELETE FROM "{table_name[0]}";')

conn.commit()
conn.close()
