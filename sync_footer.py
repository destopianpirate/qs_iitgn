import re
import os

html_files = [
    'index.html', 'home.html', 'events.html', 
    'quiz.html', 'team.html', 'resources.html', 'join.html'
]

# Get the footer from home.html
with open('home.html', 'r', encoding='utf-8') as f:
    home_content = f.read()

footer_match = re.search(r'<footer class="footer".*?</footer>', home_content, flags=re.DOTALL)
if not footer_match:
    print("Error finding footer in home.html")
    exit(1)

footer_html = footer_match.group(0)

# Inject into all files
for file in html_files:
    if not os.path.exists(file): continue
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    content = re.sub(r'<footer class="footer".*?</footer>', footer_html, content, flags=re.DOTALL)
    
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

print("Footer synced across all pages.")
