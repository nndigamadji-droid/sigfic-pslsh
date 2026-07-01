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

  it('bloque le retour navigateur vers une page protegee apres deconnexion', () => {
    const apiJs = readProjectFile('frontend/src/js/api.js');
    const rolesJs = readProjectFile('frontend/src/js/roles.js');

    expect(apiJs).toContain('function enforceSessionOnRestore');
    expect(apiJs).toContain("window.addEventListener('pageshow', enforceSessionOnRestore)");
    expect(apiJs).toContain("window.location.replace('/pages/auth/login.html')");
    expect(rolesJs).toContain('function _enforceSessionOnRestore');
    expect(rolesJs).toContain("window.addEventListener('pageshow', _enforceSessionOnRestore)");
  });

  it('utilise les codes roles backend dans le formulaire de creation utilisateur', () => {
    const usersHtml = readProjectFile('frontend/pages/admin/users.html');

    expect(usersHtml).toContain('<option value="admin">Administrateur</option>');
    expect(usersHtml).toContain('<option value="gestionnaire">Gestionnaire</option>');
    expect(usersHtml).toContain('<option value="lecture">Lecture seule</option>');
    expect(usersHtml).not.toContain('<option value="administrateur">Administrateur</option>');
    expect(usersHtml).not.toContain('<option value="chef_service">Chef de service</option>');
    expect(usersHtml).not.toContain('<option value="agent">Agent</option>');
  });
});
