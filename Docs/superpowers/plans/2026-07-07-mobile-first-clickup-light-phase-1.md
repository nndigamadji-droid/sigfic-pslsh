# Mobile-First ClickUp Light Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the phase 1 mobile-first shell: Hub personnel accueil, fixed mobile nav with central Creer button, role-aware creation panel, and cleaner global responsive behavior.

**Architecture:** Keep the current static frontend architecture and enhance the shared shell in `frontend/src/js/roles.js` and `frontend/src/css/main.css`. Reuse the existing role catalogs in `frontend/pages/accueil/index.html` so the Hub personnel stays role-aware without inventing a second permission source.

**Tech Stack:** Static HTML/CSS/JavaScript, Bootstrap already loaded on pages, Font Awesome icons, Jest static frontend tests under `backend/tests`.

---

## File Structure

- Modify `backend/tests/frontend-responsive.test.js`
  - Adds contract tests for A1 mobile nav, central Creer, Plus panel, and role-aware create actions.
- Modify `backend/tests/frontend-visual-comfort.test.js`
  - Adds contract tests for the Hub personnel accueil and reduced mobile visual fatigue.
- Modify `frontend/src/js/roles.js`
  - Replaces the current generated phone bottom nav with the five-entry A1 nav: Accueil, Dossiers, Creer, Notifications, Plus.
  - Adds role-aware create actions.
  - Adds create and plus panels with accessible open/close behavior.
  - Adds a desktop topbar Creer button.
- Modify `frontend/src/css/main.css`
  - Adds polished mobile bottom nav styles, central create button, slide-up panels, and global mobile safety.
- Modify `frontend/pages/accueil/index.html`
  - Turns the accueil into a Hub personnel while preserving the existing role catalogs as data.
  - Adds quick actions, priority queue, global search affordance, and secondary module access.

---

## Task 1: Add Phase 1 Frontend Contract Tests

**Files:**
- Modify: `backend/tests/frontend-responsive.test.js`
- Modify: `backend/tests/frontend-visual-comfort.test.js`

- [ ] **Step 1: Add failing responsive shell test**

In `backend/tests/frontend-responsive.test.js`, append this test inside `describe('Responsive frontend shell', () => { ... })`:

```js
  it('uses the A1 mobile bottom nav with central Creer and Plus panels', () => {
    const css = readProjectFile('frontend/src/css/main.css');
    const rolesJs = readProjectFile('frontend/src/js/roles.js');

    expect(rolesJs).toContain('initCreateActionPanel');
    expect(rolesJs).toContain('initMobileMorePanel');
    expect(rolesJs).toContain('data-sigfic-open-create');
    expect(rolesJs).toContain('data-sigfic-open-more');
    expect(rolesJs).toContain("label: 'Creer'");
    expect(rolesJs).toContain("label: 'Plus'");
    expect(rolesJs).toContain('sigfic-create-panel');
    expect(rolesJs).toContain('sigfic-more-panel');

    expect(css).toContain('.sigfic-mobile-nav-create');
    expect(css).toContain('.sigfic-shell-panel');
    expect(css).toContain('.sigfic-shell-panel.is-open');
    expect(css).toMatch(/\.sigfic-mobile-nav-create\s+\.sigfic-mobile-nav-icon\s*{[\s\S]*width:\s*48px/);
  });
```

- [ ] **Step 2: Add failing role-aware create action test**

In `backend/tests/frontend-responsive.test.js`, append this second test after the previous one:

```js
  it('defines role-aware creation actions for the central Creer button', () => {
    const rolesJs = readProjectFile('frontend/src/js/roles.js');

    expect(rolesJs).toContain('const _CREATE_ACTIONS');
    expect(rolesJs).toContain('/pages/dossiers/besoins.html?saisi=1');
    expect(rolesJs).toContain('/pages/dossiers/create.html');
    expect(rolesJs).toContain('/pages/paiement/index.html');
    expect(rolesJs).toContain('/pages/documents');
    expect(rolesJs).toContain('/pages/controle/index.html');
    expect(rolesJs).toContain('/pages/reporting/index.html');
    expect(rolesJs).toContain('function _getAllowedCreateActions');
  });
```

- [ ] **Step 3: Add failing Hub personnel visual comfort test**

In `backend/tests/frontend-visual-comfort.test.js`, append this test inside `describe('Frontend visual comfort and progressive disclosure', () => { ... })`:

