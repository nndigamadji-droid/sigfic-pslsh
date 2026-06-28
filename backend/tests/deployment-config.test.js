const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');

describe('Configuration de deploiement production', () => {
  it('ne lance pas le seed au demarrage Render', () => {
    const renderYaml = fs.readFileSync(path.join(rootDir, 'render.yaml'), 'utf8');

    expect(renderYaml).toContain('startCommand:');
    expect(renderYaml).not.toMatch(/startCommand:\s*npm run seed\b/);
    expect(renderYaml).not.toContain('npm run seed && npm start');
  });

  it('ne garde pas de mot de passe admin de developpement dans le seed', () => {
    const seedScript = fs.readFileSync(
      path.join(rootDir, 'backend', 'scripts', 'seed.js'),
      'utf8'
    );

    expect(seedScript).not.toContain('Admin@2026');
    expect(seedScript).toContain('SEED_ADMIN_PASSWORD');
  });
});
