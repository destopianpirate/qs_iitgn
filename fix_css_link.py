import os

html_files = [
    'index.html', 'about.html', 'events.html', 
    'quiz.html', 'team.html', 'resources.html', 'join.html'
]

old_link = 'href="css/components.css?v=1.1"'
new_link = 'href="css/components.css"'

for file in html_files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if old_link in content:
            content = content.replace(old_link, new_link)
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file}")