```js
  it('turns the accueil page into a mobile-first personal hub', () => {
    const accueil = readProjectFile('frontend/pages/accueil/index.html');

    expect(accueil).toContain('class="mobile-hub"');
    expect(accueil).toContain('id="hubSearchInput"');
    expect(accueil).toContain('id="hubQuickActions"');
    expect(accueil).toContain('id="hubPriorityList"');
    expect(accueil).toContain('id="hubSecondaryModules"');
    expect(accueil).toContain('function renderPersonalHub');
    expect(accueil).toContain('File prioritaire');
    expect(accueil).toContain('Actions rapides');
  });
```

- [ ] **Step 4: Run tests and verify RED**

Run:

```bash
cd backend
npm.cmd test -- frontend-responsive.test.js frontend-visual-comfort.test.js
```

Expected:

```text
FAIL tests/frontend-responsive.test.js
FAIL tests/frontend-visual-comfort.test.js
```

The failures must mention missing strings such as `initCreateActionPanel`, `sigfic-create-panel`, or `mobile-hub`.

- [ ] **Step 5: Commit failing tests**

```bash
git add backend/tests/frontend-responsive.test.js backend/tests/frontend-visual-comfort.test.js
git commit -m "test: define mobile first shell contract"
```

---

## Task 2: Implement A1 Mobile Nav and Role-Aware Panels

**Files:**
- Modify: `frontend/src/js/roles.js`

- [ ] **Step 1: Add `_CREATE_ACTIONS` after `_NAV_ITEMS`**

In `frontend/src/js/roles.js`, immediately after the `_NAV_ITEMS` array, add:

```js
  const _CREATE_ACTIONS = [
    {
      label: 'Expression de besoin',
      description: 'Saisir une nouvelle EB pour validation',
      icon: 'fa-file-signature',
      href: '/pages/dossiers/besoins.html?saisi=1',
      roles: ['administrateur', 'coordination', 'chef_service', 'agent', 'comptable_principal'],
    },
    {
      label: "Dossier d'operation",
      description: 'Ouvrir un dossier de depense',
      icon: 'fa-folder-plus',
      href: '/pages/dossiers/create.html',
      roles: ['administrateur', 'coordination', 'chef_service'],
    },
    {
      label: 'Paiement',
      description: 'Preparer une liquidation ou un paiement',
      icon: 'fa-money-check-alt',
      href: '/pages/paiement/index.html',
      roles: ['administrateur', 'coordination', 'chef_service', 'comptable_principal'],
    },
    {
      label: 'Document',
      description: 'Classer une piece justificative',
      icon: 'fa-file-upload',
      href: '/pages/documents/index.html',
      roles: ['administrateur', 'coordination', 'chef_service', 'agent', 'controleur', 'comptable_principal'],
    },
    {
      label: 'Controle',
      description: 'Enregistrer un controle ou une anomalie',
      icon: 'fa-shield-alt',
      href: '/pages/controle/index.html',
      roles: ['administrateur', 'coordination', 'controleur'],
    },
    {
      label: 'Rapport',
      description: 'Generer ou consulter un etat',
      icon: 'fa-chart-pie',
      href: '/pages/reporting/index.html',
      roles: ['administrateur', 'coordination', 'chef_service', 'comite_pilotage', 'controleur', 'comptable_principal'],
    },
  ];
```

- [ ] **Step 2: Add helper functions after `_CREATE_ACTIONS`**

Add:

```js
  function _getAllowedCreateActions(role) {
    return _CREATE_ACTIONS.filter(function (action) {
      return action.roles.indexOf(role) !== -1;
    });
  }

  function _closeShellPanels() {
    document.querySelectorAll('.sigfic-shell-panel.is-open').forEach(function (panel) {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
    });
    document.body.classList.remove('sigfic-shell-panel-open');
  }

  function _openShellPanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    _closeShellPanels();
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sigfic-shell-panel-open');
    const firstLink = panel.querySelector('a, button');
    if (firstLink) firstLink.focus({ preventScroll: true });
  }
```

- [ ] **Step 3: Replace `initMobileBottomNav` implementation**

Replace the body of `function initMobileBottomNav() { ... }` with this implementation:

