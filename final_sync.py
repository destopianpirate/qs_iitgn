import shutil
import re

# We will make home.html a perfect mirror of index.html
shutil.copy("index.html", "home.html")

# Fix title in home.html and index.html
for file in ["index.html", "home.html"]:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    content = re.sub(r'<title>.*?</title>', '<title>Home | Quizzing Society IITGN</title>', content)
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

print("Synchronized home.html with index.html")
