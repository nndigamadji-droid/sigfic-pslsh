/**
 * passation.controller.js — Circuit complet de la passation SIGFIC-PSLSH
 *
 * Couvre :
 *  - Gestion des expressions de besoin (CRUD + workflow propre : brouillon→soumis→valide)
 *  - Génération automatique du dossier (déclenchement)
 *  - Validation 2 : administrative et financière (SAF / coordination)
 *  - Demandes de cotation
 *  - Enregistrement des offres / pro forma (min. 3 pour achats)
 *  - Analyse comparative et sélection de l'offre retenue (Validation 3)
 *  - Imputation budgétaire (Validation 4) : ligne disponible ou insuffisante
 *  - Attributions
 */

const {
  ExpressionBesoin,
  LigneExpressionBesoin,
  DemandeCotation,
  Offre,
  AnalyseComparative,
  Attribution,
  Fournisseur,
  Dossier,
  Exercice,
  LigneBudgetaire,
  SourceFinancement,
  Activite,
} = require('../models');
const referenceService = require('../services/reference.service');
const budgetService = require('../services/budget.service');
const auditService = require('../services/audit.service');
const { sequelize } = require('../models');

// ═══════════════════════════════════════════════════════════════════════════════
// EXPRESSIONS DE BESOIN — entité autonome
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /passation/besoins
 * Filtres : statut, exercice_id, service_id
 */
