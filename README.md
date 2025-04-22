# final_project

# SwatReview

SwatReview is a web application that allows students at Swarthmore College to explore daily dining hall menus, view station-specific items, and leave reviews for individual dishes.

## Features

- View daily dining menus by station (e.g., Fired Up, Verdant & Vegan, etc.)
- See detailed information about menu items including dietary tags
- Leave reviews and upload photos for specific dishes
- Filter and sort menu items

## Team Members

- Kisanet Gabreselassie (`kgabres1`)
- Kevin Peng (`kpeng1`)
- Leo Rothenberg (`lrothen1`)

## Getting Started

First, clone this repository and get into the folder:
```
git clone git@github.swarthmore.edu:cs77-s25/final_project-kgabres1-kpeng1-lrothen1.git
cd final_project-kgabres1-kpeng1-lrothen1
```

Next, create and activate your virtual environment and install the necessary libraries:
```
python3 -m venv .venv
source .venv/bin/activate
pip install flask flask-cors Flask-SQLAlchemy
```

Finally you can access it by typing this command:
```
flask run --debug --reload --port 7007
```



