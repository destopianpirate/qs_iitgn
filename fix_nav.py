import os

html_files = [
    'index.html', 'about.html', 'events.html', 
    'quiz.html', 'team.html', 'resources.html', 'join.html'
]

old_link = '<li role="none"><a href="about.html" class="pill" role="menuitem"><span class="hover-circle"></span><span class="label-stack"><span class="pill-label">About</span><span class="pill-label-hover">About</span></span></a></li>'
new_links = '''<li role="none"><a href="index.html" class="pill" role="menuitem"><span class="hover-circle"></span><span class="label-stack"><span class="pill-label">Home</span><span class="pill-label-hover">Home</span></span></a></li>
            <li role="none"><a href="about.html" class="pill" role="menuitem"><span class="hover-circle"></span><span class="label-stack"><span class="pill-label">About</span><span class="pill-label-hover">About</span></span></a></li>'''

for file in html_files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if old_link in content:
            content = content.replace(old_link, new_links)
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file}")
        else:
            print(f"Could not find old_link in {file}")
