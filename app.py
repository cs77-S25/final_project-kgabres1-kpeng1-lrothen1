from flask import Flask, render_template, request, redirect, url_for, make_response, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db, Dish, Review, User
from werkzeug.security import generate_password_hash, check_password_hash
from utils import update_dish_rating

from flask_migrate import Migrate
from sqlalchemy import desc

from sqlalchemy import or_, and_
from flask import request, jsonify

from datetime import date
last_rating_reset = {"date": None}

app = Flask(__name__)

# Configure database
app.config['CACHE_TYPE'] = 'null' # disable if in production environment
app.config['SECRET_KEY'] = 'secret key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS
CORS(app)

# Initialize db to be used with current Flask app
with app.app_context():
    db.init_app(app)
    migrate = Migrate(app, db)

    # Create the database if it doesn't exist
    # Note: create_all does NOT update tables if they are already in the database. 
    # If you change a model’s columns, use a migration library like Alembic with Flask-Alembic 
    # or Flask-Migrate to generate migrations that update the database schema.
    db.create_all()

def reset_daily_ratings_if_new_day():
    today = date.today()
    if last_rating_reset["date"] != today:
        print("🔄 Resetting daily ratings...")
        dishes = Dish.query.all()
        for dish in dishes:
            dish.daily_rating = None
        db.session.commit()
        last_rating_reset["date"] = today

@app.template_filter('stars')
def render_stars(rating):
    full = '★' * int(round(rating))
    empty = '☆' * (5 - int(round(rating)))
    return f"{full}{empty}"

@app.route('/')
def home():
    dishes = Dish.query.filter_by(itemtoday=1)
    top_today = dishes.order_by(desc(Dish.rating)).limit(3).all()
    vegan_dishes = Dish.query.filter_by(itemtoday=1).filter(Dish.properties.contains("vegan")).order_by(desc(Dish.rating)).limit(3).all()
   # return render_template('home.html', dishes = top_today, vegan=vegan_dishes)
    return render_template('menu.html')

@app.route('/menu/')
def menu():
    return render_template('menu.html')

@app.route('/rankings/')
def rankings():
    dishes = Dish.query.order_by(desc(Dish.rating)).all()
    return render_template('rankings.html', dishes=dishes)


@app.route('/rate/<food_name>')
def rate(food_name):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('rate.html', food=food_name)

@app.route('/reviews/<food_name>')
def reviews(food_name):
    dish = Dish.query.filter_by(name=food_name).first()

    if not dish:
        return render_template("reviews.html", food=food_name, reviews=[], dish=None)

    reviews = Review.query.filter_by(dish_id=dish.id).order_by(desc(Review.date)).all()
    return render_template("reviews.html", food=food_name, reviews=reviews, dish=dish)


@app.route('/new_review', methods=['POST'])
def new_review():
    form = request.get_json()
    content = form["content"]
    food = form["food"]
    dish = Dish.query.filter_by(name=food).first()
    dish_id=dish.id
    user_id = session.get('user_id')
    rating = form["rating"]
    print(rating)
    #if check_author(author, Thread) > 2:
    # return make_response(error(author)) # return the thread object
    if rating and user_id:   
        new_review = Review(rating=rating, content=content, author_id=user_id, dish_id=dish_id)
        db.session.add(new_review)
        db.session.commit()

        update_dish_rating(dish_id)

        print(f"Added new review: {new_review.serialize()}")
    return make_response(jsonify({"success": "true", "review": new_review.serialize()}), 200)


@app.route('/register', methods=['GET', 'POST'])
def register(): 
    error = None
    if request.method == 'POST': 
        username = request.form.get("username")
        password = request.form.get("password")


        if not username or not password: 
            error = "Please enter both username and password."
        else: 
            existing_user = User.query.filter_by(username = username).first()

        if existing_user: 
            error = "Username already taken. Please choose another."

        else:
            hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
            new_user = User(username=username, password=hashed_password)
            db.session.add(new_user)
            db.session.commit()
            return redirect(url_for('login'))  # Redirect to the login page
                
    return render_template('register.html', error=error)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' not in session:
        error = None 
        if request.method == 'POST': 
            username = request.form.get("username")
            password = request.form.get("password")
            
            user = User.query.filter_by(username=username).first()
            
            if user and check_password_hash(user.password, password):
                session['user_id'] = user.id
                session['username'] = user.username
                session.permanent = True
                return redirect(url_for('home'))
            else:
                error = "Invalid username or password." 
        return render_template('login.html', error=error)
    else:
        return render_template('home.html')

