# Quizzing Society IITGN — Codebase Architecture

This document provides a comprehensive overview of the Quizzing Society website architecture to help future developers (and AI agents) quickly understand the file structure, styling system, and logic.

## 1. Core Architecture
The website uses a **static HTML/CSS/JS architecture** without a build tool like Webpack or Vite. 
It leverages modern browser features (CSS variables, ES6 Modules) and uses **Firebase Firestore** via CDN scripts for backend functionality (Join Form submissions, Quiz Creation, Leaderboards, and Telemetry tracking). **Chart.js** is used for real-time data visualization on the Admin Dashboard.

## 2. Directory Structure

```
├── css/
│   ├── variables.css   # Design tokens (colors, fonts, spacing, light/dark mode variables)
│   ├── base.css        # Resets, global typography, utilities (.glass-card, .form-field)
│   ├── components.css  # Reusable UI components (.btn, .navbar, .pill)
│   ├── sections.css    # Page-specific layouts and the global .footer
│   └── admin.css       # Quiz admin panel dashboard, grid layouts, and modals
├── js/
│   ├── main.js         # Entry point (initializes theme, mobile nav)
│   ├── quiz.js         # Active Quiz frontend logic, scoring, timer, and telemetry
│   └── join-form.js    # Join page form validation, confetti animation, and Firebase push
├── index.html          # Homepage
├── events.html         # Events timeline
├── active-quiz.html    # The active Quiz Arena (takes access code to enter a quiz)
├── admin.html          # Full Admin Panel (Quiz Editor, Applications, Analytics)
├── team.html           # Team directory
├── resources.html      # Study materials and archives
└── join.html           # Recruitment form
```

## 3. The Styling System (CSS)

The CSS is designed to be highly modular and relies heavily on CSS custom properties (`var(--name)`).

- **Theming:** Handled via the `data-theme="light|dark"` attribute on the `<html>` tag. Colors swap instantly because `variables.css` redefines the tokens based on this attribute.
- **Glassmorphism:** The premium frosted glass effect is applied via the `.glass-card` class (found in `base.css`).
- **Responsive Design:** Media queries are written directly into the CSS files where components are defined.
- **Typography:** Uses Google Sans and Product Sans globally.

## 4. State & Database (Firebase Firestore)

The project utilizes Firebase Firestore as its primary backend:
1. **Join Form Applications:** Pushed directly to a Firestore collection. Viewed in the `admin.html` Applications screen.
2. **Quiz Admin Panel (`admin.html`):** The primary hub for creating quizzes. Quizzes are saved to the `global/allQuizzes` document as stringified JSON.
3. **Active Quizzes (`active-quiz.html`):** Fetches the quizzes from Firestore, enforces access codes for Private (Tournament) quizzes, handles scoring, and tracks time.
4. **Telemetry & Analytics:** `quiz.js` logs every single quiz attempt to the `quiz_attempts` collection. The Admin Dashboard reads this collection to generate dynamic Chart.js dashboards showing Platform Overview metrics and Quiz-Specific analysis.

## 5. Maintenance Notes

- **Global Components (Navbar/Footer):** Because this is a static site without a templating engine (like Next.js or PHP), the Navbar and Footer HTML blocks are duplicated across all `.html` files. If you need to make changes to them, you must apply the changes to *all* HTML files simultaneously.
- **Admin Panel Navigation:** The Admin Panel uses a custom Single Page App (SPA) structure. Clicking the sidebar elements triggers JavaScript functions (like `showScreen()`) that toggle `.active` classes on sections (e.g., `#screen-dash`, `#screen-applications`, `#screen-editor`, `#screen-quiz-analytics`).
