import os, re, sys
sys.stdout.reconfigure(encoding='utf-8')

ROOT = 'frontend'
PATTERN = re.compile(
    r'\s*<link rel="preconnect" href="https://fonts\.googleapis\.com">'
    r'\s*<link rel="preconnect" href="https://fonts\.gstatic\.com"[^>]*>'
    r'\s*<link href="https://fonts\.googleapis\.com/css2\?family=Bricolage\+Grotesque[^"]*" rel="stylesheet">'
)

done = 0
for dirpath, _, files in os.walk(ROOT):
    for f in files:
        if not f.endswith('.html'):
            continue
        p = os.path.join(dirpath, f)
        with open(p, 'r', encoding='utf-8') as fp:
            content = fp.read()
        if 'Bricolage+Grotesque' not in content:
            continue
        new = PATTERN.sub('', content)
        if new == content:
            continue
        with open(p, 'w', encoding='utf-8') as fp:
            fp.write(new)
        done += 1

print(f'Pages nettoyées : {done}')
