"""
Master build script — rewrites all HTML files with:
1. Rich 4-column footer (identical across all pages)
2. Completely rewritten join.html with premium form
3. Quiz admin panel added to quiz.html
4. Google Sans font import added to all pages
5. admin.css linked in quiz.html
"""
import os, re

# ── Shared Footer HTML ──
FOOTER = '''  <footer class="footer" id="footer" role="contentinfo">
    <div class="footer-glow" aria-hidden="true"></div>
    <div class="container">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-logos">
            <img src=".png" alt="Quizzing Society Logo" height="52">
            <img src="iitgn_logo.png" alt="IIT Gandhinagar Logo" class="footer-iitgn-logo" height="48">
          </div>
          <p class="footer-tagline">The Quizzing Society of IIT Gandhinagar. Where curiosity meets competition, and every question is a doorway to a new world.</p>
          <p class="footer-made">Made with <span style="color:#EF4444;">&#10084;</span> at IIT Gandhinagar</p>
        </div>

        <div class="footer-nav">
          <h5>Navigate</h5>
          <ul>
            <li><a href="index.html"><span class="footer-arrow">&#8594;</span> Home</a></li>
            <li><a href="events.html"><span class="footer-arrow">&#8594;</span> Events</a></li>
            <li><a href="quiz.html"><span class="footer-arrow">&#8594;</span> Daily Quiz</a></li>
            <li><a href="team.html"><span class="footer-arrow">&#8594;</span> Team</a></li>
            <li><a href="resources.html"><span class="footer-arrow">&#8594;</span> Resources</a></li>
          </ul>
        </div>

        <div class="footer-nav">
          <h5>Connect</h5>
          <ul>
            <li><a href="https://www.instagram.com/quizz_iitgn/" target="_blank" rel="noopener" class="footer-social-link">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> Instagram</a></li>
            <li><a href="https://www.linkedin.com/company/quizzing-society-iit-gandhinagar/about/" target="_blank" rel="noopener" class="footer-social-link">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> LinkedIn</a></li>
            <li><a href="mailto:quiz.society@iitgn.ac.in" class="footer-social-link">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> Email Us</a></li>
          </ul>
          <div class="footer-cta">
            <h5>Join the Society</h5>
            <a href="join.html" class="footer-cta-btn">Become a Member <span>&#8594;</span></a>
          </div>
        </div>

        <div class="footer-stats">
          <h5>By the Numbers</h5>
          <div class="footer-stat-item">
            <span class="footer-stat-number">20+</span>
            <span class="footer-stat-label">Active Members</span>
          </div>
          <div class="footer-stat-item">
            <span class="footer-stat-number">15+</span>
            <span class="footer-stat-label">Events / Year</span>
          </div>
          <div class="footer-stat-item">
            <span class="footer-stat-number">5000+</span>
            <span class="footer-stat-label">Questions Asked</span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="footer-copyright">&copy; <span>2026</span> Quizzing Society, IIT Gandhinagar. All rights reserved.</p>
        <button class="back-to-top" id="back-to-top" aria-label="Back to top">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polyline points="18 15 12 9 6 15"></polyline></svg>
        </button>
      </div>
    </div>
  </footer>'''

# ── Google Sans font link ──
GOOGLE_SANS_LINK = '<link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@300;400;500;600;700;800&family=Product+Sans:wght@400;500;700&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">'