```js
  function initMobileBottomNav() {
    const pathname = window.location.pathname;
    if (pathname.indexOf('/auth') !== -1) return;
    if (document.querySelector('.sigfic-mobile-bottom-nav')) return;

    const activeSection = _detectActiveNavigator(pathname);
    const items = [
      { label: 'Accueil', icon: 'fa-home', href: '/pages/accueil/index.html', active: pathname.indexOf('/accueil') !== -1 },
      { label: 'Dossiers', icon: 'fa-folder-open', href: '/pages/dossiers/index.html', active: pathname.indexOf('/dossiers') !== -1 },
      { label: 'Creer', icon: 'fa-plus', action: 'create', active: false },
      { label: 'Notifications', icon: 'fa-bell', href: '/pages/notifications/index.html', active: pathname.indexOf('/notifications') !== -1 },
      { label: 'Plus', icon: 'fa-ellipsis-h', action: 'more', active: !!activeSection && pathname.indexOf('/accueil') === -1 && pathname.indexOf('/dossiers') === -1 && pathname.indexOf('/notifications') === -1 },
    ];

    const nav = document.createElement('nav');
    nav.className = 'sigfic-mobile-bottom-nav sigfic-mobile-bottom-nav-a1';
    nav.setAttribute('aria-label', 'Navigation mobile');
    nav.innerHTML = items
      .map(function (item) {
        const activeClass = item.active ? ' active' : '';
        const createClass = item.action === 'create' ? ' sigfic-mobile-nav-create' : '';
        const actionAttr = item.action === 'create'
          ? ' type="button" data-sigfic-open-create'
          : item.action === 'more'
            ? ' type="button" data-sigfic-open-more'
            : '';
        const content =
          `<span class="sigfic-mobile-nav-icon"><i class="fas ${item.icon}"></i></span>` +
          `<span>${item.label}</span>`;
        if (item.action) {
          return `<button class="sigfic-mobile-nav-item${activeClass}${createClass}"${actionAttr} aria-label="${item.label}">${content}</button>`;
        }
        return `<a href="${item.href}" class="sigfic-mobile-nav-item${activeClass}" aria-label="${item.label}">${content}</a>`;
      })
      .join('');

    document.body.appendChild(nav);
  }
```

- [ ] **Step 4: Add `initCreateActionPanel` after `initMobileBottomNav`**

Add:

```js
  function initCreateActionPanel() {
    const pathname = window.location.pathname;
    if (pathname.indexOf('/auth') !== -1) return;
    if (document.getElementById('sigfic-create-panel')) return;

    const role = getRole();
    const actions = _getAllowedCreateActions(role);
    const panel = document.createElement('section');
    panel.id = 'sigfic-create-panel';
    panel.className = 'sigfic-shell-panel sigfic-create-panel';
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('aria-label', 'Creer une action');
    panel.innerHTML =
      '<div class="sigfic-shell-panel-handle"></div>' +
      '<div class="sigfic-shell-panel-head">' +
      '<div><strong>Creer</strong><span>Actions rapides selon votre role</span></div>' +
      '<button type="button" class="sigfic-shell-panel-close" data-sigfic-close-panel aria-label="Fermer"><i class="fas fa-times"></i></button>' +
      '</div>' +
      '<div class="sigfic-create-grid">' +
      actions.map(function (action) {
        return (
          `<a class="sigfic-create-action" href="${action.href}">` +
          `<span><i class="fas ${action.icon}"></i></span>` +
          `<strong>${action.label}</strong>` +
          `<small>${action.description}</small>` +
          `</a>`
        );
      }).join('') +
      '</div>';

    document.body.appendChild(panel);
  }
```

- [ ] **Step 5: Add `initMobileMorePanel` after `initCreateActionPanel`**

Add:

```js
  function initMobileMorePanel() {
    const pathname = window.location.pathname;
    if (pathname.indexOf('/auth') !== -1) return;
    if (document.getElementById('sigfic-more-panel')) return;

    const role = getRole();
    const allowed = _NAV_ITEMS.filter(function (n) {
      return n.roles.indexOf(role) !== -1;
    });
    const panel = document.createElement('section');
    panel.id = 'sigfic-more-panel';
    panel.className = 'sigfic-shell-panel sigfic-more-panel';
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('aria-label', 'Plus de modules');
    panel.innerHTML =
      '<div class="sigfic-shell-panel-handle"></div>' +
      '<div class="sigfic-shell-panel-head">' +
      '<div><strong>Plus</strong><span>Modules et session</span></div>' +
      '<button type="button" class="sigfic-shell-panel-close" data-sigfic-close-panel aria-label="Fermer"><i class="fas fa-times"></i></button>' +
      '</div>' +
      '<div class="sigfic-more-list">' +
      allowed.map(function (item) {
        return (
          `<a class="sigfic-more-item" href="${item.href}">` +
          `<i class="fas ${item.icon}"></i>` +
          `<span>${item.label}</span>` +
          `</a>`
        );
      }).join('') +
      '<button type="button" class="sigfic-more-item sigfic-more-logout" data-sigfic-logout><i class="fas fa-sign-out-alt"></i><span>Deconnexion</span></button>' +
      '</div>';

    document.body.appendChild(panel);
  }
```

