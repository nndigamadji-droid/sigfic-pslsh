import re, sys
sys.stdout.reconfigure(encoding='utf-8')

PATH = 'frontend/src/js/roles.js'
with open(PATH, 'r', encoding='utf-8') as f:
    src = f.read()

EB_SUBS = """          { href: '/pages/dossiers/besoins.html?action=new',     icon: 'fa-plus-circle',   label: 'Saisir un nouveau besoin',         sub: true },
          { href: '/pages/dossiers/besoins.html?filter=mine',    icon: 'fa-user-clock',    label: 'Mes besoins en cours',             sub: true },
          { href: '/pages/dossiers/besoins.html?filter=pending', icon: 'fa-hourglass-half',label: 'Besoins en attente de validation', sub: true },"""

DOSSIERS_SUBS = """          { href: '/pages/dossiers/index.html',           icon: 'fa-list',            label: 'Tous les dossiers',         sub: true },
          { href: '/pages/dossiers/index.html?type=ACH-S', icon: 'fa-shopping-cart',   label: 'Achat simple',              sub: true },
          { href: '/pages/dossiers/index.html?type=ACH-P', icon: 'fa-gavel',           label: 'Achat par passation',       sub: true },
          { href: '/pages/dossiers/index.html?type=FOR-M', icon: 'fa-graduation-cap',  label: 'Formation & missions',      sub: true },
          { href: '/pages/dossiers/index.html?type=PER-A', icon: 'fa-hand-holding-usd',label: 'Personnel & assistance',    sub: true },"""

EB_BLOCK = f"""          {{ href: '/pages/dossiers/besoins.html', icon: 'fa-list-check',  label: 'Expression de besoins' }},
{EB_SUBS}
          {{ href: '/pages/dossiers/index.html',   icon: 'fa-folder-open', label: "Dossiers d'opération" }},
{DOSSIERS_SUBS}"""

RM_SECTION_TEMPLATE = """      {
        section: 'RESSOURCES & MOYENS',
        icon: 'fa-toolbox',
        items: [
          { href: '/pages/stock/index.html',     icon: 'fa-boxes',     label: 'Stock & immobilisations' },
          { href: '/pages/carburant/index.html', icon: 'fa-gas-pump',  label: 'Gestion des carburants' },
          { href: '/pages/rh/index.html',        icon: 'fa-users',     label: 'Ressources humaines' },
        ],
      },"""

OPS_BLOCK_RE = re.compile(
    r"(\s*\{\s*section:\s*'OPÉRATIONS',\s*icon:\s*'fa-cogs',\s*items:\s*\[)([\s\S]*?)(\],\s*\},)",
    re.MULTILINE,
)

count = 0
def replace_ops(match):
    global count
    count += 1
    new_items = '\n' + EB_BLOCK + '\n        '
    return match.group(1) + new_items + match.group(3) + '\n' + RM_SECTION_TEMPLATE

src = OPS_BLOCK_RE.sub(replace_ops, src)
print(f'  → {count} blocs OPÉRATIONS reconstruits + {count} sections RESSOURCES & MOYENS ajoutées')

DETECT_RE = re.compile(
    r"(if \(pathname\.indexOf\('/dossiers'\) !== -1 \|\|[\s\S]+?pathname\.indexOf\('/rh'\) +!== -1\)\s*return ')OPÉRATIONS('\);)"
)
new_detect = """if (pathname.indexOf('/dossiers')  !== -1 ||
        pathname.indexOf('/passation') !== -1 ||
        pathname.indexOf('/commandes') !== -1 ||
        pathname.indexOf('/reception') !== -1)
      return 'OPÉRATIONS';
    if (pathname.indexOf('/stock')     !== -1 ||
        pathname.indexOf('/carburant') !== -1 ||
        pathname.indexOf('/rh')        !== -1)
      return 'RESSOURCES & MOYENS';"""
old_detect = """if (pathname.indexOf('/dossiers')  !== -1 ||
        pathname.indexOf('/passation') !== -1 ||
        pathname.indexOf('/commandes') !== -1 ||
        pathname.indexOf('/reception') !== -1 ||
        pathname.indexOf('/stock')     !== -1 ||
        pathname.indexOf('/carburant') !== -1 ||
        pathname.indexOf('/rh')        !== -1)
      return 'OPÉRATIONS';"""

if old_detect in src:
    src = src.replace(old_detect, new_detect, 1)
    print('  → _detectActiveNavigator scindé : OPÉRATIONS / RESSOURCES & MOYENS')
else:
    print('  ATTENTION : bloc _detectActiveNavigator non trouvé textuellement')

with open(PATH, 'w', encoding='utf-8') as f:
    f.write(src)
print('OK')
