/**
 * Car Explorer Application
 * This file contains the logic to fetch cars, display them,
 * and filter/sort them using Array Higher-Order Functions (HOFs)
 * like .map(), .filter(), and .sort().
 */

// 1. STATE VARIABLES
// We store our data here so we can access it across different functions.
let allCars = [];
let favoriteIds = []; // Stores the IDs of cars the user likes
let showingFavoritesOnly = false; // A true/false flag (boolean) to toggle views

// 2. GETTING HTML ELEMENTS (DOM Elements)
// We get references to the elements in our HTML file using their ID.
const grid = document.getElementById('car-grid');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error-message');
const noResultsEl = document.getElementById('no-results');
const searchInput = document.getElementById('search-input');
const brandFilter = document.getElementById('brand-filter');
const yearFilter = document.getElementById('year-filter');
const sortSelect = document.getElementById('sort-select');
const themeToggle = document.getElementById('theme-toggle');
const countFavEl = document.getElementById('fav-count');
const viewFavoritesBtn = document.getElementById('view-favorites-btn');

// 3. STARTING THE APP
// When the webpage finishes loading completely, this event runs.
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  loadFavorites();
  fetchCars();
  setupEventListeners();
});

// 4. DARK MODE / LIGHT MODE THEME (Bonus Feature)
function initTheme() {
  // Check our local storage to see if the user saved "dark" theme before
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('moon-icon').classList.add('hidden');
    document.getElementById('sun-icon').classList.remove('hidden');
  }
}

themeToggle.addEventListener('click', function() {
  const htmlElement = document.documentElement;
  const currentTheme = htmlElement.getAttribute('data-theme');
  const moon = document.getElementById('moon-icon');
  const sun = document.getElementById('sun-icon');

  if (currentTheme === 'dark') {
    // Switch to Light Mode
    htmlElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    moon.classList.remove('hidden');
    sun.classList.add('hidden');
  } else {
    // Switch to Dark Mode
    htmlElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    moon.classList.add('hidden');
    sun.classList.remove('hidden');
  }
});

// 5. LOCAL STORAGE FOR FAVORITES (Bonus Feature)
function loadFavorites() {
  const savedFavorites = localStorage.getItem('car-favorites');
  if (savedFavorites) {
    // We convert the string array back into a real JavaScript array
    favoriteIds = JSON.parse(savedFavorites);
  }
  updateFavCount();
}

function updateFavCount() {
  countFavEl.textContent = favoriteIds.length;
}

// 6. TOGGLE FAVORITE LIKES (HOF .includes and .filter used)
function toggleFavorite(id) {
  // First, convert the given id string into a Number type
  const idNumber = Number(id);

  // Check if our array of favorites already includes this car ID
  if (favoriteIds.includes(idNumber)) {
    // If it is already liked, we remove it by using .filter()
    // It keeps all IDs that do NOT equal the clicked idNumber
    favoriteIds = favoriteIds.filter(function(savedId) {
      return savedId !== idNumber;
    });
  } else {
    // If it is not liked yet, we add it to the array
    favoriteIds.push(idNumber);
  }

  // Save the updated list back to the browser's local storage
  localStorage.setItem('car-favorites', JSON.stringify(favoriteIds));
  updateFavCount();
  
  // If the user is currently looking at the favorites tab, refresh the list
  if (showingFavoritesOnly === true) {
     applyFiltersAndSort();
  } else {
     // Otherwise, we just visually alter the color of the button they clicked
     const buttonElement = document.querySelector('.fav-btn[data-id="' + id + '"]');
     if (buttonElement !== null) {
       buttonElement.classList.toggle('active');
     }
  }
}

// 7. VIEW FAVORITES ONLY BUTTON
viewFavoritesBtn.addEventListener('click', function() {
  // Toggle the boolean state completely (true becomes false, false becomes true)
  showingFavoritesOnly = !showingFavoritesOnly;
  
  if (showingFavoritesOnly === true) {
    viewFavoritesBtn.style.background = '#3b82f6';
    viewFavoritesBtn.style.color = 'white';
    viewFavoritesBtn.innerHTML = 'All Cars (<span id="fav-count">' + favoriteIds.length + '</span>)';
  } else {
    viewFavoritesBtn.style.background = 'transparent';
    viewFavoritesBtn.style.color = ''; // Returns to CSS default
    viewFavoritesBtn.innerHTML = 'Favorites (<span id="fav-count">' + favoriteIds.length + '</span>)';
  }
  
  // Apply changes to the display
  applyFiltersAndSort();
});