- [ ] **Step 6: Add shared panel event binding after `initMobileMorePanel`**

Add:

```js
  function initShellPanelEvents() {
    if (document.body.dataset.sigficPanelEvents === 'bound') return;
    document.body.dataset.sigficPanelEvents = 'bound';

    document.addEventListener('click', function (event) {
      const createBtn = event.target.closest('[data-sigfic-open-create]');
      if (createBtn) {
        event.preventDefault();
        _openShellPanel('sigfic-create-panel');
        return;
      }

      const moreBtn = event.target.closest('[data-sigfic-open-more]');
      if (moreBtn) {
        event.preventDefault();
        _openShellPanel('sigfic-more-panel');
        return;
      }

      if (event.target.closest('[data-sigfic-close-panel]')) {
        event.preventDefault();
        _closeShellPanels();
        return;
      }

      if (event.target.closest('[data-sigfic-logout]')) {
        event.preventDefault();
        _secureLogout();
        return;
      }

      if (document.body.classList.contains('sigfic-shell-panel-open') && !event.target.closest('.sigfic-shell-panel') && !event.target.closest('.sigfic-mobile-bottom-nav')) {
        _closeShellPanels();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') _closeShellPanels();
    });
  }
```

- [ ] **Step 7: Add desktop Creer button to `_injectPortalButton`**

Inside `_injectPortalButton()`, immediately after `right.insertBefore(wrap, right.firstChild);`, add:

```js
    if (!document.getElementById('btn-shell-create')) {
      const createButton = document.createElement('button');
      createButton.id = 'btn-shell-create';
      createButton.type = 'button';
      createButton.className = 'portal-btn shell-create-btn';
      createButton.setAttribute('data-sigfic-open-create', '');
      createButton.innerHTML = '<i class="fas fa-plus"></i><span>Creer</span>';
      right.insertBefore(createButton, wrap);
    }
```

- [ ] **Step 8: Update `init()`**

In `function init()`, after `initMobileBottomNav();`, add:

```js
    initCreateActionPanel();
    initMobileMorePanel();
    initShellPanelEvents();
```

- [ ] **Step 9: Update public API**

In `window.SIGFIC = { ... }`, after `initMobileBottomNav,`, add:

```js
    initCreateActionPanel,
    initMobileMorePanel,
```

- [ ] **Step 10: Run focused tests**

Run:

```bash
cd backend
npm.cmd test -- frontend-responsive.test.js
```

Expected:

```text
PASS tests/frontend-responsive.test.js
```

The Hub personnel test still fails until Task 4.

- [ ] **Step 11: Commit roles.js shell behavior**

```bash
git add frontend/src/js/roles.js backend/tests/frontend-responsive.test.js
git commit -m "feat: add mobile create shell navigation"
```

---

## Task 3: Style A1 Mobile Nav and Shell Panels

**Files:**
- Modify: `frontend/src/css/main.css`

- [ ] **Step 1: Add base shell panel CSS before `@media (max-width: 991.98px)` in the responsive shell section**

Insert this block after `.sigfic-sidebar-backdrop { display: none; }`:

