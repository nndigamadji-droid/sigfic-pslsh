const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

describe('Frontend visual comfort and progressive disclosure', () => {
  it('removes the partner strip and institutional footer from the accueil page', () => {
    const accueil = readProjectFile('frontend/pages/accueil/index.html');

    expect(accueil).not.toContain('class="partners"');
    expect(accueil).not.toContain('partners-title');
    expect(accueil).not.toContain('partners-row');
    expect(accueil).not.toContain('<footer class="footer">');
  });

  it('defines the global quiet interface layer without hiding action footers', () => {
    const css = readProjectFile('frontend/src/css/main.css');

    expect(css).toContain('Visual comfort and progressive disclosure');
    expect(css).toMatch(/\.page-footer,[\s\S]*body\s*>\s*footer\.bottom-bar,[\s\S]*\.sidebar-footer\s*{[\s\S]*display:\s*none\s*!important/);
    expect(css).toContain('.modal-footer {');
    expect(css).toContain('.card-footer {');
    expect(css).toMatch(/\.page-content\s*{[\s\S]*padding:\s*clamp\(24px,\s*2\.2vw,\s*36px\)/);
    expect(css).toContain('details.sigfic-disclosure');
    expect(css).toContain('.sigfic-summary-line');
  });

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
});