@app.route('/logout')
def logout():
    if 'user_id' in session:
        session.pop('user_id', None)  # Remove the user ID from the session
    return redirect(url_for('login'))  # Redirect to the login page

@app.route('/api/dishes')
def get_dishes():
    reset_daily_ratings_if_new_day()
    meal_time = request.args.get('meal')
    if meal_time == "Any":
            dishes = Dish.query.filter_by(itemtoday=True).all()
    else:
            dishes = Dish.query.filter_by(itemtoday=True,time=meal_time).all()
     
    return jsonify([dish.serialize() for dish in dishes])



@app.route('/api/top-dishes')
def get_top_dishes():
    dishes = Dish.query.order_by(desc(Dish.rating)).limit(6).all()
    return jsonify([dish.serialize() for dish in dishes])

@app.route('/api/rankings')
def get_rankings():

    show_today = request.args.get('today', 'false') == 'true'
    meal_time = request.args.get('meal')
    if meal_time == "Any":
        if show_today:
            dishes = Dish.query.filter_by(itemtoday=True).order_by(desc(Dish.daily_rating)).all()
        else:
            dishes = Dish.query.order_by(desc(Dish.rating)).all()
    else:
        if show_today:
            dishes = Dish.query.filter_by(itemtoday=True,time=meal_time).order_by(desc(Dish.daily_rating)).all()
        else:
            dishes = Dish.query.filter_by(time=meal_time).order_by(desc(Dish.rating)).all()
     
    return jsonify([dish.serialize() for dish in dishes])
    
    
    #dishes = Dish.query.order_by(desc(Dish.rating)).all()
    #return jsonify([dish.serialize() for dish in dishes])

# Filtering Route by property! 

@app.route('/api/filter-items', methods=['GET'])
def filter_items(): 
    filters = request.args.getlist('filters') 
    logic = request.args.get('logic', 'any')  
    
    print(f"Filters received: {filters}") 
    print(f"Logic received: {logic}")   

    query = Dish.query.filter_by(itemtoday=True)  

    if filters:
        conditions = []
        for prop in filters:
            conditions.append(Dish.properties.contains(prop))
        
        if logic == 'all':
            query = query.filter(and_(*conditions))
        else:
            query = query.filter(or_(*conditions))
    
    dishes = query.all()
    print(f"Dishes found: {[d.name for d in dishes]}") 
    return jsonify([dish.serialize() for dish in dishes])



#filtering route by breakfast, lunch, and dinner
#enables multiple checks at a time 
@app.route('/api/filter-by-time', methods=['GET'])
def filter_items_by_time():
    filters = request.args.getlist('filters')
    times = request.args.getlist('times')
    logic = request.args.get('logic', 'any')
    
    query = Dish.query.filter_by(itemtoday=True)
    
    if filters:
        conditions = [Dish.properties.ilike(f'%{prop}%') for prop in filters]
        if logic == 'all':
            query = query.filter(and_(*conditions))
        else:
            query = query.filter(or_(*conditions))
    
    if times:
        query = query.filter(Dish.time.in_(times))
    
    dishes = query.all()
    return jsonify([dish.serialize() for dish in dishes])


#profile page
@app.route('/profile')
def profile():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    reviews = Review.query.filter_by(author_id=user.id)\
               .join(Dish)\
               .order_by(Review.date.desc())\
               .all()
               
    avg_rating = db.session.query(db.func.avg(Review.rating))\
                 .filter(Review.author_id == user.id)\
                 .scalar() or 0 
    
    return render_template('profile.html',
                         user=user,
                         reviews=reviews,
                         avg_rating=avg_rating)

    
