const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

describe('Responsive frontend shell', () => {
  it('uses an off-canvas sidebar and full-width content on tablet and phone screens', () => {
    const css = readProjectFile('frontend/src/css/main.css');

    expect(css).toContain('@media (max-width: 991.98px)');
    expect(css).toMatch(/\.sidebar,\s*#sidebar\s*{[\s\S]*transform:\s*translateX\(-100%\)/);
    expect(css).toMatch(/body\.sigfic-sidebar-open\s+\.sidebar,\s*body\.sigfic-sidebar-open\s+#sidebar\s*{[\s\S]*transform:\s*translateX\(0\)/);
    expect(css).toMatch(/\.main-content,\s*#main-content\s*{[\s\S]*margin-left:\s*0\s*!important/);
    expect(css).toMatch(/\.sigfic-mobile-menu-btn\s*{[\s\S]*display:\s*inline-flex/);
    expect(css).toMatch(/\.sigfic-sidebar-backdrop\s*{[\s\S]*position:\s*fixed/);
  });

  it('injects mobile navigation controls from the shared role script', () => {
    const rolesJs = readProjectFile('frontend/src/js/roles.js');

    expect(rolesJs).toContain('initResponsiveShell');
    expect(rolesJs).toContain('sigfic-mobile-menu-btn');
    expect(rolesJs).toContain('sigfic-sidebar-backdrop');
    expect(rolesJs).toContain('sigfic-sidebar-open');
  });

  it('adds a mobile-first bottom navigator for phone workflows', () => {
    const css = readProjectFile('frontend/src/css/main.css');
    const rolesJs = readProjectFile('frontend/src/js/roles.js');

    expect(rolesJs).toContain('initMobileBottomNav');
    expect(rolesJs).toContain('sigfic-mobile-bottom-nav');
    expect(css).toContain('.sigfic-mobile-bottom-nav');
    expect(css).toMatch(/@media \(max-width: 640px\)[\s\S]*\.sigfic-mobile-bottom-nav\s*{[\s\S]*display:\s*grid/);
    expect(css).toContain('env(safe-area-inset-bottom)');
    expect(css).toContain('touch-action: manipulation');
  });

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
});
