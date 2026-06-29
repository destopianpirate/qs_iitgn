# Quizzing Society IITGN — Codebase Architecture

This document provides a comprehensive overview of the Quizzing Society website architecture to help future developers (and AI agents) quickly understand the file structure, styling system, and logic.

## 1. Core Architecture
The website uses a **static HTML/CSS/JS architecture** without a build tool like Webpack or Vite. 
It leverages modern browser features (CSS variables, ES6 Modules) and uses **Firebase Realtime Database** via CDN scripts for dynamic functionality (Join Form submissions, Quiz Admin panel).

## 2. Directory Structure

```
├── css/
│   ├── variables.css   # Design tokens (colors, fonts, spacing, light/dark mode variables)
│   ├── base.css        # Resets, global typography, utilities (.glass-card, .form-field)
│   ├── animations.css  # Keyframes and scroll-triggered animation classes
│   ├── components.css  # Reusable UI components (.btn, .navbar, .pill)
│   ├── sections.css    # Page-specific layouts and the global .footer
│   └── admin.css       # Quiz admin panel dashboard, grid layouts, and modals
├── js/
│   ├── main.js         # Entry point (initializes theme, mobile nav, typewriter, back-to-top)
│   ├── scroll.js       # Scroll reveal logic (Intersection Observer)
│   ├── particles.js    # Canvas-based background particle system
│   ├── buzzer.js       # Logic for the interactive buzzer on the homepage
│   ├── cards.js        # 3D tilt effects for cards
│   ├── quiz.js         # Daily quiz frontend logic (deterministic date-based question selection)
│   ├── quiz-admin.js   # Quiz Admin Dashboard logic (Firebase CRUD, local fallback)
│   └── join-form.js    # Join page form validation, confetti animation, and Firebase push
├── index.html          # Homepage
├── events.html         # Events timeline
├── quiz.html           # Daily Quiz and Admin Panel
├── team.html           # Team directory
├── resources.html      # Study materials and archives
└── join.html           # Recruitment form
```

## 3. The Styling System (CSS)

The CSS is designed to be highly modular and relies heavily on CSS custom properties (`var(--name)`).

- **Theming:** Handled via the `data-theme="light|dark"` attribute on the `<html>` tag. Colors swap instantly because `variables.css` redefines the tokens based on this attribute.
- **Glassmorphism:** The premium frosted glass effect is applied via the `.glass-card` class (found in `base.css`).
- **Responsive Design:** Media queries are written directly into the CSS files where components are defined (e.g., footer grid stacking is in `sections.css`, admin dashboard split layout is in `admin.css`).
- **Typography:** Uses Google Sans and Product Sans globally.

## 4. State & Database (Firebase)

The project utilizes Firebase Realtime Database for two main features:
1. **Join Form Applications:** Handled in `js/join-form.js`. Data is pushed to the `/applications` node.
2. **Quiz Admin Panel:** Handled in `js/quiz-admin.js`. Questions are stored in the `/quizQuestions` node.

**Important Note on Firebase Config:**
Currently, the codebase uses dummy placeholder keys (`AIzaSyDemoKeyReplace`). The `quiz-admin.js` script automatically detects this and drops into a **local fallback mode** so that UI changes (adding/sorting questions) work visually in the browser without crashing due to network rejections. To deploy to production, replace the `firebaseConfig` object in the respective JS files with real credentials.

## 5. Maintenance Notes

- **Global Components (Navbar/Footer):** Because this is a static site without a templating engine (like Next.js or PHP), the Navbar and Footer HTML blocks are duplicated across all `.html` files. If you need to make changes to them, you must apply the changes to *all* HTML files simultaneously.
- **Admin Panel Layout:** The quiz admin panel (`quiz.html`) uses a split layout (`.dashboard-layout` -> `.dashboard-left` and `.dashboard-right`). It is hidden by default and triggered by the login modal button.