// 8. API INTEGRATION (Fetching Data using Promises)
function fetchCars() {
  // Show the spinning loader while we wait for the internet request
  showLoading(true);

  // Use fetch to get data from the public API (Using .then() for beginners)
  fetch('https://carapi.app/api/models')
    .then(function(response) {
      if (response.ok === false) {
        throw new Error('API is currently protected or unavailable.');
      }
      return response.json(); // Parses the response into an Object
    })
    .then(function(data) {
      // Loop over the API array using the .map() HOF
      allCars = data.data.map(function(car) {
        let brandName = 'Unknown';
        if (car.make && car.make.name) {
          brandName = car.make.name;
        }

        return {
          id: car.id,
          make: brandName,
          name: car.name,
          year: car.year
        };
      });

      // Once we mapped the data, stop loading and show dropdowns and cards
      showLoading(false);
      populateDropdowns();
      applyFiltersAndSort();
    })
    .catch(function(error) {
      // Fallback: This runs if the real API fails or gives an error
      // It ensures the project still works and looks great!
      console.log('Error fetching the API, loading backup mock data.', error);
      allCars = generateMockData();
      showLoading(false);
      populateDropdowns();
      applyFiltersAndSort();
    });
}

// Backup static data if API is inaccessible
function generateMockData() {
  return [
    { id: 1, make: 'Tesla', name: 'Model S Plaid', year: 2024 },
    { id: 2, make: 'Porsche', name: '911 Carrera', year: 2023 },
    { id: 3, make: 'BMW', name: 'M4 Competition', year: 2022 },
    { id: 4, make: 'Audi', name: 'RS e-tron GT', year: 2024 },
    { id: 5, make: 'Mercedes-Benz', name: 'AMG GT', year: 2023 },
    { id: 6, make: 'Lamborghini', name: 'Huracan Evo', year: 2021 },
    { id: 7, make: 'Ferrari', name: 'F8 Tributo', year: 2022 },
    { id: 8, make: 'Maserati', name: 'MC20', year: 2023 },
    { id: 9, make: 'Aston Martin', name: 'Vantage', year: 2024 },
    { id: 10, make: 'McLaren', name: 'Artura', year: 2023 },
    { id: 11, make: 'Toyota', name: 'Supra', year: 2021 },
    { id: 12, make: 'Ford', name: 'Mustang Mach-E', year: 2022 }
  ];
}


// 9. SETUP SEARCH FILTERS AND SORTING (Using required Array HOFs)

function populateDropdowns() {
  // Extract just the brands from all cars using .map()
  const allBrands = allCars.map(function(car) {
    return car.make;
  });
  
  // Use .filter() to remove duplicate brands by checking if it's the first occurrence
  const uniqueBrands = allBrands.filter(function(brand, index) {
    return allBrands.indexOf(brand) === index;
  });
  
  // Use .sort() to sort them alphabetically A-Z
  uniqueBrands.sort();

  // Create the <option> HTML tags using .map()
  const brandOptionsHTML = uniqueBrands.map(function(brand) {
    return '<option value="' + brand + '">' + brand + '</option>';
  });
  // Join the arrays into a single string to append inside HTML element
  brandFilter.innerHTML = '<option value="all">All Brands</option>' + brandOptionsHTML.join('');
    
  // Do exactly the same thing to extract the unique years
  const allYears = allCars.map(function(car) {
    return car.year;
  });
  const uniqueYears = allYears.filter(function(year, index) {
    return allYears.indexOf(year) === index;
  });
  // Sort years (newest first, logic b - a ensures descending number order)
  uniqueYears.sort(function(a, b) {
    return b - a;
  });

  const yearOptionsHTML = uniqueYears.map(function(year) {
    return '<option value="' + year + '">' + year + '</option>';
  });
  yearFilter.innerHTML = '<option value="all">All Years</option>' + yearOptionsHTML.join('');
}

