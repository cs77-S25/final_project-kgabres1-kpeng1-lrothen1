# app/utils.py
import sqlite3
from models import db, Dish
from datetime import date  

def sync_from_scraped_db(scraped_db_path='dining.db'):
    # Step 1: change all the itemtoday to false.
    Dish.query.update({Dish.itemtoday: False})
    db.session.commit()

    # Step 2: connect to cheat database
    conn = sqlite3.connect(scraped_db_path)
    cursor = conn.cursor()

    # Step 3: read the cheat database
    # cursor.execute("SELECT meal_name, dining_center_name, item, properties FROM meals")
    # rows = cursor.fetchall()

    try:
        cursor.execute("SELECT meal_name, dining_center_name, item, properties FROM meals")
        rows = cursor.fetchall()
    except sqlite3.Error as e:
        print("oops, error accessing the database:", e)
        conn.close()
        return

    for meal_name, dining_center_name, item, properties in rows:
        name = item.strip()
        location = meal_name.strip()
        time = dining_center_name.strip()
        properties = properties.strip() if properties else ""

        # use name to identify each dish
        dish = Dish.query.filter_by(name=name).first()

        if dish:
            dish.itemtoday = True
            dish.time = time
            dish.location = location
        else:
            new_dish = Dish(
                name=name,
                location=location,
                time=time,
                description="",  
                properties=properties,
                itemtoday=True,
                rating=None
            )
            db.session.add(new_dish)

    db.session.commit()
    conn.close()
    print("dish is updated from cheating database!")


def update_dish_rating(dish_id):
    dish = Dish.query.get(dish_id)
    if not dish:
        print(f"Dish with id {dish_id} not found.")
        return

    reviews = dish.reviews
    today = date.today()
    today_reviews = [r for r in reviews if r.date == today]

    if reviews:
        dish.rating = round(sum(r.rating for r in reviews) / len(reviews), 2)
    else:
        dish.rating = None

    if today_reviews:
        dish.daily_rating = round(sum(r.rating for r in today_reviews) / len(today_reviews), 2)
    else:
        dish.daily_rating = None

    db.session.commit()
    print(f" Updated {dish.name}: rating={dish.rating}, daily_rating={dish.daily_rating}")


