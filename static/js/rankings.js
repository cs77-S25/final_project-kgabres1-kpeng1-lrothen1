document.addEventListener('DOMContentLoaded', () => {
    let mealTime = 'Any';
    const rankingsContainer = document.querySelector('.menu-container');
    let showTodayOnly = false;
    fetchRankings();
    const filters = document.querySelectorAll('.link');
    filters.forEach(filter => {
      filter.addEventListener('click', function(event) {
        filters.forEach(f => f.style.backgroundColor = '');
        this.style.backgroundColor = "#778da9";
        mealTime = filter.textContent;
        fetchRankings();
      });
    });
    function fetchRankings() {
      rankingsContainer.innerHTML = `
        <div class="rankings-header">
          <h1 id="title">${showTodayOnly ? "Today's Top Rated" : "All-Time Rankings"}</h1>
          
          <div class="toggle-container">
            <span class="toggle-label ${!showTodayOnly ? 'active' : ''}">All Time</span>
            <label class="toggle-switch">
              <input type="checkbox" ${showTodayOnly ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
            <span class="toggle-label ${showTodayOnly ? 'active' : ''}">Today's Menu</span>
          </div>
        </div>
        
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Loading rankings...</p>
        </div>
      `;
      
      const newToggleSwitch = rankingsContainer.querySelector('.toggle-switch input');
      newToggleSwitch.addEventListener('change', () => {
        showTodayOnly = newToggleSwitch.checked;
        fetchRankings();
      });
      
      fetch(`/api/rankings?today=${showTodayOnly}&meal=${mealTime}`)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(dishes => {
          renderRankings(dishes);
        })
        .catch(error => {
          console.error('Error fetching rankings:', error);
          showError();
        });
    }
    
    function renderRankings(dishes) {
      const ratedDishes = dishes.filter(dish => dish.rating !== null && dish.rating !== undefined);
  
      // Split them into two categories:
      const dailyRated = ratedDishes.filter(dish => dish.daily_rating !== null && dish.daily_rating !== undefined);
      const onlyAllTimeRated = ratedDishes.filter(dish => dish.daily_rating === null || dish.daily_rating === undefined);
      
      // Sort both arrays
      dailyRated.sort((a, b) => b.daily_rating - a.daily_rating);
      onlyAllTimeRated.sort((a, b) => b.rating - a.rating);
      let html = `
        <div class="rankings-header">
          <h1 id="title">${showTodayOnly ? "Today's Top Rated" : "All-Time Rankings"}</h1>
          
          <div class="toggle-container">
            <span class="toggle-label ${!showTodayOnly ? 'active' : ''}">All Time</span>
            <label class="toggle-switch">
              <input type="checkbox" ${showTodayOnly ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
            <span class="toggle-label ${showTodayOnly ? 'active' : ''}">Today's Menu</span>
          </div>
        </div>
      `;
      
      if (ratedDishes.length === 0) {
        html += `
          <div class="no-results-message">
            <p>${showTodayOnly ? 
              "No rated dishes on today's menu. Try viewing all-time rankings instead." : 
              "No rated dishes found. Be the first to rate a dish!"}</p>
          </div>
        `;
        rankingsContainer.innerHTML = html;
        
        const newToggleSwitch = rankingsContainer.querySelector('.toggle-switch input');
        newToggleSwitch.addEventListener('change', () => {
          showTodayOnly = newToggleSwitch.checked;
          fetchRankings();
        });
        return;
      }
      
      if (showTodayOnly){
        if(dailyRated.length !== 0){
        html += `<p id="special"> Today's Ratings<p>`
      dailyRated.forEach((dish, index) => {
        const displayRating = showTodayOnly && dish.daily_rating !== null ? 
                             dish.daily_rating : dish.rating;
        html += `
          <div class="ranking-card">
            <h1>${index + 1}: ${dish.name}</h1>
            <info>
              <p class="rating-score">${displayRating.toFixed(1)}</p>
              ${generateStars(displayRating)}
              <a class="menu-button" href="/reviews/${encodeURIComponent(dish.name)}">
                <p>Read Reviews</p>
              </a>
            </info>
          </div>
        `;
      });
      }
      html += `<p id="special"> All Time Ratings<p>`
      onlyAllTimeRated.forEach((dish, index) => {
        const displayRating = showTodayOnly && dish.daily_rating !== null ? 
                             dish.daily_rating : dish.rating;
        html += `
          <div class="ranking-card">
            <h1>${index + 1}: ${dish.name}</h1>
            <info>
              <p class="rating-score">${displayRating.toFixed(1)}</p>
              ${generateStars(displayRating)}
              <a class="menu-button" href="/reviews/${encodeURIComponent(dish.name)}">
                <p>Read Reviews</p>
              </a>
            </info>
          </div>
        `;
      });
    }
    else {
      ratedDishes.forEach((dish, index) => {
        const displayRating = showTodayOnly && dish.daily_rating !== null ? 
                             dish.daily_rating : dish.rating;
        html += `
          <div class="ranking-card">
            <h1>${index + 1}: ${dish.name}</h1>
            <info>
              <p class="rating-score">${displayRating.toFixed(1)}</p>
              ${generateStars(displayRating)}
              <a class="menu-button" href="/reviews/${encodeURIComponent(dish.name)}">
                <p>Read Reviews</p>
              </a>
            </info>
          </div>
        `;
      });
    }
      rankingsContainer.innerHTML = html;
      
      const newToggleSwitch = rankingsContainer.querySelector('.toggle-switch input');
      newToggleSwitch.addEventListener('change', () => {
        showTodayOnly = newToggleSwitch.checked;
        fetchRankings();
      });
    }
    
    function generateStars(rating) {
      let starsHtml = '';
      for (let i = 0; i < 5; i++) {
        if (i < Math.round(rating)) {
          starsHtml += '<p class="stillstars active">★</p>';
        } else {
          starsHtml += '<p class="stillstars inactive">★</p>';
        }
      }
      return starsHtml;
    }
    
    function showError() {
      rankingsContainer.innerHTML = `
        <div class="rankings-header">
          <h1 id="title">${showTodayOnly ? "Today's Top Rated" : "All-Time Rankings"}</h1>
          
          <div class="toggle-container">
            <span class="toggle-label ${!showTodayOnly ? 'active' : ''}">All Time</span>
            <label class="toggle-switch">
              <input type="checkbox" ${showTodayOnly ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
            <span class="toggle-label ${showTodayOnly ? 'active' : ''}">Today's Menu</span>
          </div>
        </div>
        
        <div class="error-message">
          <p>Failed to load rankings. Please try again later.</p>
          <button id="retry-button">Retry</button>
        </div>
      `;
      
      document.getElementById('retry-button').addEventListener('click', fetchRankings);
      
      const newToggleSwitch = rankingsContainer.querySelector('.toggle-switch input');
      newToggleSwitch.addEventListener('change', () => {
        showTodayOnly = newToggleSwitch.checked;
        fetchRankings();
      });
    }
  });

  