```css
.sigfic-shell-panel {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1095;
  max-height: min(78vh, 620px);
  padding: 10px 16px calc(18px + env(safe-area-inset-bottom));
  background: var(--c-white);
  border-top: 1px solid var(--c-border);
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -18px 44px rgb(15 23 42 / .22);
  transform: translateY(110%);
  transition: transform .22s ease;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.sigfic-shell-panel.is-open {
  transform: translateY(0);
}

body.sigfic-shell-panel-open::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 1094;
  background: rgb(15 23 42 / .42);
}

.sigfic-shell-panel-handle {
  width: 44px;
  height: 4px;
  margin: 0 auto 12px;
  border-radius: 999px;
  background: #cbd5e1;
}

.sigfic-shell-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.sigfic-shell-panel-head strong {
  display: block;
  color: var(--c-primary);
  font-size: 1rem;
  line-height: 1.2;
}

.sigfic-shell-panel-head span {
  display: block;
  margin-top: 2px;
  color: var(--c-muted);
  font-size: .76rem;
}

.sigfic-shell-panel-close {
  width: 40px;
  height: 40px;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  background: #f8fafc;
  color: var(--c-slate);
}

.sigfic-create-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.sigfic-create-action {
  min-height: 112px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 14px;
  border: 1px solid var(--c-border);
  border-radius: 14px;
  background: #f8fafc;
  color: var(--c-slate);
  text-decoration: none;
}

.sigfic-create-action span {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--c-primary-pale);
  color: var(--c-primary);
}

.sigfic-create-action strong {
  color: var(--c-primary);
  font-size: .85rem;
  line-height: 1.2;
}

.sigfic-create-action small {
  color: var(--c-muted);
  font-size: .72rem;
  line-height: 1.35;
}

.sigfic-more-list {
  display: grid;
  gap: 8px;
}

.sigfic-more-item {
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  background: #f8fafc;
  color: var(--c-slate);
  font-weight: 700;
  text-decoration: none;
}

.sigfic-more-item i {
  width: 20px;
  color: var(--c-primary);
  text-align: center;
}

.sigfic-more-logout {
  color: var(--c-danger);
}

.sigfic-more-logout i {
  color: var(--c-danger);
}
```

- [ ] **Step 2: Replace phone bottom nav styles inside `@media (max-width: 640px)`**

Replace the `.sigfic-mobile-bottom-nav` block and its child blocks with:

```css
  .sigfic-mobile-bottom-nav {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1085;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0;
    min-height: calc(68px + env(safe-area-inset-bottom));
    padding: 7px max(10px, env(safe-area-inset-left)) calc(8px + env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-right));
    background: rgb(255 255 255 / .96);
    border-top: 1px solid var(--c-border);
    box-shadow: 0 -12px 28px rgb(15 23 42 / .14);
    backdrop-filter: blur(14px);
  }

  .sigfic-mobile-nav-item {
    min-width: 0;
    min-height: 52px;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 4px;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: var(--c-muted);
    text-decoration: none;
    touch-action: manipulation;
  }

  .sigfic-mobile-nav-item.active {
    color: var(--c-primary);
    background: var(--c-primary-pale);
  }

  .sigfic-mobile-nav-icon {
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: #eef3f8;
    font-size: .9rem;
    line-height: 1;
  }

  .sigfic-mobile-nav-item.active .sigfic-mobile-nav-icon {
    background: #dbeafe;
  }

  .sigfic-mobile-nav-item span:last-child {
    width: 100%;
    overflow: hidden;
    font-size: .66rem;
    font-weight: 800;
    line-height: 1.1;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sigfic-mobile-nav-create {
    transform: translateY(-12px);
    color: var(--c-primary);
  }

  .sigfic-mobile-nav-create .sigfic-mobile-nav-icon {
    width: 48px;
    height: 48px;
    border-radius: 18px;
    background: linear-gradient(135deg, var(--c-primary), #0f2044);
    color: #fff;
    box-shadow: 0 12px 24px rgb(27 58 107 / .26);
    font-size: 1.05rem;
  }
```

- [ ] **Step 3: Add desktop create button CSS near `.portal-btn` styles**

After `.portal-btn.portal-btn-open .portal-btn-chevron { transform: rotate(180deg); }`, add:

```css
.shell-create-btn {
  margin-right: 8px;
  background: #fff;
  color: var(--c-primary);
  border-color: rgb(255 255 255 / .75);
}

.shell-create-btn:hover {
  background: var(--c-primary-pale);
  color: var(--c-primary);
}
```

- [ ] **Step 4: Run focused tests**

Run:

```bash
cd backend
npm.cmd test -- frontend-responsive.test.js
```

Expected:

```text
PASS tests/frontend-responsive.test.js
```

- [ ] **Step 5: Commit styles**

```bash
git add frontend/src/css/main.css
git commit -m "style: polish mobile shell navigation"
```

---

## Task 4: Convert Accueil Into Hub Personnel

