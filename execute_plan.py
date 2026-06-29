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
            <li><a href="https://www.instagram.com/quizz_iitgn/" target="_blank" rel="noopener">Instagram</a></li>
            <li><a href="https://www.linkedin.com/company/quizzing-society-iit-gandhinagar/about/" target="_blank" rel="noopener">LinkedIn</a></li>
            <li><a href="mailto:quiz.society@iitgn.ac.in" class="footer-email-link" style="display:flex;align-items:center;gap:6px;">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon-email"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>Email Us</a></li>
          </ul>
        </div>
        
        <div class="footer-nav">
          <h5>Join the Society</h5>
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

# 2. Extract about section
about_section = ""
with open("about.html", "r", encoding="utf-8") as f:
    content = f.read()
    match = re.search(r'(<!-- ABOUT SECTION -->.*?)</section>', content, re.DOTALL)
    if match:
        about_section = match.group(1) + "</section>"

for file in html_files:
    if not os.path.exists(file): continue
    
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Remove About Link
    about_link_pattern = r'\s*<li role="none"><a href="about\.html".*?<span class="pill-label">About</span>.*?</li>'
    content = re.sub(about_link_pattern, '', content, flags=re.DOTALL)
    
    # Replace footer
    content = re.sub(r'<footer class="footer".*?</footer>', new_footer, content, flags=re.DOTALL)
    
    # Remove loader
    loader_pattern = r'\s*<!-- PAGE LOADER -->.*?</div>\s*</div>\s*</div>'
    content = re.sub(loader_pattern, '', content, flags=re.DOTALL)
    
    # Ensure light theme
    content = re.sub(r'<html lang="en" data-theme=".*?">', '<html lang="en" data-theme="light">', content)
    
    # Index.html specific: Append About Section
    if file == 'index.html' and about_section and 'id="about"' not in content:
        # Append right before closing main
        content = content.replace('</main>', '\n' + about_section + '\n  </main>')
        
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Processed {file}")
