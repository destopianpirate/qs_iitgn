import os
import re

# 1. Update index.html to add loader
index_path = "index.html"
with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

loader_html = '''
  <!-- PAGE LOADER -->
  <div id="page-loader" class="page-loader">
    <div class="loader-content">
      <div class="loader-orbit">
        <div class="loader-ring"></div>
        <img src=".png" alt="Quizzing Society" class="loader-logo">
      </div>
      <div class="loader-text">
        <!-- Text removed as requested by user -->
      </div>
    </div>
  </div>
'''

if 'id="page-loader"' not in content:
    content = content.replace('<body class="subpage">', '<body class="subpage">\n' + loader_html)
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(content)

# 2. Update main.js for session storage logic
main_js_path = "js/main.js"
with open(main_js_path, "r", encoding="utf-8") as f:
    main_js = f.read()

loader_logic = '''
  function initPageLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    
    if (sessionStorage.getItem('loaderShown')) {
      loader.style.display = 'none';
    } else {
      setTimeout(() => {
        loader.classList.add('is-hidden');
        sessionStorage.setItem('loaderShown', 'true');
        setTimeout(() => { loader.style.display = 'none'; }, 800);
      }, 1500);
    }
  }
'''

if 'function initPageLoader' not in main_js:
    # Insert logic before DOMContentLoaded
    main_js = main_js.replace("function initMobileNav() {", loader_logic + "\n  function initMobileNav() {")
    main_js = main_js.replace("initMobileNav();", "initMobileNav();\n      initPageLoader();")
    with open(main_js_path, "w", encoding="utf-8") as f:
        f.write(main_js)

# 3. Update CSS to remove jumping/scaling
sections_css_path = "css/sections.css"
with open(sections_css_path, "r", encoding="utf-8") as f:
    css = f.read()

css = css.replace("transform: scale(0.97);", "")
css = css.replace("animation: loaderPulse 2s ease-in-out infinite;", "")
css = css.replace("animation: spin-slow 30s linear infinite;", "")
css = css.replace("animation: spin-slow 45s linear infinite reverse;", "")

with open(sections_css_path, "w", encoding="utf-8") as f:
    f.write(css)

print("Done")
