import os
import re

html_files = [
    'index.html', 'about.html', 'events.html', 
    'quiz.html', 'team.html', 'resources.html', 'join.html'
]

# 1. New Footer HTML
new_footer = '''  <footer class="footer" id="footer" role="contentinfo">
    <div class="container">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-logos">
            <img src=".png" alt="Quizzing Society Logo" height="48">
            <img src="iitgn_logo.png" alt="IIT Gandhinagar Logo" class="footer-iitgn-logo" height="44">
          </div>
          <p>The Quizzing Society of IIT Gandhinagar. Where curiosity meets competition, and every question is a doorway to a new world.</p>
        </div>

        <div class="footer-nav">
          <h5>Navigate</h5>
          <ul>
            <li><a href="index.html#about">About</a></li>
            <li><a href="events.html">Events</a></li>
            <li><a href="quiz.html">Daily Quiz</a></li>
            <li><a href="team.html">Team</a></li>
            <li><a href="resources.html">Resources</a></li>
          </ul>
        </div>
        
        <div class="footer-nav">
          <h5>Connect</h5>
          <ul>
            <li><a href="https://www.instagram.com/quizz_iitgn/" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:6px;">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon-instagram"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> Instagram</a></li>
            <li><a href="https://www.linkedin.com/company/quizzing-society-iit-gandhinagar/about/" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:6px;">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> LinkedIn</a></li>
            <li><a href="mailto:quiz.society@iitgn.ac.in" class="footer-email-link" style="display:flex;align-items:center;gap:6px;">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon-email"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> Email Us</a></li>
          </ul>
          
          <h5 style="margin-top: 1.5rem;">Join the Society</h5>
          <ul>
            <li><a href="join.html">Become a Member</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copyright">&copy; <span id="footer-year">2026</span> Quizzing Society, IIT Gandhinagar. All rights reserved.</p>
      </div>
    </div>
  </footer>'''

for file in html_files:
    if not os.path.exists(file): continue
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace footer
    content = re.sub(r'<footer class="footer".*?</footer>', new_footer, content, flags=re.DOTALL)
    
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

# 2. Fix the jumping hero logo in sections.css
sections_css_path = "css/sections.css"
with open(sections_css_path, "r", encoding="utf-8") as f:
    css = f.read()

css = css.replace("animation: float-slow 6s ease-in-out infinite;", "")

with open(sections_css_path, "w", encoding="utf-8") as f:
    f.write(css)

print("Visual fixes applied.")