async function listBesoins(req, res, next) {
  try {
    const where = {};
    if (req.query.statut) where.statut = req.query.statut;
    if (req.query.exercice_id) where.exercice_id = req.query.exercice_id;
    if (req.query.service_id) where.service_id = req.query.service_id;

    const data = await ExpressionBesoin.findAll({
      where,
      include: [
        { model: Exercice, as: 'exercice', attributes: ['id', 'annee'] },
        { model: Activite, as: 'activite', attributes: ['id', 'code', 'libelle'] },
        {
          model: LigneBudgetaire,
          as: 'ligne_budgetaire',
          attributes: ['id', 'libelle', 'montant_revise', 'montant_engage'],
        },
        {
          model: SourceFinancement,
          as: 'source_financement',
          attributes: ['id', 'code', 'libelle'],
        },
        { model: Dossier, as: 'dossier', attributes: ['id', 'reference', 'statut'] },
        { model: LigneExpressionBesoin, as: 'lignes' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /passation/besoins/:id
 */
async function showBesoin(req, res, next) {
  try {
    const data = await ExpressionBesoin.findByPk(req.params.id, {
      include: [
        { model: Exercice, as: 'exercice' },
        { model: Activite, as: 'activite' },
        { model: LigneBudgetaire, as: 'ligne_budgetaire' },
        { model: SourceFinancement, as: 'source_financement' },
        { model: Dossier, as: 'dossier', attributes: ['id', 'reference', 'statut'] },
        { model: LigneExpressionBesoin, as: 'lignes' },
      ],
    });
    if (!data)
      return res.status(404).json({ success: false, message: 'Expression de besoin introuvable' });

    // Lecture budgétaire initiale
    let budget_info = null;
    if (data.ligne_budgetaire_id && data.montant_total_estime) {
      budget_info = await budgetService.checkAvailability(
        data.ligne_budgetaire_id,
        data.montant_total_estime
      );
    }

    res.json({ success: true, data: { ...data.toJSON(), budget_info } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /passation/besoins
 * Crée une expression de besoin en brouillon + ses lignes de détail.
 */
async function createBesoin(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const { lignes = [], ...besoinData } = req.body;

    const reference = await referenceService.generateExpressionBesoinRef(
      besoinData.exercice_id ? (await Exercice.findByPk(besoinData.exercice_id))?.annee : null
    );

    const besoin = await ExpressionBesoin.create(
      { ...besoinData, reference, statut: 'brouillon', created_by: req.user.id },
      { transaction: t }
    );

    // Créer les lignes de détail
    let montant_total = 0;
    if (lignes.length) {
      const lignesData = lignes.map((l) => {
        const total = parseFloat(l.quantite || 0) * parseFloat(l.prix_unitaire_estime || 0);
        montant_total += total;
        return { ...l, expression_besoin_id: besoin.id };
      });
      await LigneExpressionBesoin.bulkCreate(lignesData, { transaction: t });
      await besoin.update({ montant_total_estime: montant_total }, { transaction: t });
    }

    await auditService.log(req.user.id, 'passation:besoin:create', 'expression_besoin', besoin.id, {
      new: { reference, titre: besoin.titre },
    });
    await t.commit();
    res.status(201).json({ success: true, data: besoin });
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

/**
 * PUT /passation/besoins/:id
 * Modification possible uniquement en brouillon ou à_revoir.
 */
async function updateBesoin(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const besoin = await ExpressionBesoin.findByPk(req.params.id);
    if (!besoin)
      return res.status(404).json({ success: false, message: 'Expression de besoin introuvable' });
    if (!['brouillon', 'a_revoir'].includes(besoin.statut)) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Impossible de modifier une expression en statut "${besoin.statut}"`,
        });
    }

    const { lignes, ...besoinData } = req.body;
    await besoin.update(besoinData, { transaction: t });

    if (lignes) {
      await LigneExpressionBesoin.destroy({
        where: { expression_besoin_id: besoin.id },
        transaction: t,
      });
      let montant_total = 0;
      const lignesData = lignes.map((l) => {
        montant_total += parseFloat(l.quantite || 0) * parseFloat(l.prix_unitaire_estime || 0);
        return { ...l, expression_besoin_id: besoin.id };
      });
      await LigneExpressionBesoin.bulkCreate(lignesData, { transaction: t });
      await besoin.update({ montant_total_estime: montant_total }, { transaction: t });
    }

    await t.commit();
    res.json({ success: true, data: besoin });
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

/**
 * POST /passation/besoins/:id/soumettre
 * Soumettre l'expression au centre de validation (Validation 1).
 */
async function soumettreBesoin(req, res, next) {
  try {
    const besoin = await ExpressionBesoin.findByPk(req.params.id, {
      include: [{ model: LigneExpressionBesoin, as: 'lignes' }],
    });
    if (!besoin)
      return res.status(404).json({ success: false, message: 'Expression de besoin introuvable' });
    if (besoin.statut !== 'brouillon' && besoin.statut !== 'a_revoir') {
      return res
        .status(400)
        .json({
          success: false,
          message: `Statut actuel "${besoin.statut}" ne permet pas la soumission`,
        });
    }
    if (!besoin.lignes || !besoin.lignes.length) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Aucune ligne de désignation. Ajoutez au moins un article ou service.',
        });
    }

    await besoin.update({ statut: 'soumis', soumis_par: req.user.id, soumis_le: new Date() });
    await auditService.log(
      req.user.id,
      'passation:besoin:soumis',
      'expression_besoin',
      besoin.id,
      {}
    );
    res.json({
      success: true,
      data: besoin,
      message: 'Expression de besoin soumise au centre de validation',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /passation/besoins/:id/valider
 * Validation 1 : valider l'expression (recevabilité / conformité / opportunité).
 * Rôles : coordinateur, admin
 */
async function validerBesoin(req, res, next) {
  try {
    const besoin = await ExpressionBesoin.findByPk(req.params.id);
    if (!besoin)
      return res.status(404).json({ success: false, message: 'Expression de besoin introuvable' });
    if (besoin.statut !== 'soumis') {
      return res
        .status(400)
        .json({ success: false, message: 'Seule une expression soumise peut être validée' });
    }

    await besoin.update({ statut: 'valide', valide_par: req.user.id, valide_le: new Date() });
    await auditService.log(
      req.user.id,
      'passation:besoin:valide',
      'expression_besoin',
      besoin.id,
      {}
    );
    res.json({
      success: true,
      data: besoin,
      message: 'Expression de besoin validée. Elle est maintenant disponible dans Opérations.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /passation/besoins/:id/rejeter
 * Rejeter l'expression de besoin (bloquée définitivement).
 */
async function rejeterBesoin(req, res, next) {
  try {
    const besoin = await ExpressionBesoin.findByPk(req.params.id);
    if (!besoin)
      return res.status(404).json({ success: false, message: 'Expression de besoin introuvable' });
    if (!['soumis'].includes(besoin.statut)) {
      return res
        .status(400)
        .json({ success: false, message: 'Seule une expression soumise peut être rejetée' });
    }
    const { motif } = req.body;
    if (!motif)
      return res.status(400).json({ success: false, message: 'Le motif de rejet est obligatoire' });

    await besoin.update({
      statut: 'rejete',
      rejete_par: req.user.id,
      rejete_le: new Date(),
      motif_rejet: motif,
    });
    await auditService.log(req.user.id, 'passation:besoin:rejete', 'expression_besoin', besoin.id, {
      motif,
    });
    res.json({ success: true, data: besoin, message: 'Expression de besoin rejetée' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /passation/besoins/:id/a-revoir
 * Renvoyer l'expression au demandeur pour correction.
 */
async function aRevoirBesoin(req, res, next) {
  try {
    const besoin = await ExpressionBesoin.findByPk(req.params.id);
    if (!besoin)
      return res.status(404).json({ success: false, message: 'Expression de besoin introuvable' });
    if (besoin.statut !== 'soumis') {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Seule une expression soumise peut être renvoyée pour révision',
        });
    }
    const { motif } = req.body;
    if (!motif)
      return res
        .status(400)
        .json({ success: false, message: 'Le motif de révision est obligatoire' });

    await besoin.update({ statut: 'a_revoir', motif_revision: motif });
    await auditService.log(
      req.user.id,
      'passation:besoin:a_revoir',
      'expression_besoin',
      besoin.id,
      { motif }
    );
    res.json({
      success: true,
      data: besoin,
      message: 'Expression renvoyée au demandeur pour correction',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /passation/besoins/:id/declencher
 * Déclencher la procédure : génération automatique du dossier depuis l'expression validée.
 *
 * Le dossier est créé avec :
 *   - statut 'dossier_genere'
 *   - tous les rattachements de l'expression (exercice, activité, ligne budgétaire, source)
 *   - lien expression_besoin_id
 * Le budget n'est PAS vérifié ici (vérification lors de l'imputation, étape 4).
 */
async function declencherBesoin(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const besoin = await ExpressionBesoin.findByPk(req.params.id, {
      include: [{ model: LigneExpressionBesoin, as: 'lignes' }],
    });
    if (!besoin)
      return res.status(404).json({ success: false, message: 'Expression de besoin introuvable' });
    if (besoin.statut !== 'valide') {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Seule une expression validée peut déclencher la procédure',
        });
    }
    if (besoin.dossier_id) {
      return res
        .status(400)
        .json({ success: false, message: 'Un dossier a déjà été généré pour cette expression' });
    }
    if (!besoin.exercice_id) {
      return res
        .status(400)
        .json({ success: false, message: "L'expression doit être rattachée à un exercice" });
    }

    // Générer la référence du dossier
    const exercice = await Exercice.findByPk(besoin.exercice_id);
    const reference = await referenceService.generateDossierRef(exercice?.annee);

    // Créer le dossier automatiquement depuis l'expression
    const dossier = await Dossier.create(
      {
        reference,
        exercice_id: besoin.exercice_id,
        activite_id: besoin.activite_id,
        ligne_budgetaire_id: besoin.ligne_budgetaire_id,
        source_financement_id: besoin.source_financement_id,
        expression_besoin_id: besoin.id,
        objet: besoin.titre,
        type_depense: besoin.type_depense,
        montant_estime: besoin.montant_total_estime || 0,
        statut: 'dossier_genere',
        created_by: req.user.id,
      },
      { transaction: t }
    );

    // Mettre à jour l'expression avec le lien vers le dossier généré
    await besoin.update({ dossier_id: dossier.id }, { transaction: t });

    await auditService.log(
      req.user.id,
      'passation:besoin:declenche',
      'expression_besoin',
      besoin.id,
      {
        new: { dossier_id: dossier.id, dossier_reference: reference },
      }
    );

    await t.commit();
    res.status(201).json({
      success: true,
      data: { besoin, dossier },
      message: `Dossier ${reference} généré automatiquement depuis l'expression ${besoin.reference}`,
    });
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATIONS DOSSIER — Validation 2 (administrative et financière)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /passation/dossiers/:id/valider-af
 * Validation 2 : autoriser la suite par le SAF / coordination.
 * Transitions : dossier_genere→en_validation_af (préalable) puis en_validation_af→autorise
 */
async function validerAF(req, res, next) {
  try {
    const dossier = await Dossier.findByPk(req.params.id);
    if (!dossier) return res.status(404).json({ success: false, message: 'Dossier introuvable' });
    if (dossier.statut !== 'en_validation_af') {
      return res
        .status(400)
        .json({
          success: false,
          message: `Le dossier doit être "en_validation_af" (statut actuel : "${dossier.statut}")`,
        });
    }

    await dossier.update({ statut: 'autorise', valide2_par: req.user.id, valide2_le: new Date() });
    await auditService.log(
      req.user.id,
      'workflow:en_validation_af->autorise',
      'dossier',
      dossier.id,
      {
        old: { statut: 'en_validation_af' },
        new: { statut: 'autorise' },
      }
    );
    res.json({
      success: true,
      data: dossier,
      message: "Dossier autorisé. Peut passer à l'engagement.",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /passation/dossiers/:id/rejeter-af
 * Rejeter lors de la Validation 2.
 */
async function rejeterAF(req, res, next) {
  try {
    const dossier = await Dossier.findByPk(req.params.id);
    if (!dossier) return res.status(404).json({ success: false, message: 'Dossier introuvable' });
    if (dossier.statut !== 'en_validation_af') {
      return res
        .status(400)
        .json({ success: false, message: `Le dossier doit être "en_validation_af"` });
    }
    const { motif } = req.body;
    if (!motif)
      return res.status(400).json({ success: false, message: 'Le motif de rejet est obligatoire' });

    await dossier.update({
      statut: 'rejete',
      rejete2_par: req.user.id,
      rejete2_le: new Date(),
      motif_rejet2: motif,
    });
    await auditService.log(
      req.user.id,
      'workflow:en_validation_af->rejete',
      'dossier',
      dossier.id,
      { motif }
    );
    res.json({
      success: true,
      data: dossier,
      message: 'Dossier rejeté lors de la validation administrative et financière',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /passation/dossiers/:id/a-revoir-af
 * Renvoyer le dossier au demandeur depuis la Validation 2.
 */
async function aRevoirAF(req, res, next) {
  try {
    const dossier = await Dossier.findByPk(req.params.id);
    if (!dossier) return res.status(404).json({ success: false, message: 'Dossier introuvable' });
    if (dossier.statut !== 'en_validation_af') {
      return res
        .status(400)
        .json({ success: false, message: `Le dossier doit être "en_validation_af"` });
    }
    const { motif } = req.body;

    await dossier.update({ statut: 'dossier_genere', motif_rejet: motif || null });
    await auditService.log(
      req.user.id,
      'workflow:en_validation_af->dossier_genere',
      'dossier',
      dossier.id,
      { motif }
    );
    res.json({
      success: true,
      data: dossier,
      message: 'Dossier renvoyé au demandeur pour correction',
    });
  } catch (err) {
    next(err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMANDES DE COTATION
// ═══════════════════════════════════════════════════════════════════════════════

async function listDC(req, res, next) {
  try {
    const data = await DemandeCotation.findAll({
      include: [
        { model: Dossier, as: 'dossier', attributes: ['id', 'reference', 'objet', 'statut'] },
        { model: Offre, as: 'offres', include: [{ model: Fournisseur, as: 'fournisseur' }] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createDC(req, res, next) {
  try {
    // Le dossier doit être en statut 'engage' ou 'cotation_lancee'
    if (req.body.dossier_id) {
      const dossier = await Dossier.findByPk(req.body.dossier_id);
      if (
        dossier &&
        !['engage', 'impute', 'cotation_lancee', 'en_cotation', 'valide'].includes(dossier.statut)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Le dossier doit être engagé pour lancer une demande de cotation (statut actuel : "${dossier.statut}")`,
          });
      }
      // Passer le dossier en 'cotation_lancee'
      if (dossier && dossier.statut === 'engage') {
        await dossier.update({ statut: 'cotation_lancee' });
      }
    }

    const reference = await referenceService.generateDemandeCotationRef();
    const data = await DemandeCotation.create({ ...req.body, reference, created_by: req.user.id });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function showDC(req, res, next) {
  try {
    const data = await DemandeCotation.findByPk(req.params.id, {
      include: [
        { model: Dossier, as: 'dossier' },
        { model: Offre, as: 'offres', include: [{ model: Fournisseur, as: 'fournisseur' }] },
      ],
    });
    if (!data) return res.status(404).json({ success: false, message: 'DC introuvable' });

    // Indicateur : nombre de pro forma reçues
    const nbProForma = (data.offres || []).filter(
      (o) => o.type === 'pro_forma' && o.statut !== 'rejete'
    ).length;
    res.json({
      success: true,
      data: { ...data.toJSON(), nb_pro_forma: nbProForma, seuil_atteint: nbProForma >= 3 },
    });
  } catch (err) {
    next(err);
  }
}

async function updateDC(req, res, next) {
  try {
    const dc = await DemandeCotation.findByPk(req.params.id);
    if (!dc) return res.status(404).json({ success: false, message: 'DC introuvable' });
    await dc.update(req.body);
    res.json({ success: true, data: dc });
  } catch (err) {
    next(err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OFFRES / PRO FORMA
// ═══════════════════════════════════════════════════════════════════════════════

async function listOffres(req, res, next) {
  try {
    const where = req.query.dc_id ? { demande_cotation_id: req.query.dc_id } : {};
    const data = await Offre.findAll({
      where,
      include: [{ model: Fournisseur, as: 'fournisseur' }],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /passation/offres
 * Enregistrer une offre / pro forma.
 * Le type par défaut est 'pro_forma'.
 * Une fois enregistrée, si le dossier est en 'cotation_lancee', il passe en 'offres_recues'
 * (automatiquement dès la 1re offre ; le passage en analyse se fait manuellement).
 */
async function createOffre(req, res, next) {
  try {
    const data = await Offre.create({ type: 'pro_forma', ...req.body });

    // Mettre le dossier en 'offres_recues' si encore en 'cotation_lancee'
    if (req.body.demande_cotation_id) {
      const dc = await DemandeCotation.findByPk(req.body.demande_cotation_id, {
        include: [{ model: Dossier, as: 'dossier' }],
      });
      if (dc?.dossier && dc.dossier.statut === 'cotation_lancee') {
        await dc.dossier.update({ statut: 'offres_recues' });
      }
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /passation/offres/:id/retenir
 * Validation 3 : marquer une offre comme retenue après analyse comparative.
 *
 * Règles :
 *   - Pour fournitures : 3 pro forma minimum requis
 *   - Une seule offre peut être retenue par demande de cotation
 *   - Le dossier passe en 'offre_retenue'
 */
async function retenirOffre(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const offre = await Offre.findByPk(req.params.id, {
      include: [
        {
          model: DemandeCotation,
          as: 'demande_cotation',
          include: [
            { model: Offre, as: 'offres' },
            { model: Dossier, as: 'dossier' },
          ],
        },
      ],
    });
    if (!offre) return res.status(404).json({ success: false, message: 'Offre introuvable' });

    const dc = offre.demande_cotation;
    const dossier = dc?.dossier;

    // Vérifier le minimum de 3 pro forma pour les achats/fournitures
    if (dossier && ['fournitures', 'travaux', 'services'].includes(dossier.type_depense)) {
      const nbProForma = (dc.offres || []).filter(
        (o) => o.type === 'pro_forma' && o.statut !== 'rejete'
      ).length;
      if (nbProForma < 3) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `La procédure exige au moins 3 pro forma (${nbProForma} reçue(s)). Enregistrez les pro forma manquantes avant de sélectionner.`,
        });
      }
    }

    // Lever la retenue des autres offres de la même DC
    await Offre.update(
      { retenue: false, date_retenue: null, retenu_par: null },
      {
        where: { demande_cotation_id: offre.demande_cotation_id },
        transaction: t,
      }
    );

    // Marquer cette offre comme retenue
    await offre.update(
      {
        retenue: true,
        date_retenue: new Date(),
        retenu_par: req.user.id,
        statut: 'valide',
      },
      { transaction: t }
    );

    // Faire avancer le dossier vers 'offre_retenue'
    if (dossier && ['analyse_en_cours', 'offres_recues'].includes(dossier.statut)) {
      await dossier.update({ statut: 'offre_retenue' }, { transaction: t });
    }

    await auditService.log(req.user.id, 'passation:offre:retenue', 'offre', offre.id, {
      new: { retenu_par: req.user.id, dossier_statut: 'offre_retenue' },
    });

    await t.commit();
    res.json({
      success: true,
      data: offre,
      message: "Offre retenue. Le dossier est prêt pour l'imputation budgétaire.",
    });
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMPUTATION BUDGÉTAIRE — Validation 4
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /passation/dossiers/:id/imputer
 * Validation 4 : vérifier la disponibilité budgétaire et imputer.
 *
 * Cas A — Ligne disponible : statut → 'impute', montant_engage mis à jour
 * Cas B — Ligne insuffisante : statut → 'ligne_insuffisante', retour centre validation
 */
async function imputerBudget(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const dossier = await Dossier.findByPk(req.params.id);
    if (!dossier) return res.status(404).json({ success: false, message: 'Dossier introuvable' });
    if (dossier.statut !== 'en_imputation') {
      return res
        .status(400)
        .json({
          success: false,
          message: `Le dossier doit être "en_imputation" (statut actuel : "${dossier.statut}")`,
        });
    }
    if (!dossier.ligne_budgetaire_id) {
      return res
        .status(400)
        .json({ success: false, message: 'Aucune ligne budgétaire rattachée au dossier' });
    }

    const montant = parseFloat(req.body.montant_engage || dossier.montant_estime || 0);
    const { disponible, suffisant, budget, engage } = await budgetService.checkAvailability(
      dossier.ligne_budgetaire_id,
      montant
    );

    if (suffisant) {
      // Cas A — Imputation validée
      await budgetService.engager(dossier.ligne_budgetaire_id, montant, t);
      await dossier.update(
        {
          statut: 'impute',
          montant_engage: montant,
          imputation_validee_par: req.user.id,
          imputation_validee_le: new Date(),
        },
        { transaction: t }
      );

      await auditService.log(req.user.id, 'workflow:en_imputation->impute', 'dossier', dossier.id, {
        new: { statut: 'impute', montant_engage: montant },
      });

      await t.commit();
      return res.json({
        success: true,
        data: dossier,
        budget_info: { disponible, budget, engage, suffisant: true },
        message: `Imputation validée. Montant engagé : ${montant.toLocaleString('fr-FR')} XOF. Le dossier peut maintenant faire l'objet d'un bon de commande.`,
      });
    } else {
      // Cas B — Ligne insuffisante : bloquer, renvoyer au centre de validation
      await dossier.update(
        {
          statut: 'ligne_insuffisante',
          motif_ligne_insuffisante: `Disponible : ${disponible.toLocaleString('fr-FR')} XOF — Demandé : ${montant.toLocaleString('fr-FR')} XOF`,
        },
        { transaction: t }
      );

      await auditService.log(
        req.user.id,
        'workflow:en_imputation->ligne_insuffisante',
        'dossier',
        dossier.id,
        {
          new: { statut: 'ligne_insuffisante', disponible, montant_demande: montant },
        }
      );

      await t.commit();
      return res.json({
        success: true,
        data: dossier,
        budget_info: { disponible, budget, engage, suffisant: false },
        message: `Ligne budgétaire insuffisante. Disponible : ${disponible.toLocaleString('fr-FR')} XOF. Dossier renvoyé au centre de validation pour arbitrage.`,
      });
    }
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYSES COMPARATIVES
// ═══════════════════════════════════════════════════════════════════════════════

async function createAnalyse(req, res, next) {
  try {
    const data = await AnalyseComparative.create({ ...req.body, created_by: req.user.id });

    // Le dossier passe en 'analyse_en_cours' si encore en 'offres_recues'
    if (req.body.dossier_id) {
      const dossier = await Dossier.findByPk(req.body.dossier_id);
      if (dossier && dossier.statut === 'offres_recues') {
        await dossier.update({ statut: 'analyse_en_cours' });
      }
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function showAnalyse(req, res, next) {
  try {
    const data = await AnalyseComparative.findByPk(req.params.id, {
      include: [
        {
          model: DemandeCotation,
          as: 'demande_cotation',
          include: [
            { model: Offre, as: 'offres', include: [{ model: Fournisseur, as: 'fournisseur' }] },
          ],
        },
        { model: Fournisseur, as: 'fournisseur_selectionne' },
      ],
    });
    if (!data) return res.status(404).json({ success: false, message: 'Analyse introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ATTRIBUTIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function listAttributions(req, res, next) {
  try {
    const data = await Attribution.findAll({
      include: [
        { model: Dossier, as: 'dossier', attributes: ['id', 'reference', 'objet'] },
        { model: Fournisseur, as: 'fournisseur' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createAttribution(req, res, next) {
  try {
    const data = await Attribution.create({ ...req.body, created_by: req.user.id });
    await auditService.log(req.user.id, 'passation:attribution', 'attribution', data.id, {
      new: req.body,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ─── exports ─────────────────────────────────────────────────────────────────

module.exports = {
  // Expressions de besoin
  listBesoins,
  showBesoin,
  createBesoin,
  updateBesoin,
  soumettreBesoin,
  validerBesoin,
  rejeterBesoin,
  aRevoirBesoin,
  declencherBesoin,

  // Validation 2 — A&F
  validerAF,
  rejeterAF,
  aRevoirAF,

  // Demandes de cotation
  listDC,
  createDC,
  showDC,
  updateDC,

  // Offres / pro forma
  listOffres,
  createOffre,
  retenirOffre,

  // Validation 4 — Imputation
  imputerBudget,

  // Analyses comparatives
  createAnalyse,
  showAnalyse,

  // Attributions
  listAttributions,
  createAttribution,
};