# ── Shared navbar ──
NAVBAR = '''  <nav class="navbar" id="navbar" role="navigation" aria-label="Main navigation">
    <div class="navbar-inner">
      <a href="index.html" class="navbar-logo" aria-label="Quizzing Society Home">
        <img src=".png" alt="QS" width="32" height="32">
        <span>QS IITGN</span>
      </a>

      <div class="pill-nav">
        <div class="pill-nav-items">
          <ul class="pill-list" role="menubar">
            <li role="none"><a href="index.html" class="pill" role="menuitem"><span class="hover-circle"></span><span class="label-stack"><span class="pill-label">Home</span><span class="pill-label-hover">Home</span></span></a></li>
            <li role="none"><a href="events.html" class="pill" role="menuitem"><span class="hover-circle"></span><span class="label-stack"><span class="pill-label">Events</span><span class="pill-label-hover">Events</span></span></a></li>
            <li role="none"><a href="quiz.html" class="pill" role="menuitem"><span class="hover-circle"></span><span class="label-stack"><span class="pill-label">Quiz</span><span class="pill-label-hover">Quiz</span></span></a></li>
            <li role="none"><a href="team.html" class="pill" role="menuitem"><span class="hover-circle"></span><span class="label-stack"><span class="pill-label">Team</span><span class="pill-label-hover">Team</span></span></a></li>
            <li role="none"><a href="resources.html" class="pill" role="menuitem"><span class="hover-circle"></span><span class="label-stack"><span class="pill-label">Resources</span><span class="pill-label-hover">Resources</span></span></a></li>
            <li role="none"><a href="join.html" class="pill" role="menuitem"><span class="hover-circle"></span><span class="label-stack"><span class="pill-label">Join</span><span class="pill-label-hover">Join</span></span></a></li>
          </ul>
        </div>
      </div>

      <div class="navbar-actions">
        <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">
          <svg class="icon-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg class="icon-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Toggle menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>'''

# ── Process general pages (replace footer + navbar + font link) ──
def process_general(filename):
    if not os.path.exists(filename):
        return
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace font link
    content = re.sub(r'<link href="https://fonts\.googleapis\.com/css2\?family=Inter.*?" rel="stylesheet">', GOOGLE_SANS_LINK, content)
    
    # Replace navbar
    content = re.sub(r'<nav class="navbar".*?</nav>', NAVBAR, content, flags=re.DOTALL)
    
    # Replace footer
    content = re.sub(r'<footer class="footer".*?</footer>', FOOTER, content, flags=re.DOTALL)
    
    # Fix any remaining about.html or home.html refs in navbar (already handled above)
    content = content.replace('href="home.html"', 'href="index.html"')
    content = content.replace('href="about.html"', 'href="index.html"')
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"  Processed: {filename}")

