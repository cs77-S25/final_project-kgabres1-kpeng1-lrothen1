
// We now don't need the carousel... 
//document.addEventListener('DOMContentLoaded', () => {
    // const track = document.getElementById('carouselTrack');
    // const cards = track.querySelectorAll('.restaurant-card');
    // const cardWidth = track.querySelector('.restaurant-card').offsetWidth;
    // const categoryDisplay = document.getElementById('foodCategory');

    // let index = 0;

    // const updateCategory = () => {
    //     const category = cards[index].dataset.category || '';
    //     categoryDisplay.textContent = category;
    //   };
  
    // document.getElementById('prevBtn').addEventListener('click', () => {
    //     if (index > 0) index--;
    //     track.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
    //     updateCategory();
    // });
  
    // document.getElementById('nextBtn').addEventListener('click', () => {
    //     if (index < cards.length - 1) index++;
    //     track.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
    //     updateCategory();
    // });
    
    // updateCategory();
  //});

// this code maps the address of icons
// const iconSrcMap = {
//   alcohol: "/static/images/menu_icon_Alcohol.svg",
//   egg: "/static/images/menu_icon_Egg.svg",
//   fish: "/static/images/menu_icon_Fish.svg",
//   gluten_free: "/static/images/menu_icon_Gluten Free.svg",
//   halah: "/static/images/menu_icon_Halal.svg",
//   kosher: "/static/images/menu_icon_Kosher.svg",
//   locally_sourced: "/static/images/menu_icon_Locally Sourced.svg",
//   milk: "/static/images/menu_icon_Milk.svg",
//   organic: "/static/images/menu_icon_Organic.svg",
//   peanut: "/static/images/menu_icon_Peanut.svg",
//   pork: "/static/images/menu_icon_Pork.svg",
//   seasame: "/static/images/menu_icon_Seasame.svg",
//   shellfish: "/static/images/menu_icon_Shellfish.svg",
//   soy: "/static/images/menu_icon_Soy.svg",
//   tree_nut: "/static/images/menu_icon_Tree Nut.svg",
//   vegan: "/static/images/menu_icon_Vegan.svg",
//   vegetarian: "/static/images/menu_icon_Vegetarian.svg",
//   wheat: "/static/images/menu_icon_Wheat.svg",
// }

// this code matches the icons and also sets tooltips
window.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".restaurant-card");

  cards.forEach(card => {
    const iconList = card.dataset.icons?.split(",").map(i => i.trim());
    if (!iconList || iconList.length === 0) return;

    const iconContainer = document.createElement("div");
    iconContainer.classList.add("food-icons");

    iconList.forEach(name => {
      const src = iconSrcMap[name];
      if (!src) {
        console.warn(` No icon found for name: ${name}`);
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.classList.add("icon-wrapper");
      wrapper.setAttribute("data-tooltip", name); // :( lessons learned, only add tooltip to div...

      const img = document.createElement("img");
      img.src = src;
      img.alt = name;
      img.classList.add("food-icon");

      wrapper.appendChild(img);
      iconContainer.appendChild(wrapper);
    });

    const header = card.querySelector(".restaurant-header");
    header.insertBefore(iconContainer, header.children[1]);
  });
});

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