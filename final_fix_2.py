import os
import re

html_files = [
    'index.html', 'home.html', 'events.html', 
    'quiz.html', 'team.html', 'resources.html', 'join.html'
]

# Rename about.html to home.html if it exists
if os.path.exists('about.html'):
    if os.path.exists('home.html'):
        os.remove('home.html')
    os.rename('about.html', 'home.html')
    print("Renamed about.html to home.html")

new_navbar = '''      <div class="pill-nav">
        <div class="pill-nav-items">
          <ul class="pill-list" role="menubar">
            <li role="none"><a href="home.html" class="pill" role="menuitem"><span class="hover-circle"></span><span class="label-stack"><span class="pill-label">Home</span><span class="pill-label-hover">Home</span></span></a></li>
            <li role="none"><a href="events.html" class="pill" role="menuitem"><span class="hover-circle"></span><span class="label-stack"><span class="pill-label">Events</span><span class="pill-label-hover">Events</span></span></a></li>
            <li role="none"><a href="quiz.html" class="pill" role="menuitem"><span class="hover-circle"></span><span class="label-stack"><span class="pill-label">Quiz</span><span class="pill-label-hover">Quiz</span></span></a></li>
            <li role="none"><a href="team.html" class="pill" role="menuitem"><span class="hover-circle"></span><span class="label-stack"><span class="pill-label">Team</span><span class="pill-label-hover">Team</span></span></a></li>
            <li role="none"><a href="resources.html" class="pill" role="menuitem"><span class="hover-circle"></span><span class="label-stack"><span class="pill-label">Resources</span><span class="pill-label-hover">Resources</span></span></a></li>
            <li role="none"><a href="join.html" class="pill" role="menuitem"><span class="hover-circle"></span><span class="label-stack"><span class="pill-label">Join</span><span class="pill-label-hover">Join</span></span></a></li>
          </ul>
        </div>
      </div>'''

for file in html_files:
    if not os.path.exists(file): continue
    
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    # Force replace the pill-nav
    content = re.sub(r'<div class="pill-nav">.*?</div>\s*</div>', new_navbar, content, flags=re.DOTALL)
    
    # Replace any stray about.html links
    content = content.replace('href="about.html"', 'href="home.html"')
    content = content.replace('href="index.html#about"', 'href="home.html"')
    
    # Also change the logo link to home.html
    content = content.replace('href="index.html" class="navbar-logo"', 'href="home.html" class="navbar-logo"')
    
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

# Make sure heading sizes are correct in base.css
base_css = "css/base.css"
if os.path.exists(base_css):
    with open(base_css, "r", encoding="utf-8") as f:
        css = f.read()
    css = re.sub(r'\.section-title\s*{[^}]+}', 
    '''.section-title {
  margin-bottom: var(--space-4);
  font-size: calc(var(--fs-xxl) * 4);
  font-family: 'Google Sans', sans-serif !important;
}''', css)
    with open(base_css, "w", encoding="utf-8") as f:
        f.write(css)

print("Applied strict navbar and home fixes.")
