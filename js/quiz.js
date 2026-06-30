/* ============================================================
   QUIZZING SOCIETY — DAILY QUESTION ENGINE
   50+ trivia questions, date-based rotation, flip interaction
   ============================================================ */

(function () {
  'use strict';

  const QUESTIONS = [
    { q: "Which country has won the most FIFA World Cups?", a: "Brazil", fact: "Brazil has won the tournament five times (1958, 1962, 1970, 1994, 2002), making them the most successful nation in World Cup history.", category: "Sports", difficulty: 3 },
    { q: "What is the smallest bone in the human body?", a: "Stapes", fact: "The stapes (stirrup bone) in the middle ear is only about 3mm long and weighs roughly 3 milligrams.", category: "Science", difficulty: 2 },
    { q: "In which year was the Indian constitution adopted?", a: "1950", fact: "The Constitution was adopted on 26 November 1949 and came into effect on 26 January 1950, which we celebrate as Republic Day.", category: "History", difficulty: 2 },
    { q: "What is the chemical symbol for Tungsten?", a: "W", fact: "Tungsten's symbol W comes from its German name 'Wolfram', derived from the mineral wolframite.", category: "Science", difficulty: 3 },
    { q: "Who wrote 'One Hundred Years of Solitude'?", a: "Gabriel Garcia Marquez", fact: "Published in 1967, the novel has been translated into 46 languages and sold over 50 million copies worldwide.", category: "Literature", difficulty: 2 },
    { q: "What is the capital of Mongolia?", a: "Ulaanbaatar", fact: "Ulaanbaatar houses nearly half of Mongolia's entire population and is the coldest national capital in the world.", category: "Geography", difficulty: 3 },
    { q: "Which element has the highest melting point?", a: "Carbon (as diamond)", fact: "Diamond has a melting point of approximately 3,550 degrees Celsius at standard pressure, the highest of any element.", category: "Science", difficulty: 4 },
    { q: "Who composed the 'Moonlight Sonata'?", a: "Ludwig van Beethoven", fact: "Officially titled Piano Sonata No. 14, Beethoven composed it in 1801 and dedicated it to his student Countess Giulietta Guicciardi.", category: "Arts", difficulty: 1 },
    { q: "What is the largest desert in the world?", a: "Antarctic Desert", fact: "Antarctica is technically a cold desert spanning 14.2 million square km, making it larger than the Sahara.", category: "Geography", difficulty: 3 },
    { q: "In computing, what does 'SQL' stand for?", a: "Structured Query Language", fact: "SQL was originally called SEQUEL (Structured English Query Language) when it was developed at IBM in the 1970s.", category: "Technology", difficulty: 1 },
    { q: "Which Indian city was known as 'Madras' until 1996?", a: "Chennai", fact: "The city was officially renamed from Madras to Chennai in 1996, reflecting its Tamil heritage.", category: "History", difficulty: 1 },
    { q: "What is the only planet that rotates clockwise?", a: "Venus", fact: "Venus rotates in the opposite direction to most planets, a phenomenon called retrograde rotation. A day on Venus is longer than its year.", category: "Science", difficulty: 2 },
    { q: "Who painted 'The Persistence of Memory'?", a: "Salvador Dali", fact: "Completed in 1931, the famous 'melting clocks' painting measures only 24 x 33 cm and hangs in the Museum of Modern Art, New York.", category: "Arts", difficulty: 2 },
    { q: "What is the world's oldest continuously inhabited city?", a: "Damascus", fact: "Damascus, the capital of Syria, has evidence of habitation dating back to 10,000-8,000 BCE.", category: "History", difficulty: 4 },
    { q: "In which sport is the term 'birdie' used?", a: "Golf", fact: "A birdie means completing a hole in one stroke under par. The term originated in 1899 at the Atlantic City Country Club.", category: "Sports", difficulty: 1 },
    { q: "What is the hardest natural substance on Earth?", a: "Diamond", fact: "Diamond scores 10 on the Mohs hardness scale and can only be scratched by another diamond.", category: "Science", difficulty: 1 },
    { q: "Which river is the longest in Asia?", a: "Yangtze River", fact: "The Yangtze stretches 6,300 km through China, making it the longest river in Asia and third longest in the world.", category: "Geography", difficulty: 2 },
    { q: "Who discovered penicillin?", a: "Alexander Fleming", fact: "Fleming discovered penicillin in 1928 by accident when mold contaminated one of his bacterial cultures at St Mary's Hospital, London.", category: "Science", difficulty: 1 },
    { q: "What is the national sport of Japan?", a: "Sumo Wrestling", fact: "Sumo has ancient origins in Shinto rituals. Professional sumo tournaments (honbasho) are held six times a year.", category: "Sports", difficulty: 2 },
    { q: "Who wrote 'The God of Small Things'?", a: "Arundhati Roy", fact: "Published in 1997, the novel won the Man Booker Prize and has been translated into over 40 languages.", category: "Literature", difficulty: 2 },
    { q: "What is the speed of light in km/s?", a: "299,792 km/s", fact: "Light travels fast enough to circle the Earth approximately 7.5 times in one second.", category: "Science", difficulty: 2 },
    { q: "Which country gifted the Statue of Liberty to the USA?", a: "France", fact: "France gifted the statue in 1886 to celebrate the centennial of American independence and their alliance during the Revolution.", category: "History", difficulty: 1 },
    { q: "What is the most spoken language in the world by native speakers?", a: "Mandarin Chinese", fact: "Mandarin has approximately 920 million native speakers, making it the most spoken language by native count.", category: "General", difficulty: 2 },
    { q: "Which planet has the most moons?", a: "Saturn", fact: "As of recent discoveries, Saturn has over 140 confirmed moons, surpassing Jupiter's count.", category: "Science", difficulty: 3 },
    { q: "What year was IIT Gandhinagar established?", a: "2008", fact: "IIT Gandhinagar was established in 2008 as part of the second wave of IITs, initially mentored by IIT Bombay.", category: "IITGN", difficulty: 1 },
    { q: "Who is known as the 'Father of the Indian Space Program'?", a: "Vikram Sarabhai", fact: "Vikram Sarabhai established ISRO and envisioned India's space program. The Ahmedabad-based Physical Research Laboratory was founded by him.", category: "History", difficulty: 2 },
    { q: "What is the SI unit of electrical resistance?", a: "Ohm", fact: "Named after Georg Ohm, who formulated Ohm's Law in 1827 relating voltage, current, and resistance.", category: "Science", difficulty: 1 },
    { q: "Which novel begins with 'Call me Ishmael'?", a: "Moby-Dick", fact: "Herman Melville published Moby-Dick in 1851. It was a commercial failure during his lifetime but is now considered a masterpiece.", category: "Literature", difficulty: 2 },
    { q: "What is the longest running TV quiz show in India?", a: "Kaun Banega Crorepati", fact: "KBC premiered in 2000, hosted by Amitabh Bachchan. It's based on the British format 'Who Wants to Be a Millionaire?'.", category: "Pop Culture", difficulty: 1 },
    { q: "In which city is the headquarters of the International Court of Justice?", a: "The Hague", fact: "The ICJ, established in 1945, is the principal judicial organ of the United Nations and sits in the Peace Palace.", category: "General", difficulty: 3 },
    { q: "What is the Fibonacci sequence's first 8 numbers?", a: "0, 1, 1, 2, 3, 5, 8, 13", fact: "The Fibonacci sequence appears extensively in nature, from spiral shells to the arrangement of petals in flowers.", category: "Mathematics", difficulty: 2 },
    { q: "Which Indian state has the longest coastline?", a: "Gujarat", fact: "Gujarat has a coastline of approximately 1,600 km, which is the longest among all Indian states.", category: "Geography", difficulty: 2 },
    { q: "Who directed the film 'Pather Panchali'?", a: "Satyajit Ray", fact: "Released in 1955, Pather Panchali was Ray's directorial debut and the first film in the iconic Apu Trilogy.", category: "Arts", difficulty: 2 },
    { q: "What is the largest organ in the human body?", a: "Skin", fact: "The skin of an average adult covers about 2 square meters and accounts for roughly 16% of total body weight.", category: "Science", difficulty: 1 },
    { q: "In chess, which piece can only move diagonally?", a: "Bishop", fact: "Each player starts with two bishops, one on light squares and one on dark. They can never change square color.", category: "Games", difficulty: 1 },
    { q: "What does the acronym 'NASA' stand for?", a: "National Aeronautics and Space Administration", fact: "NASA was established on July 29, 1958, succeeding the National Advisory Committee for Aeronautics (NACA).", category: "Science", difficulty: 1 },
    { q: "Which musician was known as 'The King of Pop'?", a: "Michael Jackson", fact: "Michael Jackson's album 'Thriller' (1982) remains the best-selling album of all time with over 70 million copies sold.", category: "Pop Culture", difficulty: 1 },
    { q: "What is the smallest country in the world by area?", a: "Vatican City", fact: "Vatican City spans just 0.44 square km (about 49 hectares) and has a population of roughly 800 people.", category: "Geography", difficulty: 1 },
    { q: "Who formulated the theory of general relativity?", a: "Albert Einstein", fact: "Einstein published his theory of general relativity in 1915, fundamentally changing our understanding of gravity, space, and time.", category: "Science", difficulty: 1 },
    { q: "What is the currency of South Korea?", a: "South Korean Won", fact: "The won has been the currency since 1962, replacing the earlier hwan. South Korea is the 10th largest economy globally.", category: "General", difficulty: 2 },
    { q: "Which Mughal emperor built the Taj Mahal?", a: "Shah Jahan", fact: "Built between 1632-1653, the Taj Mahal was commissioned as a mausoleum for Mumtaz Mahal and took 20,000 workers to complete.", category: "History", difficulty: 1 },
    { q: "What is the boiling point of water in Kelvin?", a: "373.15 K", fact: "The Kelvin scale starts at absolute zero (-273.15 C). It's the SI base unit of temperature.", category: "Science", difficulty: 2 },
    { q: "Which author created Sherlock Holmes?", a: "Arthur Conan Doyle", fact: "Doyle wrote 56 short stories and 4 novels featuring Holmes, starting with 'A Study in Scarlet' in 1887.", category: "Literature", difficulty: 1 },
    { q: "What is the most abundant gas in Earth's atmosphere?", a: "Nitrogen", fact: "Nitrogen makes up about 78% of Earth's atmosphere, followed by oxygen at 21%.", category: "Science", difficulty: 1 },
    { q: "Which Indian mathematician is known for his contributions to number theory and infinite series?", a: "Srinivasa Ramanujan", fact: "Ramanujan independently compiled nearly 3,900 results. His work on partition functions and mock theta functions opened new mathematical fields.", category: "Mathematics", difficulty: 2 },
    { q: "In which year did India gain independence?", a: "1947", fact: "India gained independence from British rule on August 15, 1947, ending nearly 200 years of colonial governance.", category: "History", difficulty: 1 },
    { q: "What phenomenon causes the sky to appear blue?", a: "Rayleigh Scattering", fact: "Sunlight's shorter blue wavelengths are scattered more by Earth's atmospheric molecules, giving the sky its blue appearance.", category: "Science", difficulty: 3 },
    { q: "Which is the longest epic poem ever written?", a: "Mahabharata", fact: "The Mahabharata contains over 200,000 verses and 1.8 million words, making it roughly ten times the length of the Iliad and Odyssey combined.", category: "Literature", difficulty: 2 },
    { q: "What does 'pH' stand for?", a: "Potential of Hydrogen", fact: "The pH scale was introduced by Danish biochemist S. P. L. Sorensen in 1909 at the Carlsberg Laboratory in Copenhagen.", category: "Science", difficulty: 2 },
    { q: "Which city hosted the first modern Olympic Games?", a: "Athens", fact: "The first modern Olympics were held in Athens, Greece in 1896, featuring 241 athletes from 14 nations competing in 43 events.", category: "Sports", difficulty: 1 },
  ];

  let currentIndex = 0;

  function getDailyIndex() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return seed % QUESTIONS.length;
  }

  function renderQuestion(index) {
    const q = QUESTIONS[index];
    if (!q) return;

    const categoryEl = document.getElementById('quiz-category');
    const questionEl = document.getElementById('quiz-question');
    const hintEl = document.getElementById('quiz-hint');
    const answerEl = document.getElementById('quiz-answer');
    const funfactEl = document.getElementById('quiz-funfact');
    const counterEl = document.getElementById('quiz-counter');
    const difficultyEl = document.getElementById('quiz-difficulty');
    const card = document.getElementById('flip-card');

    if (categoryEl) categoryEl.textContent = q.category;
    if (questionEl) questionEl.textContent = q.q;
    if (hintEl) hintEl.textContent = 'Click to reveal the answer';
    if (answerEl) answerEl.textContent = q.a;
    if (funfactEl) funfactEl.textContent = q.fact;
    if (counterEl) counterEl.textContent = (index + 1) + ' / ' + QUESTIONS.length;

    // Difficulty stars
    if (difficultyEl) {
      difficultyEl.innerHTML = '';
      for (let i = 0; i < 5; i++) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '16');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z');
        if (i < q.difficulty) {
          path.setAttribute('fill', 'var(--primary)');
          path.setAttribute('stroke', 'var(--primary)');
        } else {
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', 'var(--text-tertiary)');
        }
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);
        difficultyEl.appendChild(svg);
      }
    }

    // Reset flip
    if (card) card.classList.remove('is-flipped');
  }

  function initFlipCard() {
    const card = document.getElementById('flip-card');
    if (!card) return;

    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
    });
  }

  function initNavigation() {
    const prevBtn = document.getElementById('quiz-prev');
    const nextBtn = document.getElementById('quiz-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + QUESTIONS.length) % QUESTIONS.length;
        renderQuestion(currentIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % QUESTIONS.length;
        renderQuestion(currentIndex);
      });
    }
  }

  function init() {
    currentIndex = getDailyIndex();
    renderQuestion(currentIndex);
    initFlipCard();
    initNavigation();
    initQuizModes();
  }

  function initQuizModes() {
    const openBtn = document.getElementById('open-quiz-modes-btn');
    const closeBtn = document.getElementById('close-quiz-mode-btn');
    const overlay = document.getElementById('quiz-mode-overlay');
    const modeChoices = document.getElementById('mode-choices');
    
    // Tournament
    const btnTourney = document.getElementById('btn-tournament-mode');
    const tourneySection = document.getElementById('tournament-input-section');
    const btnTourneyBack = document.getElementById('btn-tournament-back');
    const btnTourneyJoin = document.getElementById('btn-tournament-join');
    const tourneyInput = document.getElementById('tournament-code-input');
    const tourneyError = document.getElementById('tournament-error');

    // Practice
    const btnPractice = document.getElementById('btn-practice-mode');
    const practiceSection = document.getElementById('practice-arena-section');
    const btnPracticeBack = document.getElementById('btn-arena-back');
    const arenaGrid = document.getElementById('arena-grid');

    if (!openBtn) return;

    openBtn.addEventListener('click', () => {
      overlay.classList.add('active');
      modeChoices.style.display = 'flex';
      tourneySection.style.display = 'none';
      practiceSection.style.display = 'none';
    });

    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
    });

    // Tournament Flow
    btnTourney.addEventListener('click', () => {
      modeChoices.style.display = 'none';
      tourneySection.style.display = 'block';
      tourneyError.style.display = 'none';
      tourneyInput.value = '';
      setTimeout(() => tourneyInput.focus(), 100);
    });

    btnTourneyBack.addEventListener('click', () => {
      tourneySection.style.display = 'none';
      modeChoices.style.display = 'flex';
    });

    btnTourneyJoin.addEventListener('click', () => {
      const code = tourneyInput.value.trim();
      
      // Allow any 5+ char code to launch the mock tournament
      if (code.length < 5) {
        tourneyError.style.display = 'block';
        return;
      }
      
      tourneyError.style.display = 'none';
      overlay.classList.remove('active');
      startQuizEntryFlow('tournament_1');
    });

    // Practice Flow
    btnPractice.addEventListener('click', () => {
      modeChoices.style.display = 'none';
      practiceSection.style.display = 'block';
      loadPracticeArena(arenaGrid);
    });

    btnPracticeBack.addEventListener('click', () => {
      practiceSection.style.display = 'none';
      modeChoices.style.display = 'flex';
    });

    // Setup Quiz Entry Flow listeners
    const btnEntryNext = document.getElementById('btn-entry-next');
    const btnEntryStart = document.getElementById('btn-entry-start');
    const nameInput = document.getElementById('quiz-participant-name');
    const stepName = document.getElementById('entry-step-name');
    const stepRules = document.getElementById('entry-step-rules');
    const entryOverlay = document.getElementById('quiz-entry-overlay');

    if (btnEntryNext) {
      btnEntryNext.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) {
          alert('Please enter your name');
          return;
        }
        participantName = name;
        stepName.style.display = 'none';
        stepRules.style.display = 'block';
      });
    }

    if (btnEntryStart) {
      btnEntryStart.addEventListener('click', () => {
        entryOverlay.classList.remove('active');
        if (currentPendingQuizId) {
          startCountdown(currentPendingQuizId);
        }
      });
    }
  }

  // ────────────────────────────────────────────
  // ACTIVE QUIZ INTERFACE LOGIC (v2 — per-question timers)
  // ────────────────────────────────────────────
  
  const MOCK_QUIZZES = {
    "practice_1": {
      name: "Science Trivia Weekly",
      timeLimit: 300,
      questions: [
        { type: "mcq", q: "Which planet has the most moons?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], ans: "Saturn", timer: 30 },
        { type: "mcq", q: "What is the speed of light in km/s?", options: ["299,792", "150,000", "300,000", "199,792"], ans: "299,792", timer: 20 },
        { type: "integer", q: "How many bones are in the adult human body?", ans: "206", timer: 15 },
        { type: "mcq", q: "What is the most abundant gas in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], ans: "Nitrogen", timer: 20 },
        { type: "integer", q: "What is the boiling point of water in Celsius?", ans: "100", timer: 10 }
      ]
    },
    "practice_2": {
      name: "History Buffs Challenge",
      timeLimit: 600,
      questions: [
        { type: "integer", q: "In what year did World War II end?", ans: "1945", timer: 15 },
        { type: "mcq", q: "Who was the first President of India?", options: ["Dr. Rajendra Prasad", "Jawaharlal Nehru", "Sardar Patel", "B.R. Ambedkar"], ans: "Dr. Rajendra Prasad", timer: 20 },
        { type: "mcq", q: "Which empire built Machu Picchu?", options: ["Aztec", "Maya", "Inca", "Olmec"], ans: "Inca", timer: 25 },
        { type: "integer", q: "In what year did India gain independence?", ans: "1947", timer: 10 },
        { type: "mcq", q: "Who discovered America in 1492?", options: ["Vasco da Gama", "Ferdinand Magellan", "Christopher Columbus", "Marco Polo"], ans: "Christopher Columbus", timer: 15 }
      ]
    },
    "tournament_1": {
      name: "The Grand IITGN Quiz",
      timeLimit: 120,
      questions: [
        { type: "mcq", q: "What is the capital of Mongolia?", options: ["Ulaanbaatar", "Astana", "Tashkent", "Bishkek"], ans: "Ulaanbaatar", timer: 20 },
        { type: "mcq", q: "Which element has the symbol 'W'?", options: ["Tungsten", "Wolframite", "Water", "White Phosphorus"], ans: "Tungsten", timer: 25 },
        { type: "integer", q: "How many bytes are in a kilobyte (traditional binary)?", ans: "1024", timer: 15 },
        { type: "mcq", q: "Who wrote 'One Hundred Years of Solitude'?", options: ["Gabriel Garcia Marquez", "Mario Vargas Llosa", "Jorge Luis Borges", "Julio Cortazar"], ans: "Gabriel Garcia Marquez", timer: 30 },
        { type: "integer", q: "What year was IIT Gandhinagar established?", ans: "2008", timer: 10 }
      ]
    }
  };

  let activeQuizState = null;
  let timerInterval = null;

  function loadPracticeArena(grid) {
    grid.innerHTML = '';
    const quizzes = [
      { id: "practice_1", data: MOCK_QUIZZES["practice_1"] },
      { id: "practice_2", data: MOCK_QUIZZES["practice_2"] }
    ];
    grid.innerHTML = quizzes.map(q => `
      <div class="arena-card" onclick="window.QSQuiz.startPracticeMatch('${q.id}')">
        <h4 style="margin-bottom:var(--space-2);color:var(--primary);">${q.data.name}</h4>
        <p style="font-size:var(--fs-sm);color:var(--text-secondary);margin-bottom:var(--space-1);">⏱️ ${Math.round(q.data.timeLimit/60)} Minutes</p>
        <p style="font-size:var(--fs-xs);color:var(--text-tertiary);">By System • ${q.data.questions.length} Questions</p>
      </div>
    `).join('');
  }

  let currentPendingQuizId = null;
  let participantName = "";

  function startQuizEntryFlow(quizId) {
    currentPendingQuizId = quizId;
    const overlay = document.getElementById('quiz-entry-overlay');
    const stepName = document.getElementById('entry-step-name');
    const stepRules = document.getElementById('entry-step-rules');
    const nameInput = document.getElementById('quiz-participant-name');
    
    if (!overlay) return;
    
    // Reset steps
    stepName.style.display = 'block';
    stepRules.style.display = 'none';
    nameInput.value = '';
    
    overlay.classList.add('active');
  }

  function startCountdown(quizId) {
    const overlay = document.getElementById('countdown-overlay');
    const numEl = document.getElementById('countdown-number');
    if (!overlay || !numEl) return;

    overlay.classList.add('active');
    let count = 3;
    numEl.textContent = count;

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        numEl.textContent = count;
        numEl.style.animation = 'none';
        numEl.offsetHeight;
        numEl.style.animation = null;
      } else {
        clearInterval(interval);
        numEl.textContent = "GO!";
        setTimeout(() => {
          overlay.classList.remove('active');
          launchActiveQuiz(quizId);
        }, 800);
      }
    }, 1000);
  }

  // ── Launch Quiz — initialize per-question state ──
  function launchActiveQuiz(quizId) {
    const quizData = MOCK_QUIZZES[quizId];
    if (!quizData) { alert("Quiz not found!"); return; }

    const n = quizData.questions.length;
    activeQuizState = {
      data: quizData,
      currentIndex: 0,
      userAnswers: new Array(n).fill(null),
      timeRemaining: quizData.questions.map(q => q.timer || 30),
      timeSpent: new Array(n).fill(0),
      locked: new Array(n).fill(false),
      totalTimeTaken: 0
    };

    document.getElementById('active-quiz-container').style.display = 'flex';
    document.getElementById('active-quiz-title').textContent = quizData.name;

    // Bind buttons (clone to remove old listeners)
    ['btn-quiz-next', 'btn-quiz-prev', 'btn-quiz-exit'].forEach(id => {
      const el = document.getElementById(id);
      const clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);
    });

    document.getElementById('btn-quiz-next').addEventListener('click', handleNext);
    document.getElementById('btn-quiz-prev').addEventListener('click', handlePrev);

    // Theme toggle
    const themeBtn = document.getElementById('quiz-theme-toggle');
    if (themeBtn) {
      const newTheme = themeBtn.cloneNode(true);
      themeBtn.parentNode.replaceChild(newTheme, themeBtn);
      newTheme.addEventListener('click', () => {
        const doc = document.documentElement;
        const next = doc.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        doc.setAttribute('data-theme', next);
        localStorage.setItem('qs_theme', next);
      });
    }

    // Exit flow
    const exitBtn = document.getElementById('btn-quiz-exit');
    const confirmOverlay = document.getElementById('exit-confirm-overlay');
    exitBtn.addEventListener('click', () => {
      pauseTimer();
      confirmOverlay.classList.add('active');
    });

    const btnCancel = document.getElementById('btn-cancel-exit');
    const btnConfirm = document.getElementById('btn-confirm-exit');
    [btnCancel, btnConfirm].forEach(el => {
      const clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);
    });
    document.getElementById('btn-cancel-exit').addEventListener('click', () => {
      confirmOverlay.classList.remove('active');
      resumeTimer();
    });
    document.getElementById('btn-confirm-exit').addEventListener('click', () => {
      confirmOverlay.classList.remove('active');
      pauseTimer();
      document.getElementById('active-quiz-container').style.display = 'none';
    });

    // Submit review popup bindings
    const reviewClose = document.getElementById('btn-review-close');
    const reviewSubmit = document.getElementById('btn-review-submit');
    if (reviewClose) {
      const rc = reviewClose.cloneNode(true);
      reviewClose.parentNode.replaceChild(rc, reviewClose);
      rc.addEventListener('click', () => {
        document.getElementById('submit-review-overlay').classList.remove('active');
        resumeTimer();
      });
    }
    if (reviewSubmit) {
      const rs = reviewSubmit.cloneNode(true);
      reviewSubmit.parentNode.replaceChild(rs, reviewSubmit);
      rs.addEventListener('click', () => {
        document.getElementById('submit-review-overlay').classList.remove('active');
        finalSubmit();
      });
    }

    renderActiveQuestion();
  }

  // ── Timer — pause / resume / start ──
  function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function resumeTimer() {
    if (timerInterval) return; // Already running
    const idx = activeQuizState.currentIndex;
    if (activeQuizState.locked[idx]) return;
    startTimerForCurrent();
  }

  function startTimerForCurrent() {
    pauseTimer();
    const state = activeQuizState;
    const idx = state.currentIndex;

    if (state.locked[idx]) {
      updateTimerDisplay(0);
      return;
    }

    updateTimerDisplay(state.timeRemaining[idx]);

    timerInterval = setInterval(() => {
      state.timeRemaining[idx]--;
      state.timeSpent[idx]++;
      state.totalTimeTaken++;

      if (state.timeRemaining[idx] <= 0) {
        state.timeRemaining[idx] = 0;
        state.locked[idx] = true;
        pauseTimer();
        saveCurrentAnswer();
        renderQuestionNav();
        updateTimerDisplay(0);
        autoNavigateAfterLock();
        return;
      }

      updateTimerDisplay(state.timeRemaining[idx]);
    }, 1000);
  }

  function updateTimerDisplay(seconds) {
    const timerEl = document.getElementById('active-quiz-timer');
    const textEl = document.getElementById('timer-text');
    if (!textEl) return;
    const m = Math.floor(Math.max(0, seconds) / 60).toString().padStart(2, '0');
    const s = (Math.max(0, seconds) % 60).toString().padStart(2, '0');
    textEl.textContent = `${m}:${s}`;
    if (seconds <= 10) {
      timerEl.classList.add('warning');
    } else {
      timerEl.classList.remove('warning');
    }
  }

  // ── Auto-navigate when a question locks ──
  function autoNavigateAfterLock() {
    const target = findNearestUnlocked();
    if (target === -1) {
      // All questions locked or answered — trigger submit review
      showSubmitReview();
    } else {
      saveCurrentAnswer();
      activeQuizState.currentIndex = target;
      renderActiveQuestion();
    }
  }

  // Find nearest unlocked question (search forward first, then backward)
  function findNearestUnlocked() {
    const state = activeQuizState;
    const n = state.data.questions.length;
    // Search forward from current (Right side)
    for (let i = state.currentIndex + 1; i < n; i++) {
      if (!state.locked[i] && state.timeRemaining[i] > 0) return i;
    }
    // Search backward from current (Left side)
    for (let i = state.currentIndex - 1; i >= 0; i--) {
      if (!state.locked[i] && state.timeRemaining[i] > 0) return i;
    }
    return -1; // None found
  }

  // Find nearest unlocked PREVIOUS question
  function findNearestUnlockedPrev() {
    const state = activeQuizState;
    for (let i = state.currentIndex - 1; i >= 0; i--) {
      if (!state.locked[i] && state.timeRemaining[i] > 0) return i;
    }
    return -1;
  }

  // ── Navigation handlers ──
  function handleNext() {
    saveCurrentAnswer();
    const state = activeQuizState;
    if (state.currentIndex < state.data.questions.length - 1) {
      pauseTimer();
      state.currentIndex++;
      // Skip locked questions going forward
      while (state.currentIndex < state.data.questions.length - 1 && state.locked[state.currentIndex]) {
        state.currentIndex++;
      }
      renderActiveQuestion();
    } else {
      // Last question — show submit review
      pauseTimer();
      showSubmitReview();
    }
  }

  function handlePrev() {
    saveCurrentAnswer();
    const target = findNearestUnlockedPrev();
    if (target === -1) return; // No unlocked previous
    pauseTimer();
    activeQuizState.currentIndex = target;
    renderActiveQuestion();
  }

  function navigateToQuestion(idx) {
    const state = activeQuizState;
    if (state.locked[idx]) return; // Can't navigate to locked
    saveCurrentAnswer();
    pauseTimer();
    state.currentIndex = idx;
    renderActiveQuestion();
  }

  // ── Save answer ──
  function saveCurrentAnswer() {
    if (!activeQuizState) return;
    const idx = activeQuizState.currentIndex;
    if (activeQuizState.locked[idx]) return; // Can't modify locked
    const q = activeQuizState.data.questions[idx];
    if (q.type === 'mcq') {
      const selected = document.querySelector('.quiz-option-btn.selected');
      if (selected) {
        activeQuizState.userAnswers[idx] = selected.dataset.value;
      }
    } else if (q.type === 'integer') {
      const input = document.getElementById('active-int-input');
      if (input && input.value !== '') {
        activeQuizState.userAnswers[idx] = input.value;
      }
    }
  }

  // ── Render question navigation strip ──
  function renderQuestionNav() {
    const navContainer = document.getElementById('quiz-question-nav');
    if (!navContainer) return;
    navContainer.innerHTML = '';
    const state = activeQuizState;

    state.data.questions.forEach((_, idx) => {
      const box = document.createElement('div');
      box.className = 'q-nav-box';

      if (state.locked[idx]) {
        box.classList.add('locked');
      } else if (state.userAnswers[idx] !== null) {
        box.classList.add('attempted');
      }
      if (idx === state.currentIndex) box.classList.add('current');

      box.textContent = idx + 1;

      box.addEventListener('click', () => {
        if (state.locked[idx]) return;
        navigateToQuestion(idx);
      });
      navContainer.appendChild(box);
    });
  }

  // ── Render the active question ──
  function renderActiveQuestion() {
    const state = activeQuizState;
    const idx = state.currentIndex;
    const q = state.data.questions[idx];
    const isLocked = state.locked[idx];

    document.getElementById('active-quiz-progress').textContent = `Question ${idx + 1} of ${state.data.questions.length}`;
    document.getElementById('active-question-text').textContent = q.q;

    renderQuestionNav();

    const optionsContainer = document.getElementById('active-options-container');
    optionsContainer.innerHTML = '';
    const savedAns = state.userAnswers[idx];

    if (q.type === 'mcq') {
      q.options.forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn' + (savedAns === opt ? ' selected' : '');
        btn.dataset.value = opt;
        btn.innerHTML = `<span class="option-label">${letter}</span> ${opt}`;

        if (isLocked) {
          btn.disabled = true;
          btn.classList.add('locked-option');
        } else {
          btn.onclick = () => {
            document.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            saveCurrentAnswer();
            renderQuestionNav();
          };
        }
        optionsContainer.appendChild(btn);
      });
    } else if (q.type === 'integer') {
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'form-field';
      input.id = 'active-int-input';
      input.placeholder = 'Enter a number...';
      input.style.fontSize = 'var(--fs-2xl)';
      input.style.padding = 'var(--space-6)';
      if (savedAns !== null) input.value = savedAns;

      if (isLocked) {
        input.disabled = true;
        input.classList.add('locked-option');
      } else {
        input.addEventListener('input', () => {
          saveCurrentAnswer();
          renderQuestionNav();
        });
      }
      optionsContainer.appendChild(input);
    }

    // Show locked banner if applicable
    const existingBanner = document.querySelector('.locked-banner');
    if (existingBanner) existingBanner.remove();
    if (isLocked) {
      const banner = document.createElement('div');
      banner.className = 'locked-banner';
      banner.innerHTML = '🔒 Time expired — this question is locked';
      optionsContainer.parentNode.insertBefore(banner, optionsContainer);
    }

    // Update prev/next buttons
    updateNavButtons();

    // Start or show timer
    if (isLocked) {
      pauseTimer();
      updateTimerDisplay(0);
    } else {
      startTimerForCurrent();
    }
  }

  function updateNavButtons() {
    const state = activeQuizState;
    const prevBtn = document.getElementById('btn-quiz-prev');
    const nextBtn = document.getElementById('btn-quiz-next');

    // Previous: disabled if first question OR no unlocked previous exists
    const hasPrev = findNearestUnlockedPrev() !== -1;
    prevBtn.disabled = !hasPrev;

    // Next / Submit
    if (state.currentIndex === state.data.questions.length - 1) {
      nextBtn.textContent = 'Submit';
      nextBtn.style.background = '#0ea5e9';
      nextBtn.style.borderColor = '#0ea5e9';
      nextBtn.style.color = '#ffffff';
    } else {
      nextBtn.textContent = 'Next';
      nextBtn.style.background = '';
      nextBtn.style.borderColor = '';
      nextBtn.style.color = '';
    }
  }

  // ── Submit Review Popup ──
  function showSubmitReview() {
    pauseTimer();
    saveCurrentAnswer();
    const state = activeQuizState;
    const overlay = document.getElementById('submit-review-overlay');
    const grid = document.getElementById('review-question-grid');

    if (!overlay || !grid) { finalSubmit(); return; }

    // Find questions with time remaining
    const remaining = [];
    state.data.questions.forEach((_, idx) => {
      if (!state.locked[idx] && state.timeRemaining[idx] > 0) {
        remaining.push(idx);
      }
    });

    grid.innerHTML = '';
    if (remaining.length === 0) {
      document.getElementById('review-message').textContent = 'All questions have been answered or their timers have expired.';
    } else {
      document.getElementById('review-message').textContent = `${remaining.length} question(s) still have time remaining:`;
      remaining.forEach(idx => {
        const box = document.createElement('div');
        box.className = 'q-nav-box review-box';
        if (state.userAnswers[idx] !== null) box.classList.add('attempted');
        box.textContent = idx + 1;
        const timeLabel = document.createElement('span');
        timeLabel.className = 'review-time-label';
        timeLabel.textContent = `${state.timeRemaining[idx]}s`;
        box.appendChild(timeLabel);
        box.addEventListener('click', () => {
          overlay.classList.remove('active');
          navigateToQuestion(idx);
        });
        grid.appendChild(box);
      });
    }

    overlay.classList.add('active');
  }

  // ── Final Submit — Full Analysis Dashboard ──
  function finalSubmit() {
    pauseTimer();
    saveCurrentAnswer();
    document.getElementById('active-quiz-container').style.display = 'none';

    const state = activeQuizState;
    const questions = state.data.questions;
    let correct = 0, wrong = 0, skipped = 0, timedOut = 0;

    const analysisData = questions.map((q, idx) => {
      const userAns = state.userAnswers[idx];
      const isCorrect = userAns != null && String(userAns) === String(q.ans);
      if (isCorrect) correct++;

      let status;
      if (userAns === null && state.locked[idx]) { status = 'timeout'; timedOut++; }
      else if (userAns === null) { status = 'skipped'; skipped++; }
      else if (isCorrect) { status = 'correct'; }
      else { status = 'wrong'; wrong++; }

      const allocatedTime = q.timer || 30;
      return { q: q.q, userAns, correctAns: q.ans, timeSpent: state.timeSpent[idx], allocatedTime, status, type: q.type, idx };
    });

    const totalQ = questions.length;
    const totalTime = state.totalTimeTaken;
    const m = Math.floor(totalTime / 60).toString().padStart(2, '0');
    const s = (totalTime % 60).toString().padStart(2, '0');
    const accuracy = Math.round((correct / totalQ) * 100);
    const avgTime = totalQ > 0 ? (totalTime / totalQ).toFixed(1) : '0';

    // Performance grade
    let grade, gradeColor;
    if (accuracy >= 95) { grade = 'A+'; gradeColor = '#22c55e'; }
    else if (accuracy >= 85) { grade = 'A'; gradeColor = '#22c55e'; }
    else if (accuracy >= 75) { grade = 'B+'; gradeColor = '#84cc16'; }
    else if (accuracy >= 65) { grade = 'B'; gradeColor = '#eab308'; }
    else if (accuracy >= 50) { grade = 'C'; gradeColor = '#f59e0b'; }
    else if (accuracy >= 35) { grade = 'D'; gradeColor = '#ef4444'; }
    else { grade = 'F'; gradeColor = '#dc2626'; }

    // Fastest / Slowest (excluding locked/skipped with 0 time)
    const answeredData = analysisData.filter(d => d.status === 'correct' || d.status === 'wrong');
    const fastest = answeredData.length > 0 ? Math.min(...answeredData.map(d => d.timeSpent)) : 0;
    const slowest = answeredData.length > 0 ? Math.max(...answeredData.map(d => d.timeSpent)) : 0;

    // SVG Donut chart data
    const donutData = [
      { label: 'Correct', count: correct, color: '#22c55e' },
      { label: 'Wrong', count: wrong, color: '#ef4444' },
      { label: 'Timed Out', count: timedOut, color: '#f59e0b' },
      { label: 'Skipped', count: skipped, color: '#94a3b8' }
    ].filter(d => d.count > 0);

    let donutSVG = '';
    const radius = 60, cx = 80, cy = 80, circumference = 2 * Math.PI * radius;
    let cumulativeOffset = 0;
    donutData.forEach(seg => {
      const pct = seg.count / totalQ;
      const dashLen = pct * circumference;
      const dashGap = circumference - dashLen;
      const rotation = (cumulativeOffset / totalQ) * 360 - 90;
      donutSVG += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${seg.color}" stroke-width="18" stroke-dasharray="${dashLen} ${dashGap}" transform="rotate(${rotation} ${cx} ${cy})" stroke-linecap="round" style="transition: stroke-dasharray 1s ease;"/>`;
      cumulativeOffset += seg.count;
    });

    const donutLegend = donutData.map(d => `
      <div class="donut-legend-item">
        <span class="donut-dot" style="background:${d.color};"></span>
        <span class="donut-legend-label">${d.label}</span>
        <span class="donut-legend-value">${d.count}</span>
      </div>
    `).join('');

    // Per-question time bars
    const maxAlloc = Math.max(...analysisData.map(d => d.allocatedTime), 1);
    const timeBarsHTML = analysisData.map((d, idx) => {
      const spentPct = Math.min((d.timeSpent / maxAlloc) * 100, 100);
      const allocPct = Math.min((d.allocatedTime / maxAlloc) * 100, 100);
      const statusColors = { correct: '#22c55e', wrong: '#ef4444', timeout: '#f59e0b', skipped: '#94a3b8' };
      const barColor = statusColors[d.status] || '#94a3b8';
      return `
        <div class="time-bar-row">
          <span class="time-bar-label">Q${idx + 1}</span>
          <div class="time-bar-track">
            <div class="time-bar-alloc" style="width:${allocPct}%;"></div>
            <div class="time-bar-spent" style="width:${spentPct}%;background:${barColor};"></div>
          </div>
          <span class="time-bar-val">${d.timeSpent}s</span>
        </div>`;
    }).join('');

    // Per-question breakdown cards
    const statusIcons = { correct: '✓', wrong: '✗', timeout: '⏱', skipped: '—' };
    const statusLabels = { correct: 'Correct', wrong: 'Wrong', timeout: 'Time Up', skipped: 'Skipped' };
    const breakdownHTML = analysisData.map((d, idx) => {
      const userDisplay = d.userAns !== null ? d.userAns : '—';
      return `
        <div class="result-question-card status-${d.status}">
          <div class="rq-header">
            <span class="rq-num">Q${idx + 1}</span>
            <span class="rq-status status-badge-${d.status}">${statusIcons[d.status]} ${statusLabels[d.status]}</span>
            <span class="rq-time">${d.timeSpent}s / ${d.allocatedTime}s</span>
          </div>
          <p class="rq-text">${d.q}</p>
          <div class="rq-answers">
            <div class="rq-ans"><span class="rq-label">Your answer:</span> <span class="rq-val rq-user-${d.status}">${userDisplay}</span></div>
            <div class="rq-ans"><span class="rq-label">Correct:</span> <span class="rq-val rq-correct">${d.correctAns}</span></div>
          </div>
        </div>`;
    }).join('');

    // Build full dashboard
    const dashboard = document.getElementById('analysis-dashboard');
    dashboard.innerHTML = `
      <!-- Dashboard Header -->
      <div class="ad-header">
        <h2 class="ad-title">Quiz Complete!</h2>
        <p class="ad-subtitle">${state.participantName ? state.participantName + ' — ' : ''}${state.data.name || 'Practice Quiz'}</p>
      </div>

      <!-- Top Row: Grade + Donut -->
      <div class="ad-top-row">
        <div class="ad-grade-card">
          <div class="ad-grade-circle" style="border-color:${gradeColor};">
            <span class="ad-grade-letter" style="color:${gradeColor};">${grade}</span>
          </div>
          <p class="ad-grade-label">Performance Grade</p>
          <p class="ad-accuracy">${accuracy}% accuracy</p>
        </div>
        <div class="ad-donut-card">
          <svg viewBox="0 0 160 160" class="ad-donut-svg">
            ${donutSVG}
            <text x="${cx}" y="${cy - 6}" text-anchor="middle" class="ad-donut-score">${correct}/${totalQ}</text>
            <text x="${cx}" y="${cy + 14}" text-anchor="middle" class="ad-donut-sub">correct</text>
          </svg>
          <div class="donut-legend">${donutLegend}</div>
        </div>
      </div>

      <!-- Summary Stat Cards -->
      <div class="ad-stats-grid">
        <div class="ad-stat-card ad-stat-correct">
          <span class="ad-stat-num">${correct}</span>
          <span class="ad-stat-lbl">Correct</span>
        </div>
        <div class="ad-stat-card ad-stat-wrong">
          <span class="ad-stat-num">${wrong}</span>
          <span class="ad-stat-lbl">Wrong</span>
        </div>
        <div class="ad-stat-card ad-stat-timeout">
          <span class="ad-stat-num">${timedOut}</span>
          <span class="ad-stat-lbl">Timed Out</span>
        </div>
        <div class="ad-stat-card ad-stat-skipped">
          <span class="ad-stat-num">${skipped}</span>
          <span class="ad-stat-lbl">Skipped</span>
        </div>
      </div>

      <!-- Time Analysis -->
      <div class="ad-section">
        <h3 class="ad-section-title">⏱ Time Analysis</h3>
        <div class="ad-time-summary">
          <div class="ad-time-item"><span class="ad-time-val">${m}:${s}</span><span class="ad-time-lbl">Total Time</span></div>
          <div class="ad-time-item"><span class="ad-time-val">${avgTime}s</span><span class="ad-time-lbl">Avg / Question</span></div>
          <div class="ad-time-item"><span class="ad-time-val">${fastest}s</span><span class="ad-time-lbl">Fastest</span></div>
          <div class="ad-time-item"><span class="ad-time-val">${slowest}s</span><span class="ad-time-lbl">Slowest</span></div>
        </div>
        <div class="ad-time-bars">${timeBarsHTML}</div>
      </div>

      <!-- Question Breakdown -->
      <div class="ad-section">
        <h3 class="ad-section-title">📋 Question Breakdown</h3>
        <div class="results-breakdown">${breakdownHTML}</div>
      </div>

      <!-- Return Button -->
      <div class="ad-footer">
        <button class="btn btn-primary btn-lg" id="btn-return-arena" style="width:100%;justify-content:center;">Return to Arena</button>
      </div>
    `;

    const container = document.getElementById('quiz-results-container');
    container.style.display = 'flex';

    // Return button
    const returnBtn = document.getElementById('btn-return-arena');
    if (returnBtn) {
      returnBtn.addEventListener('click', () => {
        container.style.display = 'none';
        activeQuizState = null;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use
  window.QSQuiz = { 
    QUESTIONS, 
    getRandomQuestion: () => QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)],
    startPracticeMatch: (quizId) => {
      document.getElementById('quiz-mode-overlay').classList.remove('active');
      startQuizEntryFlow(quizId);
    }
  };
})();