# ── Rewrite join.html completely ──
def build_join():
    join_html = f'''<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join | Quizzing Society IITGN</title>
  <link rel="icon" type="image/png" href=".png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  {GOOGLE_SANS_LINK}
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/animations.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/sections.css">
</head>
<body class="subpage">

  <!-- NAVBAR -->
{NAVBAR}

  <main style="padding-top: var(--navbar-height);">
    <!-- JOIN HERO -->
    <section class="page-hero-banner">
      <div class="floating-shapes" aria-hidden="true">
        <div class="shape"></div>
        <div class="shape"></div>
        <div class="shape"></div>
      </div>
      <div class="container">
        <h1 class="section-title gradient-text" style="font-size:clamp(2rem,6vw,3.5rem) !important;">Join the Society</h1>
        <p class="section-subtitle">Become part of the most intellectually curious community at IIT Gandhinagar.</p>
      </div>
    </section>

    <!-- JOIN FORM SECTION -->
    <section class="section" id="join-form-section">
      <div class="container" style="max-width: 680px;">
        
        <div class="glass-card" style="padding: var(--space-10);" data-scroll="fade-up">
          <h2 style="font-size: var(--fs-2xl); text-align: center; margin-bottom: var(--space-2);">Recruitment Form</h2>
          <p style="text-align: center; margin: 0 auto var(--space-8) auto; font-size: var(--fs-sm);">Fill in your details below. We'll reach out to you soon!</p>
          
          <form id="join-form">
            <div class="form-group" style="margin-bottom: var(--space-4);">
              <label class="form-label" for="join-name">Full Name</label>
              <input type="text" class="form-field" id="join-name" name="name" placeholder="John Doe" required>
              <span class="form-error"></span>
            </div>

            <div class="form-group" style="margin-bottom: var(--space-4);">
              <label class="form-label" for="join-roll">Roll Number</label>
              <input type="text" class="form-field" id="join-roll" name="roll_no" placeholder="23110xxx" required>
              <span class="form-error"></span>
            </div>

            <div class="form-group" style="margin-bottom: var(--space-4);">
              <label class="form-label" for="join-email">College Email ID</label>
              <input type="email" class="form-field" id="join-email" name="email" placeholder="john.doe@iitgn.ac.in" required>
              <span class="form-error"></span>
            </div>

            <div class="form-group" style="margin-bottom: var(--space-4);">
              <label class="form-label" for="join-phone">Phone Number</label>
              <input type="tel" class="form-field" id="join-phone" name="phone" placeholder="9876543210" required>
              <span class="form-error"></span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4);">
              <div class="form-group">
                <label class="form-label" for="join-programme">Programme</label>
                <select class="form-field" id="join-programme" name="programme" required>
                  <option value="" disabled selected>Select...</option>
                  <option value="BTech">BTech</option>
                  <option value="MTech">MTech</option>
                  <option value="MSc">MSc</option>
                  <option value="BSc">BSc</option>
                  <option value="PhD">PhD</option>
                </select>
                <span class="form-error"></span>
              </div>
              <div class="form-group">
                <label class="form-label" for="join-year">Joining Year</label>
                <select class="form-field" id="join-year" name="joining_year" required>
                  <option value="" disabled selected>Select...</option>
                  <option value="2022">2022</option>
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
                <span class="form-error"></span>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: var(--space-6);">
              <label class="form-label" for="join-reason">Why do you want to join?</label>
              <textarea class="form-field" id="join-reason" name="reason" placeholder="Tell us about your quizzing interests..." rows="4" required style="resize: vertical;"></textarea>
              <span class="form-error"></span>
            </div>

            <button type="submit" class="btn btn-primary submit-btn" style="width: 100%; justify-content: center; padding: var(--space-4); font-size: var(--fs-lg); font-weight: 700; border-radius: var(--radius-lg);">
              Submit Application
            </button>
          </form>

          <!-- Success State -->
          <div id="form-success" style="display: none; text-align: center; padding: var(--space-10) 0;">
            <div style="font-size: 4rem; margin-bottom: var(--space-4);">&#10003;</div>
            <h3 style="color: var(--success); margin-bottom: var(--space-2);">Application Submitted!</h3>
            <p>We'll contact you soon. Welcome to the team!</p>
          </div>
        </div>

        <!-- Confetti container -->
        <div id="confetti-container" style="display:none;position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;"></div>

        <!-- Contact Channels -->
        <div style="margin-top: var(--space-12); text-align: center;" data-scroll="fade-up">
          <p class="section-subtitle" style="margin-bottom: var(--space-6);">You can also reach us directly:</p>
          <div class="join-channels">
            <a href="https://www.instagram.com/quizz_iitgn/" target="_blank" rel="noopener noreferrer" class="join-channel" aria-label="Follow us on Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              <div><span>Instagram</span><span class="join-channel-label">@quizz_iitgn</span></div>
            </a>
            <a href="https://www.linkedin.com/company/quizzing-society-iit-gandhinagar/about/" target="_blank" rel="noopener noreferrer" class="join-channel" aria-label="Connect on LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              <div><span>LinkedIn</span><span class="join-channel-label">Quizzing Society IITGN</span></div>
            </a>
            <a href="mailto:quiz.society@iitgn.ac.in" class="join-channel" aria-label="Email us">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <div><span>Email</span><span class="join-channel-label">quiz.society@iitgn.ac.in</span></div>
            </a>
          </div>
        </div>
      </div>
    </section>
  </main>

{FOOTER}

  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
  <script src="js/scroll.js"></script>
  <script src="js/join-form.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
'''
    with open('join.html', 'w', encoding='utf-8') as f:
        f.write(join_html)
    print("  Built: join.html")


