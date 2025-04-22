# This is testing how to webscrape. 
import logging
logging.basicConfig(level=logging.DEBUG) 

import requests
import sqlite3
import json

# Fetch the data from the URL
url = "https://dining.sccs.swarthmore.edu/api"
response = requests.get(url)
logging.info(f"Request to {url} returned {response.status_code}")


# Check if the request was successful
if response.status_code == 200:
    data = response.json()
    logging.debug(json.dumps(data, indent=4))

else:
    print("Failed to retrieve data.")
    exit()
    logging.error("Failed to retrieve data")


# Connect to SQLite database (or create it if it doesn't exist)
conn = sqlite3.connect('dining.db')
cursor = conn.cursor()

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
            cursor.execute('''
            INSERT INTO meals (meal_name, dining_center_name, item, properties)
            VALUES (?, ?, ?, ?)
            ''', (meal_name, dining_center_name, item_name, properties))

# Loop through the meals data and insert them into the database
for dining_center, meals in data["dining_center"]["meals"].items():
    for meal_name, items in meals.items():
        insert_dining_data(dining_center, meal_name, items)

# Commit the transaction and close the connection
conn.commit()
cursor.execute("SELECT COUNT(*) FROM meals")
count = cursor.fetchone()[0]
print(f"Rows in the database: {count}")  # Debugging line to show how many rows are in the database
conn.close()

print("Data inserted successfully into the database!")