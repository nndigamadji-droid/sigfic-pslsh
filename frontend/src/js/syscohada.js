(function (window) {
  'use strict';

  const CATALOG = [
    // ─────── CLASSE 2 — IMMOBILISATIONS ───────
    { code:'2184', famille:'Mobilier de bureau', sousFamille:'Postes de travail & assises',
      libelle:'Mobilier et matériel de bureau', classe:2, type:'immo',
      ligne_budget:'L-MOBILIER-2184', dossier_prefix:'Mobilier',
      keywords:['mobilier','table','fauteuil','siège','chaise ergonomique','caisson','armoire',
                'bibliothèque','étagère','rangement','banque accueil','sous-main','dossier suspendu',
                'rideau','meuble','bureau ergonomique','bureau d\'angle','bureau réglable'] },

    { code:'2183', famille:'Matériel informatique', sousFamille:'Postes et infrastructure IT',
      libelle:'Matériel informatique (immobilisations)', classe:2, type:'immo',
      ligne_budget:'L-INFORMATIQUE-2183', dossier_prefix:'Matériel informatique',
      keywords:['ordinateur','pc','laptop','portable','station accueil','dock','écran','moniteur',
                'serveur','nas','onduleur','ups','routeur','switch','commutateur','box',
                'imprimante','scanner','destructeur','broyeur','étiqueteuse','dymo',
                'webcam','casque audio','visioconférence','clavier','souris ergonomique'] },

    { code:'2154', famille:'Matériel technique', sousFamille:'Équipements techniques',
      libelle:'Matériel et outillage industriel', classe:2, type:'immo',
      ligne_budget:'L-EQUIPEMENT-2154', dossier_prefix:'Équipement technique',
      keywords:['climatiseur','climatisation','groupe électrogène','générateur','pompe',
                'compresseur','automate','machine','équipement industriel','matériel médical'] },

    // ─────── CLASSE 6 — CHARGES ───────
    // Fournitures non stockables (60)
    { code:'6061', famille:'Énergie & fluides', sousFamille:'Eau, électricité, gaz',
      libelle:'Fournitures non stockables — Eau, électricité, glace', classe:6, type:'charge',
      ligne_budget:'L-ENERGIE-6061', dossier_prefix:'Énergie',
      keywords:['eau','glace','glaçon','électricité','gaz','fluide','énergie'] },

    // Achats stockés (602x)
    { code:'60221', famille:'Composants électroniques', sousFamille:'Pièces et composants en stock',
      libelle:'Matières premières — Composants électroniques', classe:6, type:'stock',
      ligne_budget:'L-COMPOSANTS-60221', dossier_prefix:'Composants électroniques',
      keywords:['carte mère','processeur','cpu','ram','mémoire vive','disque dur interne','ssd interne',
                'composant électronique','circuit imprimé','transistor','résistance','condensateur'] },

    { code:'60225', famille:'Fournitures entretien stockées', sousFamille:'Stock détergents et hygiène',
      libelle:'Fournitures d\'entretien stockées (gros volumes)', classe:6, type:'stock',
      ligne_budget:'L-ENTRETIEN-STOCK-60225', dossier_prefix:'Stock entretien',
      keywords:['palette détergent','stock désinfectant','stock hygiène'] },

    { code:'60211', famille:'Médicaments', sousFamille:'Pharmacie & traitements',
      libelle:'Achats stockés — Médicaments', classe:6, type:'stock',
      ligne_budget:'L-MEDICAMENTS-60211', dossier_prefix:'Médicaments',
      keywords:['médicament','arv','antirétroviral','antiretroviral','molécule','comprimé','sirop',
                'ios','traitement','antibiotique','dolutegravir','tenofovir','efavirenz'] },

    { code:'60212', famille:'Réactifs de laboratoire', sousFamille:'Diagnostic & biologie',
      libelle:'Achats stockés — Réactifs de laboratoire', classe:6, type:'stock',
      ligne_budget:'L-REACTIFS-60212', dossier_prefix:'Réactifs',
      keywords:['réactif','test rapide','rdt','determine','bioline','genexpert','cobas','elisa','pcr',
                'kit dépistage','charge virale','sérologie','vih','hépatite','syphilis','dual rdt'] },

    { code:'60213', famille:'Consommables médicaux', sousFamille:'Consommables soins',
      libelle:'Achats stockés — Consommables médicaux', classe:6, type:'stock',
      ligne_budget:'L-CONSOMMABLES-MED-60213', dossier_prefix:'Consommables médicaux',
      keywords:['seringue','aiguille','gant','compresse','pansement','tubulure','masque chirurgical',
                'sparadrap','antiseptique'] },

    // Fournitures consommables non stockables (606x)
    { code:'6063', famille:'Entretien & petit équipement', sousFamille:'Détergents et hygiène',
      libelle:'Fournitures d\'entretien et de petit équipement', classe:6, type:'charge',
      ligne_budget:'L-ENTRETIEN-6063', dossier_prefix:'Entretien & hygiène',
      keywords:['détergent','liquide vaisselle','nettoyant','spray vitres','désinfectant',
                'gel hydroalcoolique','savon','chiffon','microfibre','éponge','balai','sac poubelle',
                'fer à souder','multimètre','pince','étain','fil électrique','fusible','connecteur'] },

    { code:'6064', famille:'Fournitures administratives', sousFamille:'Papeterie & écriture',
      libelle:'Fournitures administratives', classe:6, type:'charge',
      ligne_budget:'L-PAPETERIE-6064', dossier_prefix:'Fournitures de bureau',
      keywords:['fourniture de bureau','fournitures de bureau','fourniture administrative',
                'consommable de bureau','consommables de bureau','papeterie',
                'ramette','papier a4','papier a3','papier thermique','cahier','bloc','bloc-note',
                'carnet','post-it','enveloppe','agenda','stylo','crayon','critérium','gomme',
                'surligneur','feutre','marqueur','agrafe','agrafeuse','trombone','punaise',
                'pince double','élastique','scotch','ruban adhésif','blanco','correcteur','colle',
                'classeur','chemise','sous-chemise','pochette','intercalaire','boîte archive',
                'étiquette','perforatrice','trieur'] },

    { code:'6065', famille:'Consommables informatiques', sousFamille:'Impression & stockage IT',
      libelle:'Consommables informatiques', classe:6, type:'charge',
      ligne_budget:'L-CONSOMMABLES-IT-6065', dossier_prefix:'Consommables informatiques',
      keywords:['cartouche','encre','toner','tambour','fusion','ruban encreur',
                'clé usb','clef usb','disque dur externe','ssd externe','hdd externe',
                'pile aa','pile aaa','cr2032','batterie aaa','batterie aa',
                'bombe air comprimé','lingette antistatique','lingette écran','spray écran',
                'câble réseau','rj45','hdmi','displayport','usb-c','multiprise','rallonge'] },

    // Prestations de services externes (615x)
    { code:'6152', famille:'Entretien biens immobiliers', sousFamille:'Travaux et réparations bâtiment',
      libelle:'Entretien et réparations sur biens immobiliers', classe:6, type:'service',
      ligne_budget:'L-BATIMENT-6152', dossier_prefix:'Entretien bâtiment',
      keywords:['peinture','plomberie','porte','fenêtre','climatisation','chauffage',
                'réparation bâtiment','travaux','maçonnerie','électricité bâtiment','toiture','sanitaire',
                'construction','entrepôt','aménagement','rénovation','réhabilitation','agrandissement'] },

    { code:'6156', famille:'Maintenance', sousFamille:'Maintenance IT et équipements',
      libelle:'Maintenance informatique et électronique', classe:6, type:'service',
      ligne_budget:'L-MAINTENANCE-6156', dossier_prefix:'Maintenance',
      keywords:['maintenance','dépannage','contrat maintenance','support technique','sav',
                'maintenance photocopieur','maintenance serveur','maintenance climatiseur',
                'maintenance vidéosurveillance','réparation informatique'] },

    // Documentation et formation (618 / 624)
    { code:'6181', famille:'Documentation', sousFamille:'Livres et abonnements',
      libelle:'Documentation générale', classe:6, type:'charge',
      ligne_budget:'L-DOC-6181', dossier_prefix:'Documentation',
      keywords:['livre','revue','abonnement','journal','magazine','documentation','bibliothèque'] },

    { code:'6231', famille:'Formation du personnel', sousFamille:'Formations, séminaires, ateliers',
      libelle:'Frais de formation du personnel', classe:6, type:'service',
      ligne_budget:'L-FORMATION-6231', dossier_prefix:'Formation',
      keywords:['formation','séminaire','atelier','workshop','stage','colloque','perfectionnement',
                'recyclage','tdr formation'] },

    // Transports et missions (625x)
    { code:'6251', famille:'Voyages et déplacements', sousFamille:'Transports missions',
      libelle:'Voyages et déplacements', classe:6, type:'service',
      ligne_budget:'L-MISSIONS-6251', dossier_prefix:'Mission',
      keywords:['mission','voyage','déplacement','transport','billet avion','billet bus','taxi',
                'carburant mission','location véhicule'] },

    { code:'6252', famille:'Frais de mission', sousFamille:'Per diem et hébergement',
      libelle:'Frais de mission — Per diem et hébergement', classe:6, type:'service',
      ligne_budget:'L-PERDIEM-6252', dossier_prefix:'Indemnités mission',
      keywords:['per diem','perdiem','hôtel','hebergement','hébergement','restauration mission',
                'indemnité journalière','frais séjour'] },

    // Postes & télécoms (626x)
    { code:'6261', famille:'Postes et télécommunications', sousFamille:'Téléphonie et internet',
      libelle:'Frais postaux et télécommunications', classe:6, type:'charge',
      ligne_budget:'L-TELECOM-6261', dossier_prefix:'Télécoms',
      keywords:['affranchissement','poste','téléphone','internet','abonnement téléphonique',
                'data','communication','box internet'] },

    // Personnel (66)
    { code:'6611', famille:'Salaires', sousFamille:'Rémunérations principales',
      libelle:'Appointements, salaires et commissions', classe:6, type:'personnel',
      ligne_budget:'L-SALAIRES-6611', dossier_prefix:'Salaires',
      keywords:['salaire','appointement','paie','rémunération personnel','traitement principal'] },

    { code:'6612', famille:'Primes', sousFamille:'Primes et gratifications',
      libelle:'Primes et gratifications', classe:6, type:'personnel',
      ligne_budget:'L-PRIMES-6612', dossier_prefix:'Primes',
      keywords:['prime','gratification','bonus','rémunération exceptionnelle','indemnité prime',
                'prime performance'] },

    { code:'6631', famille:'Indemnités', sousFamille:'Indemnités et avantages',
      libelle:'Indemnités versées au personnel', classe:6, type:'personnel',
      ligne_budget:'L-INDEMNITES-6631', dossier_prefix:'Indemnités',
      keywords:['indemnité','allocation','avantage personnel','prime de transport',
                'prime de responsabilité'] },

    // Dons & libéralités (67)
    { code:'6712', famille:'Dons & libéralités', sousFamille:'Dons accordés',
      libelle:'Dons et libéralités accordés', classe:6, type:'autre',
      ligne_budget:'L-DONS-6712', dossier_prefix:'Don',
      keywords:['don','donation','libéralité','cadeau','aide gracieuse','contribution'] },

    // Subventions et aides (657)
    { code:'6571', famille:'Aides & assistance', sousFamille:'Aides aux bénéficiaires',
      libelle:'Subventions et assistance aux bénéficiaires', classe:6, type:'autre',
      ligne_budget:'L-ASSISTANCE-6571', dossier_prefix:'Assistance',
      keywords:['assistance','aide bénéficiaire','subvention','appui financier','soutien financier'] },
  ];

  const TYPE_TO_FAMILLE_LABEL = {
    immo:      { label:'Immobilisation',         color:'#1b3a6b', bg:'#dbeafe' },
    stock:     { label:'Achat stocké',           color:'#075985', bg:'#e0f2fe' },
    charge:    { label:'Charge directe',         color:'#b45309', bg:'#fef3c7' },
    service:   { label:'Prestation de service',  color:'#0f766e', bg:'#ccfbf1' },
    personnel: { label:'Charge de personnel',    color:'#9d174d', bg:'#fce7f3' },
    autre:     { label:'Autre charge',           color:'#475569', bg:'#f1f5f9' },
  };

  const UNCLASSIFIED = {
    code:'?', famille:'À classer manuellement', sousFamille:'Mots-clés non reconnus',
    libelle:'Catégorie SYSCOHADA non identifiée', classe:6, type:'autre',
    ligne_budget:'L-A-CLASSER', dossier_prefix:'À classer', keywords:[],
  };

  function normalize(s) {
    return (s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[\(\)\[\]]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  function classify(libelle) {
    const text = normalize(libelle);
    if (!text) return null;
    let best = null;
    let bestScore = 0;
    for (const cat of CATALOG) {
      let score = 0;
      for (const kw of cat.keywords) {
        const n = normalize(kw);
        if (text.includes(n)) score += Math.max(n.length, 4);
      }
      if (score > bestScore) { bestScore = score; best = cat; }
    }
    return best || UNCLASSIFIED;
  }

  function dominantCategory(lignes) {
    if (!Array.isArray(lignes) || !lignes.length) return null;
    const tally = {};
    let max = null; let maxScore = -1;
    for (const l of lignes) {
      const cat = classify(l.libelle);
      if (!cat) continue;
      const key = cat.code;
      tally[key] = (tally[key] || { cat, n:0 });
      tally[key].n += 1;
      if (tally[key].n > maxScore) { maxScore = tally[key].n; max = cat; }
    }
    return max;
  }

  function suggestDossierTitle(motif, lignes) {
    const cat = dominantCategory(lignes);
    if (!cat) return motif || 'Dossier sans titre';
    const main = (lignes && lignes[0] && lignes[0].libelle) || motif || cat.dossier_prefix;
    const more = lignes && lignes.length > 1 ? ` (+${lignes.length - 1})` : '';
    return `${cat.dossier_prefix} — ${main}${more}`;
  }

  function suggestBudgetLine(service, lignes) {
    const cat = dominantCategory(lignes);
    if (!cat) return `L-${service || 'AUTO'}`;
    return `${cat.ligne_budget}/${service || 'AUTO'}`;
  }

  function listForSelect() {
    return CATALOG.map((c) => ({
      code:c.code, libelle:`${c.code} — ${c.libelle}`,
      famille:c.famille, type:c.type,
    }));
  }

  function getByCode(code) {
    return CATALOG.find((c) => c.code === code) || null;
  }

  window.SYSCOHADA = {
    CATALOG, TYPE_TO_FAMILLE_LABEL, UNCLASSIFIED,
    classify, dominantCategory, suggestDossierTitle, suggestBudgetLine,
    listForSelect, getByCode, normalize,
  };
})(window);