**Files:**
- Modify: `frontend/pages/accueil/index.html`

- [ ] **Step 1: Make the page scroll naturally on mobile**

In the `<style>` section of `frontend/pages/accueil/index.html`, change `.app` from fixed height to minimum height by replacing:

```css
      height: 100vh;
      overflow: hidden;
```

with:

```css
      min-height: 100vh;
      overflow: hidden;
```

Then replace:

```css
    .main {
      grid-area: main;
      min-width: 0;
      display: grid;
      grid-template-rows: 1fr auto;
      overflow: hidden;
    }
```

with:

```css
    .main {
      grid-area: main;
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: visible;
    }
```

- [ ] **Step 2: Add Hub personnel CSS before `.content` styles**

Insert before the `.content {` rule:

```css
    .mobile-hub {
      display: grid;
      gap: 14px;
      margin-bottom: 18px;
    }
    .hub-hero {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 18px;
      box-shadow: 0 8px 22px rgba(15,23,42,.06);
    }
    .hub-kicker {
      font-size: .62rem;
      color: #94a3b8;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .hub-title {
      margin: 6px 0 4px;
      color: #132747;
      font-size: clamp(1.2rem, 4.5vw, 1.65rem);
      line-height: 1.12;
      font-weight: 900;
    }
    .hub-sub {
      margin: 0;
      color: #64748b;
      font-size: .82rem;
      line-height: 1.45;
    }
    .hub-search {
      margin-top: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 46px;
      padding: 0 14px;
      border-radius: 14px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #64748b;
    }
    .hub-search input {
      flex: 1;
      min-width: 0;
      border: 0;
      outline: 0;
      background: transparent;
      color: #132747;
      font: inherit;
    }
    .hub-section-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin: 2px 0 8px;
      font-size: .68rem;
      color: #94a3b8;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .hub-quick-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }
    .hub-quick {
      min-height: 86px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      background: #fff;
      color: #132747;
      text-decoration: none;
      box-shadow: 0 4px 14px rgba(15,23,42,.04);
    }
    .hub-quick i {
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: var(--card-light, #e8f0fb);
      color: var(--card-color, #1b3a6b);
    }
    .hub-quick strong {
      font-size: .78rem;
      line-height: 1.15;
    }
    .hub-priority-list {
      display: grid;
      gap: 9px;
    }
    .hub-priority {
      display: grid;
      grid-template-columns: 34px minmax(0, 1fr) auto;
      gap: 10px;
      align-items: center;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      background: #fff;
      color: #132747;
      text-decoration: none;
    }
    .hub-priority i {
      width: 34px;
      height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: var(--card-light, #e8f0fb);
      color: var(--card-color, #1b3a6b);
    }
    .hub-priority strong {
      display: block;
      overflow-wrap: anywhere;
      font-size: .84rem;
      line-height: 1.2;
    }
    .hub-priority small {
      display: block;
      margin-top: 3px;
      color: #64748b;
      font-size: .72rem;
      line-height: 1.35;
    }
    .hub-chip {
      border-radius: 999px;
      padding: 5px 8px;
      background: #f1f5f9;
      color: #64748b;
      font-size: .64rem;
      font-weight: 800;
      white-space: nowrap;
    }
    .hub-secondary {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .hub-secondary a {
      min-height: 54px;
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 10px;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      background: #fff;
      color: #132747;
      text-decoration: none;
      font-size: .75rem;
      font-weight: 800;
    }
    .hub-secondary i {
      color: var(--btn-color, #1b3a6b);
    }
```

- [ ] **Step 3: Add mobile CSS overrides inside `@media (max-width: 768px)`**

Inside the existing `@media (max-width: 768px)` block, append:

```css
      .header {
        min-height: 112px;
        padding: 12px 16px;
        grid-template-columns: 1fr;
        row-gap: 10px;
      }
      .h-title {
        display: none;
      }
      .h-user {
        justify-self: stretch;
        justify-content: flex-start;
      }
      .main {
        padding-bottom: calc(82px + env(safe-area-inset-bottom));
      }
      .content {
        padding: 16px;
        overflow: visible;
      }
      .content > h2,
      .content > .lead-p {
        display: none;
      }
      .hub-quick-grid,
      .hub-secondary {
        grid-template-columns: 1fr;
      }
      .skills-grid {
        display: none;
      }
      .nav-bar {
        padding: 12px 16px 18px;
      }
      .nav-bar-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
```

