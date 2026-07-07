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
});
