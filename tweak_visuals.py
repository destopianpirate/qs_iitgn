import os
import re

html_files = [
    'index.html', 'about.html', 'events.html', 
    'quiz.html', 'team.html', 'resources.html', 'join.html'
]

# 1. Remove section labels from all HTML files
for file in html_files:
    if not os.path.exists(file): continue
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # regex to match <p class="section-label">...</p>
    content = re.sub(r'<p class="section-label">.*?</p>', '', content, flags=re.DOTALL)
    
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

# 2. Remove About from mobile navbar
main_js_path = "js/main.js"
if os.path.exists(main_js_path):
    with open(main_js_path, "r", encoding="utf-8") as f:
        main_js = f.read()
    
    main_js = main_js.replace('<li><a href="#about">About</a></li>', '')
    
    with open(main_js_path, "w", encoding="utf-8") as f:
        f.write(main_js)

# 3. Increase section title font size and force Google Sans
base_css_path = "css/base.css"
if os.path.exists(base_css_path):
    with open(base_css_path, "r", encoding="utf-8") as f:
        base_css = f.read()
    
    # replace font-size: calc(...) with font-size: calc(var(--fs-xxl) * 4);
    # and font-family: 'Google Sans', var(--font-heading);
    base_css = re.sub(r'\.section-title\s*{[^}]+}', 
    '''.section-title {
  margin-bottom: var(--space-4);
  font-size: calc(var(--fs-xxl) * 4);
  font-family: 'Google Sans', sans-serif !important;
}''', base_css)
    
    with open(base_css_path, "w", encoding="utf-8") as f:
        f.write(base_css)

# 4. Fix footer grid
sections_css_path = "css/sections.css"
if os.path.exists(sections_css_path):
    with open(sections_css_path, "r", encoding="utf-8") as f:
        sections_css = f.read()
    
    sections_css = sections_css.replace('grid-template-columns: 2fr 1fr 1fr 1fr;', 'grid-template-columns: 1.5fr 1fr 1.5fr;')
    
    with open(sections_css_path, "w", encoding="utf-8") as f:
        f.write(sections_css)

print("Visual tweaks applied.")