# ── Add admin panel to quiz.html ──
def build_quiz_admin():
    if not os.path.exists('quiz.html'):
        return
    with open('quiz.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace font link
    content = re.sub(r'<link href="https://fonts\.googleapis\.com/css2\?family=Inter.*?" rel="stylesheet">', GOOGLE_SANS_LINK, content)
    
    # Add admin.css link
    if 'admin.css' not in content:
        content = content.replace('</head>', '  <link rel="stylesheet" href="css/admin.css">\n</head>')
    
    # Replace navbar
    content = re.sub(r'<nav class="navbar".*?</nav>', NAVBAR, content, flags=re.DOTALL)
    
    # Replace footer
    content = re.sub(r'<footer class="footer".*?</footer>', FOOTER, content, flags=re.DOTALL)
    
    # Fix links
    content = content.replace('href="home.html"', 'href="index.html"')
    content = content.replace('href="about.html"', 'href="index.html"')

    # Add admin section before footer
    admin_html = '''
    <!-- ADMIN SECTION -->
    <section class="section admin-section" id="admin-section">
      <div class="container">
        
        <!-- Admin Trigger -->
        <div class="admin-trigger" id="admin-trigger" data-scroll="fade-up">
          <h3>Admin Access</h3>
          <button class="admin-login-btn" id="admin-login-btn">
            <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Login as Admin
          </button>
        </div>

        <!-- Login Modal -->
        <div class="admin-modal-overlay" id="admin-modal-overlay">
          <div class="admin-modal glass-card">
            <h3>Admin Login</h3>
            <p class="modal-subtitle">Enter your credentials to manage quizzes</p>
            <form id="admin-login-form">
              <div class="form-group">
                <label class="form-label" for="admin-username">Username</label>
                <input type="text" class="form-field" id="admin-username" placeholder="admin" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="admin-password">Password</label>
                <input type="password" class="form-field" id="admin-password" placeholder="Enter password" required>
              </div>
              <p class="login-error" id="admin-login-error">Invalid credentials. Please try again.</p>
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" id="admin-modal-close">Cancel</button>
                <button type="submit" class="btn btn-primary">Login</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Admin Panel -->
        <div class="admin-panel" id="admin-panel">
          <div class="admin-header">
            <h3>Quiz Dashboard <span class="badge">Admin</span></h3>
            <button class="admin-logout-btn" id="admin-logout-btn">Logout</button>
          </div>

          <!-- Add Question Card -->
          <div class="admin-card">
            <h4>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              Add New Question
            </h4>

            <form id="add-question-form">
              <!-- Question Type -->
              <div class="type-selector">
                <button type="button" class="type-btn active" data-type="mcq">
                  <span class="type-icon">&#9744;</span>
                  Multiple Choice
                </button>
                <button type="button" class="type-btn" data-type="single">
                  <span class="type-icon">&#9673;</span>
                  Single Choice
                </button>
                <button type="button" class="type-btn" data-type="integer">
                  <span class="type-icon">#</span>
                  Integer
                </button>
              </div>

              <!-- Question Text -->
              <div class="form-group" style="margin-bottom: var(--space-4);">
                <label class="form-label" for="aq-question">Question</label>
                <textarea class="form-field" id="aq-question" rows="3" placeholder="Enter the question..." required></textarea>
              </div>

              <!-- Options (MCQ/Single) -->
              <div id="aq-options-container">
                <label class="form-label">Options (mark correct answers)</label>
                <div class="option-inputs">
                  <div class="option-row">
                    <span class="option-letter">A</span>
                    <input type="text" class="form-field option-text" placeholder="Option A">
                    <input type="checkbox" class="correct-marker" title="Mark as correct">
                  </div>
                  <div class="option-row">
                    <span class="option-letter">B</span>
                    <input type="text" class="form-field option-text" placeholder="Option B">
                    <input type="checkbox" class="correct-marker" title="Mark as correct">
                  </div>
                  <div class="option-row">
                    <span class="option-letter">C</span>
                    <input type="text" class="form-field option-text" placeholder="Option C">
                    <input type="checkbox" class="correct-marker" title="Mark as correct">
                  </div>
                  <div class="option-row">
                    <span class="option-letter">D</span>
                    <input type="text" class="form-field option-text" placeholder="Option D">
                    <input type="checkbox" class="correct-marker" title="Mark as correct">
                  </div>
                </div>
              </div>

              <!-- Integer Answer -->
              <div id="aq-integer-answer" style="display: none; margin-bottom: var(--space-4);">
                <label class="form-label" for="aq-int-value">Correct Integer Answer</label>
                <input type="number" class="form-field" id="aq-int-value" placeholder="Enter the correct integer">
              </div>

              <!-- Category + Difficulty + Timer -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4); margin-top: var(--space-4);">
                <div class="form-group">
                  <label class="form-label" for="aq-category">Category</label>
                  <select class="form-field" id="aq-category">
                    <option value="General">General</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Sports">Sports</option>
                    <option value="Literature">Literature</option>
                    <option value="Technology">Technology</option>
                    <option value="Arts">Arts</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Pop Culture">Pop Culture</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="aq-difficulty">Difficulty (1-5)</label>
                  <input type="number" class="form-field" id="aq-difficulty" min="1" max="5" value="3">
                </div>
              </div>

              <div class="timer-config">
                <label>Timer:</label>
                <input type="number" class="form-field" id="aq-timer-min" min="0" max="60" value="0" placeholder="Min">
                <span>min</span>
                <input type="number" class="form-field" id="aq-timer-sec" min="0" max="59" value="30" placeholder="Sec">
                <span>sec</span>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: var(--space-4);">Add Question</button>
            </form>
          </div>

          <!-- Existing Questions -->
          <div class="admin-card">
            <h4>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Existing Questions <span id="question-count" style="color:var(--primary); font-size: var(--fs-sm);">0</span>
            </h4>
            <div style="overflow-x: auto;">
              <table class="questions-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Question</th>
                    <th>Category</th>
                    <th>Timer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="questions-table-body">
                  <tr><td colspan="5" style="text-align:center;color:var(--text-tertiary);padding:var(--space-8);">No questions yet. Add one above!</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Quiz Mode Builder -->
          <div class="admin-card quiz-mode-builder">
            <h4>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Create Quiz Mode
            </h4>
            <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4);">
              <div class="form-group">
                <label class="form-label" for="qm-name">Quiz Name</label>
                <input type="text" class="form-field" id="qm-name" placeholder="e.g., Weekly Quiz #12">
              </div>
              <div class="form-group">
                <label class="form-label" for="qm-time">Total Time (minutes)</label>
                <input type="number" class="form-field" id="qm-time" min="1" value="15" placeholder="Minutes">
              </div>
            </div>
            <p style="font-size: var(--fs-sm); color: var(--text-secondary); margin-bottom: var(--space-4);">This will bundle all current questions into a timed quiz session.</p>
            <button type="button" class="btn btn-primary" id="create-quiz-btn" style="width: 100%; justify-content: center;">Create Quiz Mode</button>
          </div>
        </div>
      </div>
    </section>'''

    # Insert admin section before </main>
    content = content.replace('  </main>', admin_html + '\n  </main>')
    
    # Add Firebase + quiz-admin script
    if 'quiz-admin.js' not in content:
        content = content.replace('</body>', '''  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
  <script src="js/quiz-admin.js"></script>
</body>''')
    
    with open('quiz.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("  Built: quiz.html (with admin panel)")


# ── Main ──
print("Building QS IITGN website...")
print()

# Process general pages
print("[Phase 1-2] Processing pages + footer:")
for f in ['index.html', 'home.html', 'events.html', 'team.html', 'resources.html']:
    process_general(f)

# Build join page
print()
print("[Phase 3] Building join form page:")
build_join()

# Build quiz with admin
print()
print("[Phase 4] Building quiz + admin panel:")
build_quiz_admin()

print()
print("Done! All pages updated.")
