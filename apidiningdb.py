import logging
import requests
import sqlite3
import json

logging.basicConfig(level=logging.DEBUG)

def reset_menu_data():
    # Fetch the data from the URL
    url = "https://dining.sccs.swarthmore.edu/api"
    response = requests.get(url)
    logging.info(f"Request to {url} returned {response.status_code}")

    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()
        logging.debug(json.dumps(data, indent=4))
    else:
        logging.error("Failed to retrieve data")
        return "Failed to retrieve data", 500

    # Connect to SQLite database (or create it if it doesn't exist)
    with sqlite3.connect('dining.db') as conn:
        cursor = conn.cursor()

        # Clear existing data (optional: can be commented out for non-reset behavior)
        cursor.execute("DELETE FROM meals")

        # Create the necessary tables
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS meals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            meal_name TEXT NOT NULL,
            dining_center_name TEXT NOT NULL,
            item TEXT NOT NULL,
            properties TEXT
        );
        ''')

        # Function to insert data into the database
        def insert_dining_data(dining_center_name, meal_name, items):
            for item in items:
                if isinstance(item, dict):  # Ensure item is a dictionary
                    item_name = item.get("item")
                    properties = ", ".join(item.get("properties", []))  # Safely get 'properties'
                    
                    # Insert each item into the meals table
                    try:
                        cursor.execute('''
                        INSERT INTO meals (meal_name, dining_center_name, item, properties)
                        VALUES (?, ?, ?, ?)
                        ''', (meal_name, dining_center_name, item_name, properties))
                    except Exception as e:
                        logging.error(f"Failed to insert item: {item_name} — {e}")
        
        # Loop through the meals data and insert them into the database
        for dining_center, meals in data.get("dining_center", {}).get("meals", {}).items():
            for meal_name, items in meals.items():
                insert_dining_data(dining_center, meal_name, items)

        # Commit the transaction
        conn.commit()

        # Get the row count to confirm the insertions
        cursor.execute("SELECT COUNT(*) FROM meals")
        count = cursor.fetchone()[0]
        logging.info(f"Rows in the database: {count}")
    
    return "Data inserted successfully into the database!", 200
