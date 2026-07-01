const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

describe('Frontend auth UX', () => {
  it('affiche que la connexion attend une adresse email', () => {
    const loginHtml = readProjectFile('frontend/pages/auth/login.html');

    expect(loginHtml).toContain('Adresse e-mail');
    expect(loginHtml).not.toContain("Nom d'utilisateur");
  });

  it('ne redirige pas automatiquement quand la tentative de login est refusee', () => {
    const apiJs = readProjectFile('frontend/src/js/api.js');

    expect(apiJs).toContain("const isLoginRequest = path === '/auth/login'");
    expect(apiJs).toContain('if (res.status === 401 && !isLoginRequest)');
  });
});
