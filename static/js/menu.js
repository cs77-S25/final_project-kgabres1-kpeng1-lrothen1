document.addEventListener('DOMContentLoaded', () => {
  const propertySelector = document.getElementById('filter-property');
  const choices = new Choices(propertySelector, {
    removeItemButton: true,
    searchEnabled: false,
    placeholderValue: 'Select dietary tags'
  });
  let mealTime = 'Any';
  const menuContainer = document.getElementById('menu-content');
  const filterSelect = document.getElementById('filter-property');
  const logicSelect = document.getElementById('filter-logic');
  const applyFilterBtn = document.getElementById('apply-filter');
  const clearFilterBtn = document.getElementById('clear-filter');
  const timeCheckboxes = document.querySelectorAll('input[name="time-filter"]');
  const showFilters = document.getElementById('filterbtn');
  const filterBox = document.querySelector('.filter-controls');
  showFilters.addEventListener('click',toggleDisplay);
  const filters = document.querySelectorAll('.link');
    filters.forEach(filter => {
      filter.addEventListener('click', function(event) {
        filters.forEach(f => f.style.backgroundColor = '');
        this.style.backgroundColor = "#778da9";
        mealTime = filter.textContent;
        fetchMenuData();
      });
    });
  let currentDishes = [];

  fetchMenuData();

  applyFilterBtn.addEventListener('click', applyFilters);
  clearFilterBtn.addEventListener('click', clearFilters);

  timeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
  });
  
  document.addEventListener('click', (e) => {
    if (e.target.id === 'retry-button') {
      fetchMenuData();
    }
  });


  function clearFilters() {
    filterSelect.selectedIndex = -1;
    logicSelect.value = 'any';
    /*
    document.querySelectorAll('input[name="time-filter"]').forEach(checkbox => {
      checkbox.checked = false;
  });
  */
    fetchMenuData();
  }

  function showNoResults() {
    menuContainer.innerHTML = `
      <div class="no-results-message">
        No dishes match your filters. Try different criteria.
      </div>
    `;
  }

  function fetchMenuData() {
    menuContainer.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading today's menu...</p>
      </div>
    `;

    fetch(`/api/dishes?meal=${mealTime}`)
      .then(response => {
        if (!response.ok) throw new Error('Network error');
        return response.json();
      })
      .then(dishes => {
        currentDishes = dishes;
        renderMenu(dishes);
        addIconsToCards();
      })
      .catch(error => {
        console.error('Failed to load menu:', error);
        showError();
      });
  }

  function renderMenu(dishes) {
    const stations = {};
    dishes.forEach(dish => {
      if (!stations[dish.location]) stations[dish.location] = [];
      stations[dish.location].push(dish);
    });

    let html = '';
    for (const [stationName, stationDishes] of Object.entries(stations)) {
      html += `
        <section class="station-section">
          <h2 class="station-title">${stationName}</h2>
          <div class="dishes-container">
            ${stationDishes.map(dish => `
              <section class="restaurant-card" data-icons="${dish.properties || ''}">
                <h3>${dish.name}</h3>
                <div class="rating">
                  ${getRatingDisplay(dish.rating, dish.daily_rating, dish.today_review_count)}
                </div>
                <div class="restaurant-actions">
                  <a class="btn" href="/rate/${encodeURIComponent(dish.name)}">Write a Review</a>
                  <a class="btn" href="/reviews/${encodeURIComponent(dish.name)}">Read Reviews</a>
                </div>
              </section>
            `).join('')}
          </div>
        </section>
      `;
    }

    menuContainer.innerHTML = html;
  }

  function getRatingDisplay(rating, daily_rating, todayCount) {
  if (rating === null || rating === undefined || isNaN(Number(rating))) {
    return '<span class="no-rating">No rating yet. Be the first!</span>';
  }

  const numericRating = Number(rating);
  const fullStars = '★'.repeat(Math.round(numericRating));
  const emptyStars = '☆'.repeat(5 - Math.round(numericRating));

  let dailyInfo = '';
  if (
    daily_rating !== null &&
    daily_rating !== undefined &&
    !isNaN(Number(daily_rating))
  ) {
    const dailyNum = Number(daily_rating);
    const dailyFull = '★'.repeat(Math.round(dailyNum));
    const dailyEmpty = '☆'.repeat(5 - Math.round(dailyNum));

    dailyInfo = `
      <div class="daily-rating-stars">
        <span class="rating-label">Today:</span>
        <span class="rating-score">${dailyNum.toFixed(1)}</span>
        <span class="stars">${dailyFull}${dailyEmpty}</span>
        <span class="review-count">(${todayCount} review${todayCount === 1 ? '' : 's'} today)</span>
      </div>
    `;
  } else {
    dailyInfo = `
      <div class="daily-rating-stars no-today">
        <span class="rating-label">Today:</span>
        <span class="no-rating">No reviews today</span>
      </div>
    `;
  }
  return `
    <div class="overall-rating-stars">
      <span class="rating-label">All-Time:</span>
      <span class="rating-score">${numericRating.toFixed(1)}</span>
      <span class="stars">${fullStars}${emptyStars}</span>
    </div>
    ${dailyInfo}
  `;
}
function toggleDisplay() {
  element = filterBox;
  if (element.style.display === 'none') {
    element.style.display = 'block';
    showFilters.textContent = "Hide Filters"
  } else {
    element.style.display = 'none';
    showFilters.textContent = "Show Filters"
  }
}
  function showError() {
    const template = document.getElementById('error-template');
    const errorContent = template.content.cloneNode(true);
    menuContainer.innerHTML = '';
    menuContainer.appendChild(errorContent);
  }

  async function applyFilters() {
    const selectedFilters = Array.from(filterSelect.selectedOptions)
      .map(option => option.value); //do I use .toLowerCase()
    
  
    /*
    if (selectedFilters.lenght > 0) {
      selectedFilters.forEach(filter => params.append('filters[]', filter));
      params.append('logic', logic);
    }
    */ 
    // const selectedTimes = Array.from(document.querySelectorAll('input[name="time-filter"]:checked'))
    //   .map(checkbox => checkbox.value);
    
    
    const logic = logicSelect.value;
    
    try {
      menuContainer.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Applying filters...</p>
        </div>
      `;
  
      const params = new URLSearchParams();

      //debug: 
      console.log("Selected Filters:", selectedFilters);
      console.log("Selected Times:", selectedTimes);
      console.log("Params:", params.toString());

      
      //  property filters 
      if (selectedFilters.length > 0) {
        selectedFilters.forEach(filter => params.append('filters', filter));
        params.append('logic', logic);
      }
      
      // //  time filters
      // if (selectedTimes.length > 0) {
      //   selectedTimes.forEach(time => params.append('times', time));
      // }
  
      const endpoint = selectedTimes.length > 0 ? 
        '/api/filter-by-time' : 
        '/api/filter-items';
      
      const response = await fetch(`${endpoint}?${params.toString()}`);
      
      if (!response.ok) throw new Error('Filter failed');
      
      const filteredDishes = await response.json();
      currentDishes = filteredDishes;
      
      if (filteredDishes.length === 0) {
        showNoResults();
      } else {
        renderMenu(filteredDishes);
        addIconsToCards();
      }
      
    } catch (error) {
      console.error('Filter error:', error);
      showError();
    }
  }




  function addIconsToCards() {
    const cards = document.querySelectorAll(".restaurant-card");
    const iconSrcMap = {
      alcohol: "/static/images/menu_icon_Alcohol.svg",
      egg: "/static/images/menu_icon_Egg.svg",
      fish: "/static/images/menu_icon_Fish.svg",
      glutenfree: "/static/images/menu_icon_Gluten Free.svg",
      halal: "/static/images/menu_icon_Halal.svg",
      kosher: "/static/images/menu_icon_Kosher.svg",
      locally_sourced: "/static/images/menu_icon_Locally Sourced.svg",
      milk: "/static/images/menu_icon_Milk.svg",
      organic: "/static/images/menu_icon_Organic.svg",
      peanut: "/static/images/menu_icon_Peanut.svg",
      pork: "/static/images/menu_icon_Pork.svg",
      seasame: "/static/images/menu_icon_Seasame.svg",
      shellfish: "/static/images/menu_icon_Shellfish.svg",
      soy: "/static/images/menu_icon_Soy.svg",
      tree_nut: "/static/images/menu_icon_Tree Nut.svg",
      vegan: "/static/images/menu_icon_Vegan.svg",
      vegetarian: "/static/images/menu_icon_Vegetarian.svg",
      wheat: "/static/images/menu_icon_Wheat.svg"
    };

    cards.forEach(card => {
      const properties = card.dataset.icons;
      if (!properties) return;

      const propertyList = properties.split(',').map(prop => prop.trim().toLowerCase());
      const iconContainer = card.querySelector('.food-icons') || 
                          document.createElement('div');
      
      iconContainer.className = 'food-icons';
      iconContainer.innerHTML = '';

      propertyList.forEach(property => {
        if (iconSrcMap[property]) {
          const iconWrapper = document.createElement('div');
          iconWrapper.className = 'icon-wrapper';
          iconWrapper.setAttribute('data-tooltip', property.replace(/_/g, ' '));

          const iconImg = document.createElement('img');
          iconImg.src = iconSrcMap[property];
          iconImg.alt = property;
          iconImg.className = 'food-icon';

          iconWrapper.appendChild(iconImg);
          iconContainer.appendChild(iconWrapper);
        }
      });

      if (!card.querySelector('.food-icons')) {
        const dishName = card.querySelector('h3');
        if (dishName) {
          dishName.insertAdjacentElement('afterend', iconContainer);
        }
      }
    });
  }
});