- [ ] **Step 4: Add Hub HTML before the existing `<h2>` inside `.content`**

In the `.content` div, immediately before:

```html
      <h2><i class="fas fa-th-large"></i><span id="skillsTitle">Votre espace de travail</span></h2>
```

insert:

```html
      <section class="mobile-hub" aria-labelledby="hubTitle">
        <div class="hub-hero">
          <div class="hub-kicker">Aujourd'hui</div>
          <h2 class="hub-title" id="hubTitle">Bonjour</h2>
          <p class="hub-sub" id="hubSubtitle">Votre file de travail SIGFIC-PSLSH.</p>
          <label class="hub-search" for="hubSearchInput">
            <i class="fas fa-search"></i>
            <input id="hubSearchInput" type="search" placeholder="Rechercher un dossier, acte, budget..." autocomplete="off">
          </label>
        </div>

        <div>
          <div class="hub-section-title"><span>Actions rapides</span></div>
          <div class="hub-quick-grid" id="hubQuickActions"></div>
        </div>

        <div>
          <div class="hub-section-title"><span>File prioritaire</span><span id="hubPriorityCount"></span></div>
          <div class="hub-priority-list" id="hubPriorityList"></div>
        </div>

        <div>
          <div class="hub-section-title"><span>Acces secondaire aux modules</span></div>
          <div class="hub-secondary" id="hubSecondaryModules"></div>
        </div>
      </section>
```

- [ ] **Step 5: Add `renderPersonalHub` before `renderHome()`**

In the `<script>` section, add this function before `function renderHome()`:

```js
    function renderPersonalHub(spec, role, allowedNavigators) {
      const user = (window.SIGFIC && window.SIGFIC.getUser && window.SIGFIC.getUser()) || {};
      const title = document.getElementById('hubTitle');
      const subtitle = document.getElementById('hubSubtitle');
      const quick = document.getElementById('hubQuickActions');
      const priority = document.getElementById('hubPriorityList');
      const priorityCount = document.getElementById('hubPriorityCount');
      const secondary = document.getElementById('hubSecondaryModules');
      if (!title || !quick || !priority || !secondary) return;

      const displayName = [user.prenom, user.nom].filter(Boolean).join(' ') || user.email || 'Utilisateur';
      title.textContent = 'Bonjour ' + displayName;
      if (subtitle) subtitle.textContent = spec.sub || 'Votre espace de travail SIGFIC-PSLSH.';

      const flatActions = [];
      spec.cards.forEach(function (card) {
        if (card.href) flatActions.push(card);
        if (Array.isArray(card.menu)) {
          card.menu.forEach(function (entry) {
            flatActions.push({
              href: entry.href,
              icon: entry.icon || card.icon,
              label: entry.label,
              desc: card.label,
              color: card.color,
              light: card.light,
            });
          });
        }
      });

      const quickActions = flatActions.slice(0, 3);
      quick.innerHTML = quickActions.map(function (action) {
        return (
          `<a class="hub-quick" href="${action.href}" style="--card-color:${action.color || '#1b3a6b'};--card-light:${action.light || '#e8f0fb'}">` +
          `<i class="fas ${action.icon || 'fa-arrow-right'}"></i>` +
          `<strong>${action.label}</strong>` +
          `</a>`
        );
      }).join('');

      const priorityItems = flatActions.slice(0, 4);
      if (priorityCount) priorityCount.textContent = priorityItems.length + ' actions';
      priority.innerHTML = priorityItems.map(function (action, index) {
        const chip = index === 0 ? 'Priorite' : 'Ouvrir';
        return (
          `<a class="hub-priority" href="${action.href}" style="--card-color:${action.color || '#1b3a6b'};--card-light:${action.light || '#e8f0fb'}">` +
          `<i class="fas ${action.icon || 'fa-arrow-right'}"></i>` +
          `<span><strong>${action.label}</strong><small>${action.desc || 'Action disponible selon votre role'}</small></span>` +
          `<em class="hub-chip">${chip}</em>` +
          `</a>`
        );
      }).join('');

      secondary.innerHTML = allowedNavigators.slice(0, 6).map(function (nav) {
        return (
          `<a href="${nav.href}" style="--btn-color:${nav.color || '#1b3a6b'}">` +
          `<i class="fas ${nav.icon}"></i><span>${nav.label}</span>` +
          `</a>`
        );
      }).join('');
    }
```

