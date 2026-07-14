# Quizzing Society - IIT Gandhinagar

The official website for the Quizzing Society of IIT Gandhinagar (QS IITGN). This platform serves as the digital hub for the quizzing community on campus, designed to engage students with trivia, promote upcoming events, and provide resources for aspiring quizzers. 

The website is built with a focus on high performance, modern glassmorphic aesthetics, and gamified interactions to reflect the competitive and fun nature of the society.

## Features

* **Interactive Daily Challenge**: A daily trivia question widget that tests visitors' knowledge directly on the homepage, complete with a countdown timer.
* **On This Day Historical Tracker**: A dynamically generated feed displaying significant historical events that happened on the current date, powered by a local JSON database.
* **Cinematic GSAP Animations**: High-end scroll-triggered animations and a choreographed landing sequence using GreenSock (GSAP).
* **Interactive Mascot (Quizby)**: A context-aware mascot that reacts and provides witty commentary as the user scrolls through different sections of the site.
* **Responsive Dark/Light Mode**: Full theme-switching support mapped to CSS variables for a seamless viewing experience across all lighting conditions.
* **Progressive Web App (PWA) Support**: Basic service worker integration for caching and offline capabilities.
* **Bento Grid Layouts**: Modern, responsive CSS Grid layouts for showcasing events, team members, and statistics.

## Technology Stack

* **Frontend Structure**: HTML5
* **Styling**: Vanilla CSS (CSS Variables, Flexbox, CSS Grid)
* **Interactivity**: Vanilla JavaScript (ES6+)
* **Animation Library**: GSAP (GreenSock Animation Platform) including ScrollTrigger
* **Data Fetching**: Node.js scripts (for pre-compiling Wikipedia history data)

## Project Structure

* `/css/` - Contains modularized stylesheets:
  * `variables.css` - Design tokens and theme definitions.
  * `base.css` - Global resets and typography.
  * `components.css` / `components-extra.css` - Reusable UI elements (buttons, cards, inputs).
  * `sections.css` / `sections-dashboard-faq.css` - Specific page layouts.
  * `animations.css` - Keyframe definitions.
* `/js/` - JavaScript logic:
  * `main.js` - Core application logic, GSAP orchestration, and DOM manipulation.
  * `/data/on-this-day.json` - Pre-compiled historical facts database.
* `/scripts/` - Backend utility scripts:
  * `generate-history.js` / `generate-today.js` - Scripts used to fetch and compile historical data into the local JSON format.
* `index.html` - The primary landing page.
* `events.html`, `team.html`, `quiz.html`, `join.html`, `resources.html` - Inner pages.
* `sw.js` - Service Worker for PWA functionality.

## Setup and Installation

The project is built primarily with static files, making it extremely easy to run locally or host on any static web server (such as Vercel, Netlify, or GitHub Pages).

### Running Locally

1. Clone the repository to your local machine.
2. Navigate to the root directory of the project.
3. Serve the directory using any local development server. For example, using Node.js:
   ```bash
   npx serve .
   ```
4. Open the provided localhost URL in your browser (typically `http://localhost:3000`).

### Updating the Historical Database

If you need to refresh or regenerate the "On This Day" JSON database:

1. Ensure you have Node.js installed.
2. Run the provided script from the root directory:
   ```bash
   node scripts/generate-today.js
   ```
   (This will fetch the latest events for the current date from the Wikipedia API).

## Contributing

Contributions to the Quizzing Society website are welcome. Whether it is adding new features, optimizing animations, or updating the trivia database, please ensure that all new CSS adheres to the existing variable structure in `variables.css` to maintain theme compatibility.

1. Fork the repository.
2. Create a new branch for your feature.
3. Submit a pull request detailing your changes.

## License

This project is created for the Quizzing Society of IIT Gandhinagar.