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
      startCountdown('tournament_1');
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
  }

  // ────────────────────────────────────────────
  // ACTIVE QUIZ INTERFACE LOGIC
  // ────────────────────────────────────────────
  
  const MOCK_QUIZZES = {
    "practice_1": {
      name: "Science Trivia Weekly",
      timeLimit: 300, // 5 minutes in seconds
      questions: [
        { type: "mcq", q: "Which planet has the most moons?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], ans: "Saturn" },
        { type: "mcq", q: "What is the speed of light in km/s?", options: ["299,792", "150,000", "300,000", "199,792"], ans: "299,792" },
        { type: "integer", q: "How many bones are in the adult human body?", ans: "206" },
        { type: "mcq", q: "What is the most abundant gas in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], ans: "Nitrogen" },
        { type: "integer", q: "What is the boiling point of water in Celsius?", ans: "100" }
      ]
    },
    "practice_2": {
      name: "History Buffs Challenge",
      timeLimit: 600, // 10 minutes
      questions: [
        { type: "integer", q: "In what year did World War II end?", ans: "1945" },
        { type: "mcq", q: "Who was the first President of India?", options: ["Dr. Rajendra Prasad", "Jawaharlal Nehru", "Sardar Patel", "B.R. Ambedkar"], ans: "Dr. Rajendra Prasad" },
        { type: "mcq", q: "Which empire built Machu Picchu?", options: ["Aztec", "Maya", "Inca", "Olmec"], ans: "Inca" },
        { type: "integer", q: "In what year did India gain independence?", ans: "1947" },
        { type: "mcq", q: "Who discovered America in 1492?", options: ["Vasco da Gama", "Ferdinand Magellan", "Christopher Columbus", "Marco Polo"], ans: "Christopher Columbus" }
      ]
    },
    "tournament_1": {
      name: "The Grand IITGN Quiz",
      timeLimit: 120, // 2 minutes for pressure
      questions: [
        { type: "mcq", q: "What is the capital of Mongolia?", options: ["Ulaanbaatar", "Astana", "Tashkent", "Bishkek"], ans: "Ulaanbaatar" },
        { type: "mcq", q: "Which element has the symbol 'W'?", options: ["Tungsten", "Wolframite", "Water", "White Phosphorus"], ans: "Tungsten" },
        { type: "integer", q: "How many bytes are in a kilobyte (traditional binary)?", ans: "1024" },
        { type: "mcq", q: "Who wrote 'One Hundred Years of Solitude'?", options: ["Gabriel Garcia Marquez", "Mario Vargas Llosa", "Jorge Luis Borges", "Julio Cortazar"], ans: "Gabriel Garcia Marquez" },
        { type: "integer", q: "What year was IIT Gandhinagar established?", ans: "2008" }
      ]
    }
  };

  let activeQuizState = null;
  let timerInterval = null;

  function loadPracticeArena(grid) {
    grid.innerHTML = '';
    
    // Render only the practice quizzes
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

  function startCountdown(quizId) {
    const overlay = document.getElementById('countdown-overlay');
    const numEl = document.getElementById('countdown-number');
    if (!overlay || !numEl) return;

    overlay.classList.add('active');
    let count = 3; // Reduced to 3s for faster testing
    numEl.textContent = count;

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        numEl.textContent = count;
        numEl.style.animation = 'none';
        numEl.offsetHeight; // trigger reflow
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

  function launchActiveQuiz(quizId) {
    const quizData = MOCK_QUIZZES[quizId];
    if (!quizData) {
      alert("Quiz not found!");
      return;
    }

    activeQuizState = {
      data: quizData,
      currentIndex: 0,
      userAnswers: new Array(quizData.questions.length).fill(null),
      timeRemaining: quizData.timeLimit
    };

    document.getElementById('active-quiz-container').style.display = 'flex';
    document.getElementById('active-quiz-title').textContent = quizData.name;
    
    // Navigation bindings
    const nextBtn = document.getElementById('btn-quiz-next');
    const prevBtn = document.getElementById('btn-quiz-prev');
    
    // Clear old listeners
    const newNext = nextBtn.cloneNode(true);
    const newPrev = prevBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);
    prevBtn.parentNode.replaceChild(newPrev, prevBtn);

    newNext.addEventListener('click', () => {
      // Save answer
      saveCurrentAnswer();
      
      if (activeQuizState.currentIndex < activeQuizState.data.questions.length - 1) {
        activeQuizState.currentIndex++;
        renderActiveQuestion();
      } else {
        submitQuiz();
      }
    });

    newPrev.addEventListener('click', () => {
      saveCurrentAnswer();
      if (activeQuizState.currentIndex > 0) {
        activeQuizState.currentIndex--;
        renderActiveQuestion();
      }
    });

    renderActiveQuestion();
    startTimer();
  }

  function saveCurrentAnswer() {
    const q = activeQuizState.data.questions[activeQuizState.currentIndex];
    if (q.type === 'mcq') {
      const selected = document.querySelector('.quiz-option-btn.selected');
      if (selected) {
        activeQuizState.userAnswers[activeQuizState.currentIndex] = selected.dataset.value;
      }
    } else if (q.type === 'integer') {
      const input = document.getElementById('active-int-input');
      if (input && input.value !== '') {
        activeQuizState.userAnswers[activeQuizState.currentIndex] = input.value;
      }
    }
  }

  function renderActiveQuestion() {
    const state = activeQuizState;
    const q = state.data.questions[state.currentIndex];
    
    document.getElementById('active-quiz-progress').textContent = \`Question \${state.currentIndex + 1} of \${state.data.questions.length}\`;
    document.getElementById('active-question-text').textContent = q.q;
    
    const optionsContainer = document.getElementById('active-options-container');
    optionsContainer.innerHTML = '';

    const savedAns = state.userAnswers[state.currentIndex];

    if (q.type === 'mcq') {
      q.options.forEach((opt, idx) => {
        const letter = String.fromCharCode(65 + idx); // A, B, C, D
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn' + (savedAns === opt ? ' selected' : '');
        btn.dataset.value = opt;
        btn.innerHTML = \`<span class="option-label">\${letter}</span> \${opt}\`;
        
        btn.onclick = () => {
          document.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        };
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
      if (savedAns !== null) {
        input.value = savedAns;
      }
      optionsContainer.appendChild(input);
    }

    // Update buttons
    const nextBtn = document.getElementById('btn-quiz-next');
    const prevBtn = document.getElementById('btn-quiz-prev');
    
    prevBtn.style.visibility = state.currentIndex === 0 ? 'hidden' : 'visible';
    
    if (state.currentIndex === state.data.questions.length - 1) {
      nextBtn.textContent = 'Submit Quiz';
      nextBtn.style.background = 'var(--success)';
    } else {
      nextBtn.textContent = 'Next Question';
      nextBtn.style.background = 'var(--primary)';
    }
  }

  function startTimer() {
    clearInterval(timerInterval);
    const timerEl = document.getElementById('active-quiz-timer');
    const textEl = document.getElementById('timer-text');
    
    timerInterval = setInterval(() => {
      activeQuizState.timeRemaining--;
      const r = activeQuizState.timeRemaining;
      
      if (r <= 0) {
        clearInterval(timerInterval);
        submitQuiz();
        return;
      }
      
      const m = Math.floor(r / 60).toString().padStart(2, '0');
      const s = (r % 60).toString().padStart(2, '0');
      textEl.textContent = \`\${m}:\${s}\`;
      
      if (r <= 30) {
        timerEl.classList.add('warning');
      } else {
        timerEl.classList.remove('warning');
      }
    }, 1000);
  }

  function submitQuiz() {
    clearInterval(timerInterval);
    saveCurrentAnswer();
    document.getElementById('active-quiz-container').style.display = 'none';
    
    // Calculate Score
    let correct = 0;
    const questions = activeQuizState.data.questions;
    for (let i = 0; i < questions.length; i++) {
      // Simple string match for mock purposes
      if (activeQuizState.userAnswers[i] == questions[i].ans) {
        correct++;
      }
    }

    const timeTaken = activeQuizState.data.timeLimit - activeQuizState.timeRemaining;
    const m = Math.floor(timeTaken / 60).toString().padStart(2, '0');
    const s = (timeTaken % 60).toString().padStart(2, '0');

    document.getElementById('quiz-results-container').style.display = 'flex';
    document.getElementById('results-score').textContent = \`\${correct}/\${questions.length}\`;
    document.getElementById('results-time').textContent = \`\${m}:\${s}\`;
    document.getElementById('results-accuracy').textContent = Math.round((correct / questions.length) * 100) + '%';
    
    document.getElementById('btn-return-arena').onclick = () => {
      document.getElementById('quiz-results-container').style.display = 'none';
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose questions for buzzer and quiz start
  window.QSQuiz = { 
    QUESTIONS, 
    getRandomQuestion: () => QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)],
    startPracticeMatch: (quizId) => {
      document.getElementById('quiz-mode-overlay').classList.remove('active');
      startCountdown(quizId);
    }
  };
})();
