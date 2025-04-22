from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date

db = SQLAlchemy()

class Dish(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(100), nullable=False) # eg: world of flavor
    rating = db.Column(db.Float)  # Average rating
    daily_rating = db.Column(db.Float)  # Average rating for today only
    time = db.Column(db.String(50), nullable=False)  # breakfast, lunch, dinner
    properties = db.Column(db.String(255))  # comma-separated: vegan, gluten free, etc.
    itemtoday = db.Column(db.Boolean, default=False)  # Whether it's on today's menu

    reviews = db.relationship("Review", backref="dish", cascade="all, delete-orphan", lazy=True)

    def __repr__(self):
        return f"<Dish {self.name} at {self.location} during {self.time} with {self.properties}>"

    def serialize(self):
        today = date.today()

        today_reviews = [
            r for r in self.reviews
            if isinstance(r.date, date) and r.date == date.today()
            or isinstance(r.date, str) and datetime.strptime(r.date, "%Y-%m-%d").date() == date.today()
        ]

        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "location": self.location,
            "rating": self.rating,
            "time": self.time,
            "properties": self.properties,
            "itemtoday": self.itemtoday,
            "reviews": [review.serialize() for review in self.reviews],
            "daily_rating": self.daily_rating,
            "today_review_count": len(today_reviews)
        }
    
class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    dish_id = db.Column(db.Integer, db.ForeignKey('dish.id'), nullable=False)
    rating = db.Column(db.Float, nullable=False)
    content = db.Column(db.Text)
    date = db.Column(db.Date, default=date.today)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f"Review({self.dish_id}, {self.rating})"

    def serialize(self):
        return {
            "id": self.id,
            "dish_id": self.dish_id,
            "rating": self.rating,
            "content": self.content,
            "date": self.date.isoformat(),
            "author": self.author.username if self.author else None
        }

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now, nullable=False)

    reviews = db.relationship("Review", backref="author", lazy=True)

    def __repr__(self) -> str:
        return f"ID: {self.id}, Username: {self.username}"

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "created_at": self.created_at.isoformat()
        }

