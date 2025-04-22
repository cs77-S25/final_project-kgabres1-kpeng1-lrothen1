from models import db, Dish

dish = Dish.query.filter_by(name="Cream Chipped Beef").first()


if dish:
    db.session.delete(dish)
    db.session.commit()
    print(f"Deleted: {dish.name}")
else:
    print("No such dish found.")
