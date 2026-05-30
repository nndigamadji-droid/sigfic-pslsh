/**
 * SOURCES_REF — Source de vérité unique pour les 4 sources de financement PSLSH/IST.
 * Inclus dans : fonds-alloues.html, fonds-disponibles.html, recettes.html
 * Toute modification de libellé ou de banque doit se faire ICI uniquement.
 */
const SOURCES_REF = [
  {
    id: 'S1',
    libelle: 'Fonctionnement État-PSLSH',
    banque: 'Banque CBT',
    groupe: 'etat',
    type: 'trimestriel',
  },
  {
    id: 'S2',
    libelle: 'Contrepartie État-PSLSH',
    banque: 'Banque CBT',
    groupe: 'etat',
    type: 'trimestriel',
  },
  {
    id: 'S3',
    libelle: 'Charges Personnel État-PSLSH',
    banque: 'Compte Trésor',
    groupe: 'etat',
    type: 'mensuel',
  },
  { id: 'S4', libelle: 'Subvention FM/GC7', banque: 'Ecobact', groupe: 'ptf', type: 'trimestriel' },
];

/** Retourne une source par ID */
function getSourceRef(id) {
  return SOURCES_REF.find((s) => s.id === id) || null;
}
