import os
import re

html_files = [
    'index.html', 'about.html', 'events.html', 
    'quiz.html', 'team.html', 'resources.html', 'join.html'
]

# 1. New Footer HTML with an extra column
new_footer = '''  <footer class="footer" id="footer" role="contentinfo">
    <div class="container">
      <div class="footer-inner" style="grid-template-columns: 2fr 1fr 1fr 1fr;">
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
            <li><a href="index.html#about">Home</a></li>
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
        </div>
        
        <div class="footer-nav">
          <h5>Join</h5>
          <ul>
            <li><a href="join.html">Become a Member</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Guidelines</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copyright">&copy; <span id="footer-year">2026</span> Quizzing Society, IIT Gandhinagar. All rights reserved.</p>
      </div>
    </div>
  </footer>'''

# Extract navbar from index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()
    match = re.search(r'(<header class="header".*?</header>)', content, re.DOTALL)
    navbar = match.group(1) if match else None

labels_to_remove = ["About Us", "The Arena", "Test Yourself", "The Library", "The Squad"]

for file in html_files:
    if not os.path.exists(file): continue
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 2. Replace Header
    if navbar:
        content = re.sub(r'<header class="header".*?</header>', navbar, content, flags=re.DOTALL)
    
    # 3. Replace Footer
    content = re.sub(r'<footer class="footer".*?</footer>', new_footer, content, flags=re.DOTALL)
    
    # 4. Remove section labels
    for label in labels_to_remove:
        # Match <p class="section-label">...label...</p>
        pattern = r'<p class="section-label"[^>]*>.*?'+label+r'.*?</p>'
        content = re.sub(pattern, '', content, flags=re.IGNORECASE | re.DOTALL)
        
        # Match standalone occurrences outside tags just in case
        pattern2 = r'<span class="section-label"[^>]*>.*?'+label+r'.*?</span>'
        content = re.sub(pattern2, '', content, flags=re.IGNORECASE | re.DOTALL)

    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

# 5. Update CSS for heading sizes and Google Sans
base_css_path = "css/base.css"
with open(base_css_path, "r", encoding="utf-8") as f:
    css = f.read()

# Replace .section-title { ... }
new_section_title = '''.section-title {
  margin-bottom: var(--space-4);
  font-size: calc(var(--fs-xxl) * 2);
  font-family: 'Google Sans', var(--font-heading);
}'''
css = re.sub(r'\.section-title\s*{[^}]*}', new_section_title, css)

with open(base_css_path, "w", encoding="utf-8") as f:
    f.write(css)

print("Updates applied.")
