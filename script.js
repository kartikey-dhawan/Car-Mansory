
let allCars = [];
let favoriteIds = []; 
let showingFavoritesOnly = false; 


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

document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  loadFavorites();
  fetchCars();
  setupEventListeners();
});


function initTheme() {

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

    htmlElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    moon.classList.remove('hidden');
    sun.classList.add('hidden');
  } else {

    htmlElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    moon.classList.add('hidden');
    sun.classList.remove('hidden');
  }
});


function loadFavorites() {
  const savedFavorites = localStorage.getItem('car-favorites');
  if (savedFavorites) {

    favoriteIds = JSON.parse(savedFavorites);
  }
  updateFavCount();
}

function updateFavCount() {
  countFavEl.textContent = favoriteIds.length;
}


function toggleFavorite(id) {

  const idNumber = Number(id);


  if (favoriteIds.includes(idNumber)) {

    favoriteIds = favoriteIds.filter(function(savedId) {
      return savedId !== idNumber;
    });
  } else {

    favoriteIds.push(idNumber);
  }


  localStorage.setItem('car-favorites', JSON.stringify(favoriteIds));
  updateFavCount();
  

  if (showingFavoritesOnly === true) {
     applyFiltersAndSort();
  } else {

     const buttonElement = document.querySelector('.fav-btn[data-id="' + id + '"]');
     if (buttonElement !== null) {
       buttonElement.classList.toggle('active');
     }
  }
}


viewFavoritesBtn.addEventListener('click', function() {

  showingFavoritesOnly = !showingFavoritesOnly;
  
  if (showingFavoritesOnly === true) {
    viewFavoritesBtn.style.background = '#3b82f6';
    viewFavoritesBtn.style.color = 'white';
    viewFavoritesBtn.innerHTML = 'All Cars (<span id="fav-count">' + favoriteIds.length + '</span>)';
  } else {
    viewFavoritesBtn.style.background = 'transparent';
    viewFavoritesBtn.style.color = '';
    viewFavoritesBtn.innerHTML = 'Favorites (<span id="fav-count">' + favoriteIds.length + '</span>)';
  }
  

  applyFiltersAndSort();
});


function fetchCars() {

  showLoading(true);


  fetch('https://carapi.app/api/models')
    .then(function(response) {
      if (response.ok === false) {
        throw new Error('API is currently protected or unavailable.');
      }
      return response.json(); 
    })
    .then(function(data) {

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


      showLoading(false);
      populateDropdowns();
      applyFiltersAndSort();
    })
    .catch(function(error) {
      console.log('Error fetching the API, loading backup mock data.', error);
      allCars = generateMockData();
      showLoading(false);
      populateDropdowns();
      applyFiltersAndSort();
    });
}

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



function populateDropdowns() {

  const allBrands = allCars.map(function(car) {
    return car.make;
  });
  

  const uniqueBrands = allBrands.filter(function(brand, index) {
    return allBrands.indexOf(brand) === index;
  });
  

  uniqueBrands.sort();

  const brandOptionsHTML = uniqueBrands.map(function(brand) {
    return '<option value="' + brand + '">' + brand + '</option>';
  });

  brandFilter.innerHTML = '<option value="all">All Brands</option>' + brandOptionsHTML.join('');
    

  const allYears = allCars.map(function(car) {
    return car.year;
  });
  const uniqueYears = allYears.filter(function(year, index) {
    return allYears.indexOf(year) === index;
  });
  uniqueYears.sort(function(a, b) {
    return b - a;
  });

  const yearOptionsHTML = uniqueYears.map(function(year) {
    return '<option value="' + year + '">' + year + '</option>';
  });
  yearFilter.innerHTML = '<option value="all">All Years</option>' + yearOptionsHTML.join('');
}

function applyFiltersAndSort() {

  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedBrand = brandFilter.value;
  const selectedYear = yearFilter.value;
  const selectedSort = sortSelect.value;

  let filteredCars = allCars.filter(function(car) {

    const makeLower = car.make.toLowerCase();
    const nameLower = car.name.toLowerCase();
    const matchesSearch = (makeLower.includes(searchTerm) || nameLower.includes(searchTerm));
    

    const matchesBrand = (selectedBrand === 'all') || (car.make === selectedBrand);

    const matchesYear = (selectedYear === 'all') || (String(car.year) === selectedYear);
    

    const matchesFav = (showingFavoritesOnly === false) || favoriteIds.includes(car.id);

    return matchesSearch && matchesBrand && matchesYear && matchesFav;
  });

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

  renderCars(filteredCars);
}

function renderCars(carsToRender) {
  if (carsToRender.length === 0) {
    grid.innerHTML = '';
    noResultsEl.classList.remove('hidden');
    return;
  }
  
  noResultsEl.classList.add('hidden');
  
  const htmlArray = carsToRender.map(function(car) {
    const isFav = favoriteIds.includes(car.id);
    let activeClass = '';
    if (isFav) {
      activeClass = 'active';
    }

    const imageStringUrl = "https://loremflickr.com/400/300/" + encodeURIComponent(car.make) + ",car/all?lock=" + car.id;

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

  grid.innerHTML = htmlArray.join('');

  const allFavButtons = document.querySelectorAll('.fav-btn');
  allFavButtons.forEach(function(btn) {
    btn.addEventListener('click', function(event) {
      const clickedElement = event.target.closest('.fav-btn');
      const carId = clickedElement.getAttribute('data-id');
      toggleFavorite(carId);
    });
  });
}
function debounce(originalFunction, delayTime) {
  let activeTimer = null; 
  
  return function() {
    if (activeTimer !== null) {
      clearTimeout(activeTimer);
    }
    activeTimer = setTimeout(function() {
      originalFunction(); 
    }, delayTime);
  };
}

function setupEventListeners() {
  const optimizedSearch = debounce(applyFiltersAndSort, 300);
  

  searchInput.addEventListener('input', optimizedSearch);
  
  brandFilter.addEventListener('change', applyFiltersAndSort);
  yearFilter.addEventListener('change', applyFiltersAndSort);
  sortSelect.addEventListener('change', applyFiltersAndSort);
}

function showLoading(isLoading) {
  if (isLoading === true) {
    loadingEl.classList.remove('hidden');
    grid.innerHTML = '';
  } else {
    loadingEl.classList.add('hidden');
  }
}