- [ ] **Step 6: Call `renderPersonalHub` from `renderHome()`**

Inside `renderHome()`, after:

```js
      skillsT.textContent = spec.title;
      skillsS.textContent = spec.sub;
```

add:

```js
      renderPersonalHub(spec, role, allowed.length ? allowed : NAVIGATORS);
```

- [ ] **Step 7: Wire search to visible links**

After `renderHome();`, add:

```js
    const hubSearchInput = document.getElementById('hubSearchInput');
    if (hubSearchInput) {
      hubSearchInput.addEventListener('input', function () {
        const q = hubSearchInput.value.trim().toLowerCase();
        document.querySelectorAll('.hub-priority, .hub-secondary a, .hub-quick').forEach(function (link) {
          link.style.display = !q || link.textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
        });
      });
    }
```

- [ ] **Step 8: Run focused visual comfort tests**

Run:

```bash
cd backend
npm.cmd test -- frontend-visual-comfort.test.js
```

Expected:

```text
PASS tests/frontend-visual-comfort.test.js
```

- [ ] **Step 9: Commit accueil hub**

```bash
git add frontend/pages/accueil/index.html backend/tests/frontend-visual-comfort.test.js
git commit -m "feat: redesign accueil as mobile hub"
```

---

## Task 5: Verify Phase 1 End-to-End

**Files:**
- No code changes expected.

- [ ] **Step 1: Run full backend/frontend static tests**

Run:

```bash
cd backend
npm.cmd test
```

Expected:

```text
Test Suites: 10 passed, 10 total
Tests: 75 passed, 75 total
```

If the exact test count differs because more tests were added in this branch, the required condition is all suites passed and zero failures.

- [ ] **Step 2: Scan for horizontal overflow risks in touched files**

Run:

```bash
rg -n "width:\\s*100vw|height:\\s*100vh|overflow:\\s*hidden|grid-template-columns:\\s*repeat\\(6" frontend/pages/accueil/index.html frontend/src/css/main.css frontend/src/js/roles.js
```

Expected:

```text
No new problematic fixed mobile layout in accueil; existing global guarded rules are understood.
```

Review any result manually. Fixed `100vh` is acceptable only for overlays or print/document pages, not the mobile accueil layout.

- [ ] **Step 3: Start a local static server**

Run from repo root:

```bash
node frontend-server.js
```

Expected:

```text
Server listening
```

If port output differs, use the printed localhost URL.

- [ ] **Step 4: Manual browser verification**

Open:

```text
http://localhost:8080/pages/accueil/index.html
```

Check at 360px, 414px, 768px, and desktop widths:

- Hub title, search, quick actions, priority list, and secondary modules are visible.
- No essential text is clipped.
- No horizontal scroll appears.
- Bottom nav shows exactly Accueil, Dossiers, Creer, Notifications, Plus.
- Creer opens a slide-up panel.
- Plus opens a slide-up panel.
- Escape closes open panels.
- Desktop still shows sidebar/topbar behavior.

- [ ] **Step 5: Production-safe git review**

Run:

```bash
git status --short
git log --oneline -5
```

Expected:

```text
Only intended files changed before final commit or push.
Recent commits show test, shell, style, and accueil changes.
```

---

## Self-Review

Spec coverage:

- Hub personnel accueil: Task 4.
- A1 mobile nav Accueil / Dossiers / Creer / Notifications / Plus: Task 2 and Task 3.
- Role-aware Creer panel: Task 2.
- Desktop shell remains productive: Task 2 adds desktop Creer, Task 3 styles it.
- Progressive disclosure and less visual fatigue: Task 4 moves mobile to hub sections and keeps old dense cards hidden on phone.
- Verification at mobile/tablet/desktop widths: Task 5.

Placeholder scan:

- This plan contains no `TBD`, no `TODO`, and no "implement later" steps.

Type/name consistency:

- `initCreateActionPanel`, `initMobileMorePanel`, `initShellPanelEvents`, `_getAllowedCreateActions`, `sigfic-create-panel`, `sigfic-more-panel`, `data-sigfic-open-create`, and `data-sigfic-open-more` are defined before tests expect them.

Out-of-scope for phase 1:

- Table-to-card conversion for all module tables.
- Multi-step conversion for all long forms.
- Phase 2 actes pages.
- Backend model changes.
