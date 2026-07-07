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

  it('ne garde pas de comptes de demonstration executables dans les scripts operationnels', () => {
    const scriptNames = [
      'seed-comptable-principal.js',
      'seed-chef-saf.js',
      'reset-comptable-password.js',
    ];
    const forbidden = [
      'comptable@pslsh.org',
      'saf@pslsh.org',
      'Compta@2026',
      'SAF@2026',
      'Saf@2026',
    ];

    for (const scriptName of scriptNames) {
      const script = fs.readFileSync(
        path.join(rootDir, 'backend', 'scripts', scriptName),
        'utf8'
      );
      for (const value of forbidden) {
        expect(script).not.toContain(value);
      }
    }
  });

  it('utilise une route health dediee pour Render', () => {
    const renderYaml = fs.readFileSync(path.join(rootDir, 'render.yaml'), 'utf8');
    const appJs = fs.readFileSync(path.join(rootDir, 'backend', 'app', 'app.js'), 'utf8');

    expect(renderYaml).toContain('healthCheckPath: /health');
    expect(appJs).toContain("app.get('/health'");
  });

  it('retrouve le service Render par nom avant de declencher le deploy', () => {
    const workflow = fs.readFileSync(path.join(rootDir, '.github', 'workflows', 'ci-deploy.yml'), 'utf8');

    expect(workflow).toContain('RENDER_SERVICE_NAME: sigfic-pslsh-backend');
    expect(workflow).toContain('https://api.render.com/v1/services?limit=100');
    expect(workflow).toContain('service_id="${resolved_service_id:-${RENDER_SERVICE_ID:-}}"');
  });

  it('laisse le temps au backend Render de sortir de veille pendant le login', () => {
    const apiJs = fs.readFileSync(path.join(rootDir, 'frontend', 'src', 'js', 'api.js'), 'utf8');

    expect(apiJs).toContain('const API_TIMEOUT = 60000');
  });
});
