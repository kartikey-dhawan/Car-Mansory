# Car Explorer

A simple, clean, and interactive web application to browse, search, filter, and sort car data.

## Features
- **Data Integration:** Attempts to fetch data from CarAPI (via `fetch()`) with a robust fallback to mock data ensuring the application works completely out of the box.
- **Search:** Search cars by name or make/brand.
- **Filter:** Filter cars by year or manufacturer.
- **Sorting:** Sort cars alphabetically by name (A-Z, Z-A) or by year (Newest/Oldest).
- **Favorites:** Click the heart icon to save favorite cars. This state is persisted in localStorage.
- **Dark/Light Mode:** Premium dark/light theme toggling with smooth transitions.
- **Modern UI:** Responsive grid layout, glassmorphism panels, smooth hover state animations.

*Note: All core data manipulations (filtering, sorting, searching, rendering) are implemented using only JS Array Higher-Order functions (`map()`, `filter()`, `sort()`) per requirements.*

## Technologies Used
- HTML5 (Semantic Structure)
- CSS3 (Variables, Flexbox, Grid, Transitions)
- Vanilla JavaScript (ES6+, DOM Manipulation, LocalStorage, Fetch API)

## How to Run
1. Open up your terminal or file explorer.
2. Navigate to the project directory containing `index.html`.
3. You can simply double-click `index.html` to open it in your browser.
4. For the best experience (and to prevent any local CORS issues with fetch API), run a local static server. For example:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```
5. Open your browser to `http://localhost:8000`.

## API Used
- **CarAPI**: https://carapi.dev/
- Integrated using JavaScript's native Fetch API. Since CarAPI requires authentication/keys in most endpoints, the error gracefully falls back to mock premium cars.
