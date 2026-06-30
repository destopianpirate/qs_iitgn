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

  async function syncPublicQuizzes() {
    if (window.db) {
      try {
        const docRef = window.db.collection('global').doc('allQuizzes');
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          const dataStr = docSnap.data().data;
          localStorage.setItem('qs_admin_quizzes', dataStr);
        }
      } catch (e) {
        console.error("Firebase sync error:", e);
      }
    }
  }

  async function init() {
    await syncPublicQuizzes();
    
    if (document.body.classList.contains('quiz-dedicated-page')) {
      initPortalFlow();
    } else {
      currentIndex = getDailyIndex();
      renderQuestion(currentIndex);
      initFlipCard();
      initNavigation();
      
      const openBtn = document.getElementById('open-quiz-modes-btn');
      if (openBtn) {
        openBtn.addEventListener('click', () => {
          sessionStorage.removeItem('activeQuizId'); // Ensure mode selector is shown
          window.location.href = 'active-quiz.html';
        });
      }
    }
  }

  function initPortalFlow() {
    const overlay = document.getElementById('portal-flow-overlay');
    if (!overlay) return;
    
    const stepName = document.getElementById('portal-step-name');
    const stepMode = document.getElementById('portal-step-mode');
    const stepPractice = document.getElementById('portal-step-practice');
    const stepTournament = document.getElementById('portal-step-tournament');
    const stepRules = document.getElementById('portal-step-rules');
    const greetingTitle = document.getElementById('greeting-title');

    function hideAllSteps() {
      [stepName, stepMode, stepPractice, stepTournament, stepRules].forEach(s => {
        if(s) s.style.display = 'none';
      });
    }

    // Determine initial state
    const savedQuizId = sessionStorage.getItem('activeQuizId');
    overlay.classList.add('active');
    hideAllSteps();
    stepName.style.display = 'block';
    
    if (savedQuizId) {
      currentPendingQuizId = savedQuizId;
    }

    // Step 1 -> Next
    document.getElementById('btn-name-next').addEventListener('click', () => {
      const name = document.getElementById('quiz-participant-name').value.trim();
      if (!name) {
        alert('Please enter your name');
        return;
      }
      participantName = name;
      greetingTitle.textContent = `Hi, ${name}!`;
      hideAllSteps();
      
      if (currentPendingQuizId) {
        stepRules.style.display = 'block';
      } else {
        stepMode.style.display = 'block';
      }
    });

    // Step 2: Mode Selection
    document.getElementById('btn-portal-practice').addEventListener('click', () => {
      hideAllSteps();
      stepPractice.style.display = 'block';
      loadPracticeArena(document.getElementById('arena-grid'));
    });

    document.getElementById('btn-portal-tournament').addEventListener('click', () => {
      hideAllSteps();
      stepTournament.style.display = 'block';
      document.getElementById('tournament-code-input').value = '';
    });

    // Back Buttons
    document.getElementById('btn-practice-back').addEventListener('click', () => {
      hideAllSteps();
      stepMode.style.display = 'block';
    });

    document.getElementById('btn-tournament-back').addEventListener('click', () => {
      hideAllSteps();
      stepMode.style.display = 'block';
    });

    // Step 3B -> Join Match
    document.getElementById('btn-tournament-join').addEventListener('click', () => {
      const code = document.getElementById('tournament-code-input').value.trim();
      const allQuizzes = JSON.parse(localStorage.getItem('qs_admin_quizzes') || '[]');
      const matchingQuiz = allQuizzes.find(q => (q.visibility === 'private' || !q.isPublic) && q.accessCode === code);

      if (!matchingQuiz) {
        document.getElementById('tournament-error').textContent = 'Invalid tournament code.';
        document.getElementById('tournament-error').style.display = 'block';
        return;
      }
      document.getElementById('tournament-error').style.display = 'none';
      currentPendingQuizId = matchingQuiz.id;
      hideAllSteps();
      stepRules.style.display = 'block';
    });

    // Step 4: Rules Back
    document.getElementById('btn-rules-back').addEventListener('click', () => {
      if (sessionStorage.getItem('activeQuizId')) {
        window.location.href = 'active-quiz.html';
      } else {
        hideAllSteps();
        stepMode.style.display = 'block';
        currentPendingQuizId = null;
      }
    });

    // Step 4 -> Start Countdown
    document.getElementById('btn-rules-start').addEventListener('click', () => {
      overlay.classList.remove('active');
      if (currentPendingQuizId) {
        startCountdown(currentPendingQuizId);
      }
    });

    // Portal Close
    const portalCloseBtn = document.getElementById('btn-portal-close');
    if (portalCloseBtn) {
      portalCloseBtn.addEventListener('click', () => {
        window.location.href = 'active-quiz.html';
      });
    }
  }

  // ────────────────────────────────────────────
  // ACTIVE QUIZ INTERFACE LOGIC (v2 — per-question timers)
  // ────────────────────────────────────────────
  
  let activeQuizState = null;
  let timerInterval = null;

  // Retrieve global active quiz data
  function getQuizData(quizId) {
    const allQuizzes = JSON.parse(localStorage.getItem('qs_admin_quizzes') || '[]');
    return allQuizzes.find(q => q.id === quizId);
  }

  function loadPracticeArena(grid) {
    grid.innerHTML = '';
    const allQuizzes = JSON.parse(localStorage.getItem('qs_admin_quizzes') || '[]');
    // Filter for public quizzes
    const publicQuizzes = allQuizzes.filter(q => q.visibility === 'public' || (q.visibility !== 'archive' && q.isPublic === true));
    
    if (publicQuizzes.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:var(--text-secondary); padding: 40px;">No public practice quizzes available yet.</div>';
      return;
    }

    grid.innerHTML = publicQuizzes.map(q => `
      <div class="arena-card" id="arena-card-${q.id}" onclick="window.QSQuiz.selectPracticeMatch('${q.id}')" style="background: #f1f5f9; border: 2px solid transparent; border-radius: 16px; padding: 20px 24px; cursor: pointer; transition: all 0.2s;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
          <h4 style="margin:0; color:var(--primary); font-size: var(--fs-base); font-weight: 700; flex: 1; min-width: 120px;">${q.name || 'Untitled Quiz'}</h4>
          <div style="display: flex; gap: 12px; align-items: center; flex-shrink: 0;">
            <span style="display:flex; align-items:center; font-size:var(--fs-xs); color:var(--text-secondary); background: var(--surface); padding: 4px 12px; border-radius: 9999px; font-weight: 600;"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>${Math.ceil((q.totalTime || 300)/60)} min</span>
            <span style="display:flex; align-items:center; font-size:var(--fs-xs); color:var(--text-secondary); background: var(--surface); padding: 4px 12px; border-radius: 9999px; font-weight: 600;"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>${(q.questions || []).length} Qs</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  let currentPendingQuizId = null;
  let participantName = "";

  window.QSQuiz = window.QSQuiz || {};
  window.QSQuiz.selectPracticeMatch = function(id) {
    document.querySelectorAll('.arena-card').forEach(el => el.style.borderColor = 'transparent');
    const el = document.getElementById('arena-card-' + id);
    if (el) {
      el.style.borderColor = '#0ea5e9';
    }
    currentPendingQuizId = id;
    const nextBtn = document.getElementById('btn-practice-next');
    if (nextBtn) nextBtn.style.display = 'block';
  };

  const practiceNextBtn = document.getElementById('btn-practice-next');
  if (practiceNextBtn) {
    practiceNextBtn.addEventListener('click', () => {
      if (currentPendingQuizId) {
        window.QSQuiz.startPracticeMatch(currentPendingQuizId);
      }
    });
  }

  // startPracticeMatch is defined at the bottom of the file to handle both index.html and active-quiz.html flows

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
    const quizData = getQuizData(quizId);
    if (!quizData || !quizData.questions || quizData.questions.length === 0) { alert("Quiz not found or has no questions!"); return; }

    const n = quizData.questions.length;
    activeQuizState = {
      data: quizData,
      currentIndex: 0,
      userAnswers: new Array(n).fill(null),
      timeRemaining: quizData.questions.map(q => parseInt(q.timer) || 30),
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
      sessionStorage.removeItem('activeQuizId');
      window.location.href = 'active-quiz.html';
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
    if (q.type === 'mcq' || q.type === 'single' || q.type === 'scq' || q.type === 'multiple') {
      const selected = Array.from(document.querySelectorAll('.quiz-option-btn.selected')).map(btn => btn.dataset.value);
      if (selected.length > 0) {
        activeQuizState.userAnswers[idx] = (q.type === 'multiple') ? selected : selected[0];
      } else {
        activeQuizState.userAnswers[idx] = null;
      }
    } else if (q.type === 'integer') {
      const input = document.getElementById('active-int-input');
      if (input && input.value !== '') {
        activeQuizState.userAnswers[idx] = input.value;
      } else {
        activeQuizState.userAnswers[idx] = null;
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
      box.className = 'q-nav-box-horizontal';

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
    document.getElementById('active-question-text').textContent = `${idx + 1}. ${q.question || q.q || q.Question || 'Untitled Question'}`;

    renderQuestionNav();

    const optionsContainer = document.getElementById('active-options-container');
    optionsContainer.innerHTML = '';
    const savedAns = state.userAnswers[idx];

    if (q.type === 'mcq' || q.type === 'single' || q.type === 'scq' || q.type === 'multiple') {
      const opts = q.options || q.Options || [];
      opts.forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        const btn = document.createElement('button');
        
        let isSelected = false;
        if (Array.isArray(savedAns)) isSelected = savedAns.includes(opt);
        else isSelected = (savedAns === opt);
        
        btn.className = 'quiz-option-btn' + (isSelected ? ' selected' : '');
        btn.dataset.value = opt;
        btn.innerHTML = `<span class="option-label">${letter}</span> ${opt}`;

        if (isLocked) {
          btn.disabled = true;
          btn.classList.add('locked-option');
        } else {
          btn.onclick = () => {
            if (q.type === 'multiple') {
              btn.classList.toggle('selected');
            } else {
              document.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
              btn.classList.add('selected');
            }
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

    // Update Next button text if no other unlocked questions exist
    const nextBtn = document.getElementById('btn-quiz-next');
    if (nextBtn) {
      if (findNearestUnlocked() === -1) {
        nextBtn.textContent = 'Submit Quiz';
      } else {
        nextBtn.textContent = 'Next Question';
      }
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
      nextBtn.classList.add('btn-submit');
    } else {
      nextBtn.textContent = 'Next Question';
      nextBtn.classList.remove('btn-submit');
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
    let remainingCount = 0;
    state.data.questions.forEach((_, idx) => {
      if (!state.locked[idx] && state.timeRemaining[idx] > 0) {
        remainingCount++;
      }
    });

    grid.innerHTML = '';
    if (remainingCount === 0) {
      document.getElementById('review-message').textContent = 'All questions have been answered or their timers have expired.';
    } else {
      document.getElementById('review-message').textContent = `${remainingCount} question(s) still have time remaining:`;
    }
    
    // Show ALL questions in the grid, regardless of remaining time
    state.data.questions.forEach((_, idx) => {
      const box = document.createElement('div');
      box.className = 'q-nav-box review-box';
      
      // Styling for locked vs attempted
      if (state.locked[idx]) {
        box.style.background = '#e2e8f0';
        box.style.color = '#475569';
        box.style.opacity = '0.8';
      } else if (state.userAnswers[idx] !== null) {
        box.classList.add('attempted');
      }
      
      box.textContent = idx + 1;
      
      // Only show time label if not locked
      if (!state.locked[idx]) {
        const timeLabel = document.createElement('span');
        timeLabel.className = 'review-time-label';
        timeLabel.textContent = `${state.timeRemaining[idx]}s`;
        box.appendChild(timeLabel);
      }
      
      box.addEventListener('click', () => {
        if (!state.locked[idx]) {
          overlay.classList.remove('active');
          navigateToQuestion(idx);
        }
      });
      grid.appendChild(box);
    });

    overlay.classList.add('active');
  }

  // ── Final Submit — 20-Point Analysis Dashboard ──
  function finalSubmit() {
    try {
      pauseTimer();
    saveCurrentAnswer();
    const overlay = document.getElementById('submit-review-overlay');
    if (overlay) overlay.classList.remove('active');
    document.getElementById('active-quiz-container').style.display = 'none';

    const state = activeQuizState;
    const questions = state.data.questions;
    let correct = 0, wrong = 0, skipped = 0, timedOut = 0;
    let currentStreak = 0, maxStreak = 0;
    let correctTime = 0, wrongTime = 0;
    let firstHalfCorrect = 0, secondHalfCorrect = 0;
    
    const totalQ = questions.length;
    const halfMark = Math.ceil(totalQ / 2);

    const mockTopics = ['Core Concepts', 'Advanced Logic', 'Historical Context', 'Analytical Reasoning'];
    const topicData = {};
    mockTopics.forEach(t => topicData[t] = { correct: 0, total: 0, time: 0 });

    const analysisData = questions.map((q, idx) => {
      const userAns = state.userAnswers[idx];
      
      let isCorrect = false;
      if (userAns != null) {
        if (q.type === 'integer') {
          isCorrect = String(userAns) === String(q.answer || q.ans);
        } else {
          const correctVals = (q.correctAnswers || []).map(i => q.options[i]);
          if (q.ans && correctVals.length === 0) correctVals.push(q.ans); // fallback for mock
          if (Array.isArray(userAns)) {
            isCorrect = userAns.length === correctVals.length && userAns.every(v => correctVals.includes(v));
          } else {
            isCorrect = correctVals.includes(userAns);
          }
        }
      }
      const timeSpent = state.timeSpent[idx] || 0;
      
      const assignedTopic = mockTopics[idx % mockTopics.length];
      topicData[assignedTopic].total++;
      topicData[assignedTopic].time += timeSpent;

      if (isCorrect) {
        correct++;
        correctTime += timeSpent;
        topicData[assignedTopic].correct++;
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
        if (idx < halfMark) firstHalfCorrect++;
        else secondHalfCorrect++;
      } else {
        currentStreak = 0;
        if (userAns !== null) wrongTime += timeSpent;
      }

      let status;
      if (userAns === null && state.locked[idx]) { status = 'timeout'; timedOut++; }
      else if (userAns === null) { status = 'skipped'; skipped++; }
      else if (isCorrect) { status = 'correct'; }
      else { status = 'wrong'; wrong++; }

      const allocatedTime = q.timer || 30;
      const cAns = q.type === 'integer' ? (q.answer || q.ans || q.Answer) : ((q.correctAnswers||[]).length > 0 ? (q.correctAnswers||[]).map(i => (q.options||q.Options||[])[i]).join(', ') : q.ans);
      return { q: q.question || q.q || q.Question || 'Untitled Question', userAns, correctAns: cAns, timeSpent, allocatedTime, status, type: q.type, idx, topic: assignedTopic };
    });

    const totalTime = state.totalTimeTaken;

    // ── TELEMETRY LOGGING ──
    if (window.db && state.data && state.data.id) {
      const mode = (state.data.visibility === 'private' || state.data.accessCode) ? 'tournament' : 'practice';
      const attemptData = {
        quizId: state.data.id,
        quizName: state.data.name || 'Untitled Quiz',
        mode: mode,
        score: correct,
        totalQuestions: totalQ,
        timeTaken: totalTime,
        submittedAt: new Date().toISOString()
      };
      window.db.collection('quiz_attempts').add(attemptData).catch(e => console.error("Telemetry Error:", e));
    }

    const m = Math.floor(totalTime / 60).toString().padStart(2, '0');
    const s = (totalTime % 60).toString().padStart(2, '0');
    
    // Met 1: Accuracy & Met 2: Score
    const accuracy = Math.round((correct / totalQ) * 100);
    
    // Met 3 & 4: Percentile & Rank
    let percentile = 0;
    if (accuracy >= 90) percentile = 99 - Math.floor(Math.random() * 5);
    else if (accuracy >= 70) percentile = 80 + Math.floor(Math.random() * 10);
    else if (accuracy >= 50) percentile = 50 + Math.floor(Math.random() * 20);
    else percentile = 20 + Math.floor(Math.random() * 20);
    const rank = Math.max(1, Math.floor(5000 * (1 - (percentile/100))));

    // Met 5 & 6: Total Time & Avg Pacing
    const avgTime = totalQ > 0 ? (totalTime / totalQ).toFixed(1) : '0';

    // Met 7: Time Efficiency Index
    const avgCorrectTime = correct > 0 ? (correctTime / correct).toFixed(1) : '0';
    const avgWrongTime = wrong > 0 ? (wrongTime / wrong).toFixed(1) : '0';
    const efficiencyIndex = (avgWrongTime > 0) ? (avgCorrectTime / avgWrongTime).toFixed(2) : '1.0';

    // Met 8: Speed Rating
    const speedRating = avgTime < 15 ? 'Elite (Lightning Fast)' : avgTime < 25 ? 'Excellent (Swift)' : avgTime < 45 ? 'Good (Steady)' : 'Needs Improvement (Slow)';

    // Met 9 & 10: Fastest Answer & Time Wasted
    const correctAnswers = analysisData.filter(d => d.status === 'correct');
    const fastest = correctAnswers.length > 0 ? Math.min(...correctAnswers.map(d => d.timeSpent)) : 0;
    const slowest = correctAnswers.length > 0 ? Math.max(...correctAnswers.map(d => d.timeSpent)) : 0;
    const timeWasted = wrongTime;

    // Met 11 & 12: Stamina (First vs Second Half Accuracy)
    const firstHalfAcc = Math.round((firstHalfCorrect / halfMark) * 100);
    const secondHalfTotal = totalQ - halfMark;
    const secondHalfAcc = secondHalfTotal > 0 ? Math.round((secondHalfCorrect / secondHalfTotal) * 100) : 0;

    // Met 13: Max Streak (Already calculated as maxStreak)

    // Met 14: Decisiveness Index (Variance of time spent)
    const timeArr = analysisData.map(d => d.timeSpent);
    const meanTime = timeArr.reduce((a,b)=>a+b, 0) / timeArr.length;
    const variance = timeArr.reduce((a,b)=>a + Math.pow(b-meanTime, 2), 0) / timeArr.length;
    const decisiveness = (variance < 25) ? 'High (Consistent)' : (variance < 100) ? 'Moderate' : 'Low (Erratic)';

    // Met 15 & 16: Strongest and Weakest Topics
    let bestTopic = 'None', worstTopic = 'None';
    let maxAcc = -1, minAcc = 101;
    Object.keys(topicData).forEach(t => {
      if (topicData[t].total > 0) {
        const acc = (topicData[t].correct / topicData[t].total) * 100;
        if (acc > maxAcc) { maxAcc = acc; bestTopic = t; }
        if (acc < minAcc) { minAcc = acc; worstTopic = t; }
      }
    });

    // Met 17 & 18: Skip and Timeout Rates
    const skipRate = Math.round((skipped / totalQ) * 100);
    const timeoutRate = Math.round((timedOut / totalQ) * 100);

    // Topic HTML
    const topicHTML = Object.keys(topicData).filter(t => topicData[t].total > 0).map(t => {
      const data = topicData[t];
      const acc = Math.round((data.correct / data.total) * 100);
      return `
        <div class="topic-row">
          <div class="topic-header">
            <span class="topic-name">${t}</span>
            <span class="topic-acc">${acc}%</span>
          </div>
          <div class="time-bar-track">
            <div class="time-bar-spent" style="width:${acc}%; background: ${acc >= 75 ? '#22c55e' : acc >= 50 ? '#eab308' : '#ef4444'};"></div>
          </div>
        </div>
      `;
    }).join('');

    // Performance grade
    let grade, gradeColor;
    if (accuracy >= 95) { grade = 'A+'; gradeColor = '#22c55e'; }
    else if (accuracy >= 85) { grade = 'A'; gradeColor = '#22c55e'; }
    else if (accuracy >= 75) { grade = 'B+'; gradeColor = '#84cc16'; }
    else if (accuracy >= 65) { grade = 'B'; gradeColor = '#eab308'; }
    else if (accuracy >= 50) { grade = 'C'; gradeColor = '#f59e0b'; }
    else if (accuracy >= 35) { grade = 'D'; gradeColor = '#ef4444'; }
    else { grade = 'F'; gradeColor = '#dc2626'; }

    // SVG Donut
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

    // Met 19: Detailed Question Breakdown
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
            <span class="rq-topic-badge">${d.topic}</span>
          </div>
          <p class="rq-text">${d.q}</p>
          <div class="rq-answers">
            <div class="rq-ans"><span class="rq-label">Your answer:</span> <span class="rq-val rq-user-${d.status}">${userDisplay}</span></div>
            <div class="rq-ans"><span class="rq-label">Correct:</span> <span class="rq-val rq-correct">${d.correctAns}</span></div>
          </div>
        </div>`;
    }).join('');

    // Met 20: Strategic Recommendations
    const advice = [];
    if (avgTime < 15) advice.push("Your pacing is extremely fast. Ensure you aren't sacrificing accuracy for speed by double-checking edge cases.");
    if (efficiencyIndex < 40) advice.push("Your efficiency is low. You are spending too much time on questions you eventually get wrong. Learn to skip earlier.");
    if (skipRate > 20) advice.push("High skip rate detected. You may have gaps in your foundational knowledge—review the core topics you skipped.");
    if (secondHalfAcc < firstHalfAcc) advice.push("Your accuracy dropped in the second half. Focus on building mental stamina for longer sets.");
    if (worstTopic !== 'None') advice.push(`Your weakest area is ${worstTopic}. Dedicate your next study session entirely to this subject.`);
    if (advice.length === 0) advice.push("Excellent balanced performance! Continue your current practice regimen.");

    const adviceHTML = advice.map(a => `<li>${a}</li>`).join('');

    // ── ADVANCED COGNITIVE METRICS ──
    const clutchAnswers = analysisData.filter(d => (d.allocatedTime - d.timeSpent) <= 10 && d.status !== 'skipped');
    const clutchCorrect = clutchAnswers.filter(d => d.status === 'correct').length;
    const clutchAcc = clutchAnswers.length > 0 ? Math.round((clutchCorrect / clutchAnswers.length) * 100) : 0;

    const snapAnswers = analysisData.filter(d => d.timeSpent <= 5 && d.status !== 'skipped');
    const snapCorrect = snapAnswers.filter(d => d.status === 'correct').length;
    const snapAcc = snapAnswers.length > 0 ? Math.round((snapCorrect / snapAnswers.length) * 100) : 0;

    const riskAppetite = skipped === 0 ? (wrong > 0 ? 'High (Never Skips)' : 'Neutral') : (wrong / skipped > 2 ? 'High (Aggressive)' : 'Calculated');

    const advAvgCorrectTime = correct > 0 ? Math.round(correctTime / correct) : 0;
    const advAvgWrongTime = wrong > 0 ? Math.round(wrongTime / wrong) : 0;
    const cognitiveLoad = advAvgWrongTime > advAvgCorrectTime ? 'Deliberative' : 'Impulsive';

    const skippedTime = analysisData.filter(d => d.status === 'skipped').reduce((a,b)=>a+b.timeSpent, 0);
    const avgSkipTime = skipped > 0 ? Math.round(skippedTime / skipped) : 0;
    const persistence = avgSkipTime > 15 ? 'High (Tries hard)' : (skipped > 0 ? 'Low (Quick skip)' : 'N/A');

    const consistencyScore = Math.round((maxStreak / totalQ) * 100);
    const passStatus = accuracy >= 35 ? (accuracy >= 75 ? 'DISTINCTION' : 'PASS') : 'FAIL';

    const fastWrongs = analysisData.filter(d => d.status === 'wrong' && d.timeSpent < 10).length;
    const guessProb = wrong > 0 ? Math.round((fastWrongs / wrong) * 100) + '%' : '0%';
    const reviewUrgency = (wrong + skipped) > (totalQ / 2) ? 'CRITICAL' : ((wrong + skipped) > (totalQ / 4) ? 'MODERATE' : 'LOW');

    const firstTwoTime = analysisData.slice(0, 2).reduce((a,b)=>a+b.timeSpent, 0);
    const lastTwoTime = analysisData.slice(-2).reduce((a,b)=>a+b.timeSpent, 0);
    const enduranceDrop = lastTwoTime < (firstTwoTime / 2) ? 'Severe Fatigue' : 'Stable';

    const topicAccs = Object.values(topicData).filter(t => t.total > 0).map(t => t.correct/t.total);
    const topicVol = topicAccs.length > 1 ? (Math.max(...topicAccs) - Math.min(...topicAccs) > 0.5 ? 'High Variance' : 'Consistent') : 'N/A';

    // ── THE ULTIMATE NUCLEAR OPTION: DOCUMENT.WRITE ──
    const fullPageHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quiz Results</title>
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700;800&display=swap" rel="stylesheet">
        <style>
          body {
            margin: 0; padding: 40px 20px;
            background: #F8FAFC; color: #0F172A;
            font-family: 'Google Sans', sans-serif;
            min-height: 100vh; box-sizing: border-box;
          }
          .dashboard-container {
            max-width: 900px; margin: 0 auto;
            display: flex; flex-direction: column; gap: 24px;
          }
          .ad-header { text-align: center; margin-bottom: 24px; }
          .ad-title { font-size: 32px; font-weight: 800; color: #0ea5e9; margin: 0 0 8px 0; }
          .ad-subtitle { font-size: 16px; color: #64748B; margin: 0; }
          .ad-section {
            background: #FFFFFF; 
            border-radius: 16px; padding: 24px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          }
          .ad-section-title { font-size: 20px; font-weight: 700; margin: 0 0 20px 0; color: #1E293B; text-align: left; }
          .ad-top-row { display: flex; gap: 24px; flex-wrap: wrap; }
          .ad-grade-card { flex: 1; min-width: 250px; text-align: center; }
          .ad-grade-circle { width: 120px; height: 120px; border-radius: 50%; border: 8px solid; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; }
          .ad-grade-letter { font-size: 48px; font-weight: 800; }
          .ad-grade-label { font-weight: 700; font-size: 18px; margin: 0 0 4px 0; }
          .ad-accuracy { color: #64748B; margin: 0; }
          .ad-executive-stats { flex: 1; min-width: 250px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .exec-stat { background: #F8FAFC; padding: 20px 16px; border-radius: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
          .exec-val { display: block; font-size: 24px; font-weight: 800; color: #0ea5e9; margin-bottom: 4px; }
          .exec-lbl { font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; }
          .analytics-2col { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
          .ad-donut-card { flex: 1; text-align: center; min-width: 200px; }
          .ad-donut-svg { width: 160px; height: 160px; margin-bottom: 16px; }
          .donut-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
          .donut-legend-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
          .donut-dot { width: 12px; height: 12px; border-radius: 50%; }
          .ad-topic-card { flex: 2; min-width: 300px; }
          .topic-row { margin-bottom: 12px; }
          .topic-header { display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; margin-bottom: 6px; }
          .time-bar-track { width: 100%; height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden; }
          .time-bar-spent { height: 100%; border-radius: 4px; }
          .btn-primary { width: 100%; background: #0ea5e9; color: white; border: none; padding: 16px; font-size: 18px; font-weight: 700; border-radius: 12px; cursor: pointer; transition: background 0.2s; font-family: inherit; }
          .btn-primary:hover { background: #0284c7; }
          .header-brand { display: flex; align-items: center; gap: 12px; position: absolute; left: 24px; top: 24px; z-index: 1000; }
          .header-brand img { height: 40px; }
          .header-brand span { font-weight: 800; font-size: 20px; color: #0F172A; }
          @media (max-width: 768px) {
            .header-brand { left: 16px; top: 16px; }
            .header-brand img { height: 32px; }
            .header-brand span { font-size: 16px; }
            .ad-header { display: flex; flex-direction: column; align-items: center; margin-top: 40px; }
          }
        </style>
      </head>
      <body>
        <div class="header-brand">
          <img src=".png" alt="QS">
          <span>QS IITGN</span>
        </div>
        
        <div class="dashboard-container">
          <div class="ad-header">
            <h2 class="ad-title">${state.participantName ? state.participantName : 'Guest'}'s Report</h2>
            <p class="ad-subtitle">Generated on ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="ad-section">
            <h3 class="ad-section-title">Core Metrics</h3>
            <div class="ad-top-row">
              <div class="ad-grade-card">
                <div class="ad-grade-circle" style="border-color:${gradeColor};">
                  <span class="ad-grade-letter" style="color:${gradeColor};">${grade}</span>
                </div>
                <p class="ad-grade-label">Grade</p>
                <p class="ad-accuracy">${accuracy}% (Score: ${correct}/${totalQ})</p>
              </div>
              <div class="ad-executive-stats">
                <div class="exec-stat"><span class="exec-val">${passStatus}</span><span class="exec-lbl">Status</span></div>
                <div class="exec-stat"><span class="exec-val">${consistencyScore}%</span><span class="exec-lbl">Consistency Index</span></div>
                <div class="exec-stat"><span class="exec-val">${maxStreak}</span><span class="exec-lbl">Longest Streak</span></div>
                <div class="exec-stat"><span class="exec-val">${firstHalfAcc}% / ${secondHalfAcc}%</span><span class="exec-lbl">Stamina (1st/2nd Half)</span></div>
              </div>
            </div>
          </div>

          <div class="ad-section">
            <h3 class="ad-section-title">Time & Speed Analytics</h3>
            <div class="analytics-2col">
              <div class="exec-stat"><span class="exec-val">${m}:${s}</span><span class="exec-lbl">Total Time</span></div>
              <div class="exec-stat"><span class="exec-val">${avgTime}s</span><span class="exec-lbl">Avg Pacing</span></div>
              <div class="exec-stat"><span class="exec-val">${fastest}s</span><span class="exec-lbl">Fastest Correct</span></div>
              <div class="exec-stat"><span class="exec-val">${timeWasted}s</span><span class="exec-lbl">Time Wasted</span></div>
            </div>
          </div>

          <div class="ad-section">
            <h3 class="ad-section-title">Behavior & Categorical Analytics</h3>
            <div class="analytics-2col">
              <div class="exec-stat"><span class="exec-val">${decisiveness}</span><span class="exec-lbl">Decisiveness</span></div>
              <div class="exec-stat"><span class="exec-val">${guessProb}</span><span class="exec-lbl">Guess Work Probability</span></div>
              <div class="exec-stat"><span class="exec-val">${reviewUrgency}</span><span class="exec-lbl">Review Urgency</span></div>
              <div class="exec-stat"><span class="exec-val">${skipRate}%</span><span class="exec-lbl">Skip Rate</span></div>
              <div class="exec-stat"><span class="exec-val">${timeoutRate}%</span><span class="exec-lbl">Timeout Rate</span></div>
              <div class="exec-stat"><span class="exec-val">${correct} / ${wrong}</span><span class="exec-lbl">Hit / Miss Ratio</span></div>
              <div class="exec-stat"><span class="exec-val">${bestTopic}</span><span class="exec-lbl">Strongest Topic</span></div>
              <div class="exec-stat"><span class="exec-val">${worstTopic}</span><span class="exec-lbl">Weakest Topic</span></div>
            </div>
            
            <h4 style="margin-top: 24px; margin-bottom: 16px;">Topic Distribution & Accuracy</h4>
            <div class="ad-top-row">
              <div class="ad-donut-card">
                <svg viewBox="0 0 160 160" class="ad-donut-svg">
                  ${donutSVG}
                  <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="32" font-weight="800" fill="#0F172A">${accuracy}%</text>
                </svg>
                <div class="donut-legend">${donutLegend}</div>
              </div>
              <div class="ad-topic-card">
                ${topicHTML}
              </div>
            </div>
          </div>

          <div class="ad-section">
            <h3 class="ad-section-title">Advanced Cognitive Profiling</h3>
            <div class="analytics-2col">
              <div class="exec-stat"><span class="exec-val">${clutchAcc}%</span><span class="exec-lbl">Clutch Accuracy (< 10s left)</span></div>
              <div class="exec-stat"><span class="exec-val">${snapAcc}%</span><span class="exec-lbl">Snap Judgement (< 5s spent)</span></div>
              <div class="exec-stat"><span class="exec-val">${enduranceDrop}</span><span class="exec-lbl">Endurance Drop-off</span></div>
              <div class="exec-stat"><span class="exec-val">${topicVol}</span><span class="exec-lbl">Topic Volatility</span></div>
              <div class="exec-stat"><span class="exec-val">${riskAppetite}</span><span class="exec-lbl">Risk Appetite</span></div>
              <div class="exec-stat"><span class="exec-val">${cognitiveLoad}</span><span class="exec-lbl">Cognitive Load Profile</span></div>
              <div class="exec-stat"><span class="exec-val">${persistence}</span><span class="exec-lbl">Persistence Score</span></div>
              <div class="exec-stat"><span class="exec-val">${advAvgCorrectTime}s / ${advAvgWrongTime}s</span><span class="exec-lbl">Correct vs Wrong Pace</span></div>
            </div>
          </div>

          <div class="ad-section">
            <h3 class="ad-section-title">Strategic Recommendations</h3>
            <ul style="list-style-type: disc; margin-left: 24px; line-height: 1.8; color: #1E293B;">
              ${adviceHTML}
            </ul>
          </div>

          <div class="ad-section">
            <h3 class="ad-section-title">Comprehensive Deep-Dive</h3>
            <style>
              .result-question-card { background: #F8FAFC; border-radius: 24px; padding: 20px; margin-bottom: 16px; display: flex; flex-direction: column; align-items: flex-start; text-align: left; }
              .rq-header { display: flex; gap: 12px; align-items: center; justify-content: flex-start; margin-bottom: 12px; font-size: 14px; font-weight: 600; flex-wrap: wrap; width: 100%; }
              .rq-status { padding: 4px 10px; border-radius: 99px; font-size: 12px; }
              .status-badge-correct { background: #dcfce7; color: #166534; }
              .status-badge-wrong { background: #fee2e2; color: #991b1b; }
              .status-badge-timeout { background: #fef3c7; color: #92400e; }
              .status-badge-skipped { background: #f1f5f9; color: #475569; }
              .rq-topic-badge { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 99px; font-size: 12px; margin-left: auto; }
              .rq-text { font-size: 16px; margin: 0 0 16px 0; color: #1E293B; line-height: 1.5; font-weight: 500; text-align: left; }
              .rq-answers { display: flex; flex-direction: column; gap: 8px; width: 100%; align-items: flex-start; text-align: left; }
            </style>
            <div class="results-breakdown">${breakdownHTML}</div>
          </div>

          <div style="margin-top: 24px;">
            <button class="btn-primary" onclick="sessionStorage.removeItem('activeQuizId'); window.location.href='quiz.html';">Return to Quiz Arena Home</button>
          </div>
        </div>
      </body>
      </html>
    `;

    document.open();
    document.write(fullPageHTML);
    document.close();

    } catch (e) {
      document.body.innerHTML = `<div style="padding:40px;color:red;font-family:monospace;z-index:99999;position:relative;background:white;width:100vw;height:100vh;">
        <h1 style="font-size:32px;">CRITICAL JAVASCRIPT ERROR</h1>
        <p style="font-size:20px;font-weight:bold;">${e.message}</p>
        <pre style="background:#eee;padding:20px;overflow:auto;">${e.stack}</pre>
      </div>`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use
  window.QSQuiz = window.QSQuiz || {};
  Object.assign(window.QSQuiz, {
    QUESTIONS, 
    finalSubmit: finalSubmit,
    getRandomQuestion: () => QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)],
    startPracticeMatch: (quizId) => {
      if (document.body.classList.contains('quiz-dedicated-page')) {
        currentPendingQuizId = quizId;
        // Hide all steps manually
        ['portal-step-name', 'portal-step-mode', 'portal-step-practice', 'portal-step-tournament', 'portal-step-rules'].forEach(sid => {
          const el = document.getElementById(sid);
          if(el) el.style.display = 'none';
        });
        const stepRules = document.getElementById('portal-step-rules');
        if(stepRules) stepRules.style.display = 'block';
      } else {
        sessionStorage.setItem('activeQuizId', quizId);
        window.location.href = 'active-quiz.html';
      }
    }
  });
})();
