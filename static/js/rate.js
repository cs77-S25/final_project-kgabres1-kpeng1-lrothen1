// Get all the star elements
const stars = document.querySelectorAll('.star');
let rate = 0;

// Add event listeners to each star
stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
        // When hovering over a star, add the 'hovered' class to all stars
        // that come after the hovered star
        let index = Array.from(stars).indexOf(star);
        for (let i = 0; i <= index; i++) {
            stars[i].classList.add('hovered');
        }
    });

    star.addEventListener('mouseleave', () => {
        // When leaving the hover, remove the 'hovered' class from all stars
        stars.forEach(star => {
            star.classList.remove('hovered');
        });
    });

    star.addEventListener('click', () => {
        let index = Array.from(stars).indexOf(star);
        rate=index+1;
        console.log(rate);
        for (let i = 0; i < stars.length; i++) {
            if(i<=index) {
                stars[i].classList.add('still');
            }
            else {
                stars[i].classList.remove('still');
            }
        }
    });
});

//from SwatChan lab mostly
document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission
    let header = document.getElementById("food").textContent
    let food = header.split(" - ")[0]
    let content = document.getElementById("review").value;
    let author = header.split(" - ")[1]
    body = JSON.stringify({"content": content, "author": author, "food": food, "rating": rate});

    fetch('/new_review', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: body
    })
    .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw err });
        }
        return response.json();
      }) // Adjust based on expected response
    .then(data => {
        console.log(data["author_id"]);
        //window.history.back();
        window.location.href = '/reviews/' + food
    })
    .catch(error => {
        alert(error.error);
      });
});