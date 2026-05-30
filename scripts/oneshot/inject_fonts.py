"""
Injecte la balise Google Fonts dans toutes les pages HTML du frontend.
Charte typographique SIGFIC-PSLSH :
  · Bricolage Grotesque (display)
  · Public Sans (body)
  · IBM Plex Mono (numeric)
"""
import os, sys, re
sys.stdout.reconfigure(encoding='utf-8')

ROOT = 'frontend'
FONTS_LINK = '  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Public+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">\n'

# Marqueur de détection (pour éviter double injection)
MARKER = 'Bricolage+Grotesque'

# Pattern : juste avant la balise <link href="...main.css" ...>
INSERT_BEFORE = re.compile(r'(\s*<link href="[^"]*main\.css"[^>]*>)')

count_done = 0
count_already = 0
count_skipped = 0

for dirpath, _, files in os.walk(ROOT):
    for f in files:
        if not f.endswith('.html'):
            continue
        path = os.path.join(dirpath, f)
        try:
            with open(path, 'r', encoding='utf-8') as fp:
                content = fp.read()
        except Exception as e:
            print(f"SKIP {path} : {e}")
            count_skipped += 1
            continue
        if MARKER in content:
            count_already += 1
            continue
        if not INSERT_BEFORE.search(content):
            count_skipped += 1
            continue
        new_content = INSERT_BEFORE.sub(FONTS_LINK + r'\1', content, count=1)
        with open(path, 'w', encoding='utf-8') as fp:
            fp.write(new_content)
        rel = path.replace(ROOT, '').replace('\\','/').lstrip('/')
        print(f"OK   {rel}")
        count_done += 1

print()
print(f"═══════════════════════════════════════════════")
print(f"  Pages mises à jour : {count_done}")
print(f"  Déjà à jour        : {count_already}")
print(f"  Ignorées           : {count_skipped}")
print(f"═══════════════════════════════════════════════")
