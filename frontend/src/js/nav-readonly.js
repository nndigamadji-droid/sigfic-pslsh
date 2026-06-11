/* ════════════════════════════════════════════════════════════════════════════
   nav-readonly.js — Met une page de navigateur en mode CONSULTATION.

   Pattern Read/Write split de SIGFIC-PSLSH :
     • Accueil = espace d'ACTION (cartes + dropdowns par rôle)
     • 8 navigateurs = espace de CONSULTATION (vues, recherches, suivi)

   Quand cette page est incluse :
     1. Un bandeau bleu apparaît en haut : « Mode consultation —
        pour saisir, retournez à votre accueil » + bouton retour.
     2. Tous les boutons matchant des patterns d'ÉCRITURE sont masqués :
        "Nouveau", "Ajouter", "Créer", "Émettre", "+ Ligne", "Saisir",
        "Amender", "Réinitialiser", "Sauvegarder comme référence".
     3. Les boutons explicitement conservés (data-keep-write="1",
        class .keep-write) restent visibles. Idem pour les actions de
        consultation : "Exporter", "Imprimer", "Filtrer", "Rechercher".

   Stratégie défensive : la page d'accueil et les hubs role-spécifiques
   (saisies, actes-saf, etc.) NE doivent PAS inclure ce script.
   ════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Patterns à masquer (sur le label texte du bouton/lien) ────────── */
  const WRITE_PATTERNS = [
    /^\s*nouvelle?\b/i,
    /^\s*ajouter\b/i,
    /^\s*créer\b/i,
    /^\s*émettre\b/i,
    /^\s*saisir\b/i,
    /^\s*amender\b/i,
    /^\s*r[eé]initialiser/i,
    /^\s*sauvegarder/i,
    /^\s*supprimer\b/i,
    /^\s*\+\s/,         // "+ Ligne"
    /^\s*\+$/,          // bouton "+" seul
    /^\s*enregistrer/i,
    /\bnouveau\s+dossier/i,
    /\bnouvelle\s+ligne/i,
  ];

  /* ── Patterns explicitement conservés (consultation pure) ──────────── */
  const KEEP_PATTERNS = [
    /^\s*exporter\b/i,
    /^\s*imprimer\b/i,
    /^\s*filtrer\b/i,
    /^\s*rechercher\b/i,
    /^\s*télécharger\b/i,
    /^\s*pdf\b/i,
    /^\s*excel\b/i,
    /^\s*csv\b/i,
    /^\s*fermer\b/i,
    /^\s*annuler\b/i,
    /^\s*déconnexion\b/i,
    /^\s*retour\b/i,
    /^\s*voir\b/i,
    /^\s*ouvrir\b/i,
    /^\s*consulter\b/i,
    /^\s*détails?\b/i,
  ];

  /* ── Bandeau « mode consultation » ─────────────────────────────────── */
  function injectBanner() {
    if (document.getElementById('nav-readonly-banner')) return;
    const anchor =
      document.querySelector('.page-content') ||
      document.querySelector('main.main-content') ||
      document.querySelector('.main-content') ||
      document.body;
    if (!anchor) return;

    const banner = document.createElement('div');
    banner.id = 'nav-readonly-banner';
    banner.style.cssText =
      'background:linear-gradient(90deg,#eef4ff 0%,#f0f7ff 100%);' +
      'border-left:4px solid #1d4ed8;border-radius:8px;' +
      'padding:11px 18px;margin:0 0 14px;' +
      'display:flex;align-items:center;gap:14px;flex-wrap:wrap;' +
      'font-size:.82rem;color:#1b3a6b;';
    banner.innerHTML =
      '<i class="fas fa-eye" style="font-size:1.2rem;color:#1d4ed8"></i>' +
      '<div style="flex:1;line-height:1.4;min-width:220px">' +
      '<strong>Mode consultation</strong> — Cette page est en lecture seule. ' +
      '<span style="color:#64748b;display:block;font-size:.74rem">' +
      'Pour produire un acte (saisir, émettre, ajouter), utilisez les options de votre <strong>espace de travail</strong>.' +
      '</span></div>' +
      '<a href="/pages/accueil/index.html" ' +
      'style="background:#1d4ed8;color:#fff;font-weight:700;font-size:.74rem;' +
      'padding:7px 14px;border-radius:7px;text-decoration:none;' +
      'display:inline-flex;align-items:center;gap:6px;white-space:nowrap">' +
      '<i class="fas fa-home"></i>Retour à l\'accueil</a>';

    // Insérer en TOUT premier dans page-content (avant tout autre contenu)
    const firstChild = anchor.firstChild;
    if (firstChild) anchor.insertBefore(banner, firstChild);
    else anchor.appendChild(banner);
  }

  /* ── Masquage des boutons d'écriture ───────────────────────────────── */
  function hideWriteButtons() {
    const sel = 'button, a.btn, .btn, a.btn-eb, button.btn-lb-export';
    document.querySelectorAll(sel).forEach((el) => {
      // Skip explicitly preserved
      if (el.dataset.keepWrite === '1') return;
      if (el.classList.contains('keep-write')) return;

      // Le label = texte visible, sans icônes Font Awesome
      const clone = el.cloneNode(true);
      clone.querySelectorAll('i, svg').forEach((n) => n.remove());
      const label = (clone.textContent || '').trim();

      // Skip si dans la sidebar / topbar / breadcrumb / dropdown menu utilisateur
      if (el.closest('.sidebar, .topbar, .breadcrumb, .dropdown-menu')) return;
      // Skip si dans le bandeau readonly que nous venons de poser
      if (el.closest('#nav-readonly-banner')) return;
      // Skip si dans un modal Bootstrap (le modal sert à éditer/voir un détail —
      // une fois ouvert, ses actions sont métier et ne doivent pas être masquées)
      if (el.closest('.modal, [role="dialog"]')) return;

      // Garder explicitement
      for (const k of KEEP_PATTERNS) if (k.test(label)) return;

      // Masquer si match d'écriture
      for (const w of WRITE_PATTERNS) {
        if (w.test(label)) {
          el.style.display = 'none';
          break;
        }
      }
    });
  }

  function run() {
    try {
      injectBanner();
      hideWriteButtons();
    } catch (e) {
      console.warn('[nav-readonly]', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