function applyFiltersAndSort() {
  // Get the values the user has currently inputted
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedBrand = brandFilter.value;
  const selectedYear = yearFilter.value;
  const selectedSort = sortSelect.value;

  // A) FILTERING STAGE
  // Use the .filter() Array Function to only keep cars that match ALL rules below
  let filteredCars = allCars.filter(function(car) {
    // 1. Search Logic
    const makeLower = car.make.toLowerCase();
    const nameLower = car.name.toLowerCase();
    const matchesSearch = (makeLower.includes(searchTerm) || nameLower.includes(searchTerm));
    
    // 2. Dropdown Logic
    const matchesBrand = (selectedBrand === 'all') || (car.make === selectedBrand);
    // Remember to convert year to String for a proper comparison!
    const matchesYear = (selectedYear === 'all') || (String(car.year) === selectedYear);
    
    // 3. Favorites Logic
    const matchesFav = (showingFavoritesOnly === false) || favoriteIds.includes(car.id);

    // If all rules are true, keep the car!
    return matchesSearch && matchesBrand && matchesYear && matchesFav;
  });

  // B) SORTING STAGE
  // Use the .sort() Array Function to reorder our filtered list sequentially
  filteredCars = filteredCars.sort(function(carA, carB) {
    if (selectedSort === 'name-asc') {
      if (carA.name < carB.name) return -1;
      if (carA.name > carB.name) return 1;
      return 0;
    }
    else if (selectedSort === 'name-desc') {
      if (carA.name > carB.name) return -1;
      if (carA.name < carB.name) return 1;
      return 0;
    }
    else if (selectedSort === 'year-desc') {
      return carB.year - carA.year;
    }
    else if (selectedSort === 'year-asc') {
      return carA.year - carB.year;
    }
    return 0;
  });

  // C) RENDERING DISPLAY STAGE
  renderCars(filteredCars);
}

function renderCars(carsToRender) {
  // If there's no cars matching the filter, show the "No Results" message
  if (carsToRender.length === 0) {
    grid.innerHTML = '';
    noResultsEl.classList.remove('hidden');
    return;
  }
  
  // Hide the "No results" message normally
  noResultsEl.classList.add('hidden');
  
  // Use .map() to transform our array of Object cars into an array of HTML Strings
  const htmlArray = carsToRender.map(function(car) {
    // Decide if we should render a colored-in heart based on favorites
    const isFav = favoriteIds.includes(car.id);
    let activeClass = '';
    if (isFav) {
      activeClass = 'active';
    }

    // Creating dynamic image string
    // Using simple string concatenation which is easier for beginners to grasp
    const imageStringUrl = "https://loremflickr.com/400/300/" + encodeURIComponent(car.make) + ",car/all?lock=" + car.id;

    // Use a template string (backticks ` `) for easier multi-line HTML code structure!
    return `
      <div class="car-card">
        <div class="card-img-placeholder" style="padding: 0; background: none; max-height: 200px">
           <img src="${imageStringUrl}" alt="${car.make} ${car.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div class="card-content">
          <div class="card-header">
            <span class="car-brand">${car.make}</span>
          </div>
          <h2 class="car-name">${car.name}</h2>
          <div class="car-details">
            <span class="badge">${car.year}</span>
          </div>
          <div class="card-footer">
            <button class="btn btn-outline" style="font-size: 0.8rem; padding: 0.25rem 0.75rem;">View Details</button>
            <button class="fav-btn ${activeClass}" data-id="${car.id}" aria-label="Favorite">
              <!-- Inline SVG Heart Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  // Join the array together into one big HTML string, and apply it to the page inside the grid id
  grid.innerHTML = htmlArray.join('');
  
  // Attach event listener clicks to each newly created favorite button
  const allFavButtons = document.querySelectorAll('.fav-btn');
  // .forEach is an Array-like loop which avoids traditional for() loops perfectly!
  allFavButtons.forEach(function(btn) {
    btn.addEventListener('click', function(event) {
      // Find the ID that we stored precisely on the button we clicked
      const clickedElement = event.target.closest('.fav-btn');
      const carId = clickedElement.getAttribute('data-id');
      toggleFavorite(carId);
    });
  });
}


// 10. SETUP EVENT LISTENERS & DEBOUNCING
// Debouncing (Bonus Feature) restricts how often the search filter runs to boost typing performance.
function debounce(originalFunction, delayTime) {
  let activeTimer = null; // Stores our waiting timer
  
  return function() {
    // If the user types before time is up, we clear the timer and start over!
    if (activeTimer !== null) {
      clearTimeout(activeTimer);
    }
    // Start a fresh countdown timer
    activeTimer = setTimeout(function() {
      originalFunction(); // Call the sorting function once the delay passes!
    }, delayTime);
  };
}

function setupEventListeners() {
  // Make a version of our Search function that waits 300 milliseconds after stopping typing to perform a search
  const optimizedSearch = debounce(applyFiltersAndSort, 300);
  
  // Use our delayed (debounced) function when a user types
  searchInput.addEventListener('input', optimizedSearch);
  
  // For dropdowns, we just run the filtering function immediately on change!
  brandFilter.addEventListener('change', applyFiltersAndSort);
  yearFilter.addEventListener('change', applyFiltersAndSort);
  sortSelect.addEventListener('change', applyFiltersAndSort);
}

// Shows and hides the loading spinner wheel visually on the website
function showLoading(isLoading) {
  if (isLoading === true) {
    loadingEl.classList.remove('hidden');
    grid.innerHTML = '';
  } else {
    loadingEl.classList.add('hidden');
  }
}
