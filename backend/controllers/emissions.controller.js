/* ════════════════════════════════════════════════════════════════════════════
   Émissions comptables — controller unifié pour les 4 types de pièces.
   Toute émission incrémente automatiquement une référence séquentielle,
   horodate la signature et enregistre le signataire.
   ════════════════════════════════════════════════════════════════════════════ */
const { AvisComptable, OrdreVirement, BordereauPaie, Decharge, Notification } = require('../models');
const crypto = require('crypto');

function makeRef(prefix) {
  const ts = Date.now().toString().slice(-6);
  return `${prefix}-${new Date().getFullYear()}-${ts}`;
}
function sign(content) {
  return crypto.createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

/* ─── AVIS COMPTABLE ─────────────────────────────────────────────────────── */
async function listAvis(req, res, next) {
  try {
    const rows = await AvisComptable.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
}

async function emitAvis(req, res, next) {
  try {
    const data = req.body || {};
    const reference = data.reference || makeRef('AVIS');
    const row = await AvisComptable.create({
      ...data, reference,
      signed_by: req.user.id, signed_at: new Date(),
      signature_hash: sign({ ...data, signed_by: req.user.id, t: Date.now() }),
      statut: 'emis',
    });
    res.status(201).json({ success: true, data: row });
  } catch (e) { next(e); }
}

/* ─── ORDRE DE VIREMENT ─────────────────────────────────────────────────── */
async function listOv(req, res, next) {
  try {
    const where = {};
    if (req.query.statut) where.statut = req.query.statut;
    if (req.query.dossier_ref) where.dossier_ref = req.query.dossier_ref;
    const rows = await OrdreVirement.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
}

async function emitOv(req, res, next) {
  try {
    const data = req.body || {};
    if (!data.beneficiaire_nom || !data.montant || !data.objet) {
      return res.status(400).json({ success: false, message: 'beneficiaire_nom, montant et objet requis' });
    }
    const reference = data.reference || makeRef('OV');
    const row = await OrdreVirement.create({
      ...data, reference,
      signed_by: req.user.id, signed_at: new Date(),
      statut: 'emis',
    });
    // Notif au Coordo pour ordonnancement
    try {
      await Notification.create({
        user_id: 1, type:'task', category:'paiement', priority:'high',
        title:`OV à ordonnancer : ${reference}`,
        message:`${row.beneficiaire_nom} — ${parseFloat(row.montant).toLocaleString('fr-FR')} ${row.devise}. Émis par le Comptable Principal, en attente de votre signature.`,
        icon:'file-signature',
        related_module:'paiement', related_id: String(row.id),
        action_url:'/pages/finances/ov-list.html', action_label:'Voir l\'OV',
        emitted_by: req.user.id,
      });
    } catch (_) {}
    res.status(201).json({ success: true, data: row });
  } catch (e) { next(e); }
}

async function signOrdonnance(req, res, next) {
  try {
    const ov = await OrdreVirement.findByPk(req.params.id);
    if (!ov) return res.status(404).json({ success: false, message: 'OV introuvable' });
    if (ov.statut !== 'emis') {
      return res.status(400).json({ success: false, message: `OV en statut ${ov.statut}, ordonnancement impossible` });
    }
    await ov.update({
      statut: 'ordonnance',
      ordonnance_by: req.user.id, ordonnance_at: new Date(),
    });
    res.json({ success: true, data: ov });
  } catch (e) { next(e); }
}

async function executeOv(req, res, next) {
  try {
    const ov = await OrdreVirement.findByPk(req.params.id);
    if (!ov) return res.status(404).json({ success: false, message: 'OV introuvable' });
    if (ov.statut !== 'ordonnance') {
      return res.status(400).json({ success: false, message: `OV en statut ${ov.statut}` });
    }
    await ov.update({
      statut: 'execute', execute_at: new Date(),
      num_chèque: req.body.num_cheque || null,
    });
    res.json({ success: true, data: ov });
  } catch (e) { next(e); }
}

/* ─── BORDEREAU DE PAIE ─────────────────────────────────────────────────── */
async function listPaie(req, res, next) {
  try {
    const rows = await BordereauPaie.findAll({ order: [['mois', 'DESC']] });
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
}

async function emitPaie(req, res, next) {
  try {
    const data = req.body || {};
    const lignes = Array.isArray(data.lignes) ? data.lignes : [];
    const total_brut = lignes.reduce((s, l) => s + (parseFloat(l.montant_brut) || 0), 0);
    const total_retenues = lignes.reduce((s, l) => s + (parseFloat(l.retenues) || 0), 0);
    const total_net = total_brut - total_retenues;
    const reference = data.reference || makeRef('BP');
    const row = await BordereauPaie.create({
      ...data, reference,
      nb_agents: lignes.length, total_brut, total_retenues, total_net,
      lignes_json: JSON.stringify(lignes),
      signed_by: req.user.id, signed_at: new Date(),
      statut: 'emis',
    });
    res.status(201).json({ success: true, data: row });
  } catch (e) { next(e); }
}

/* ─── DÉCHARGE ─────────────────────────────────────────────────────────── */
async function listDecharge(req, res, next) {
  try {
    const rows = await Decharge.findAll({ order: [['date_decharge', 'DESC']] });
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
}

async function emitDecharge(req, res, next) {
  try {
    const data = req.body || {};
    if (!data.beneficiaire_nom || !data.objet) {
      return res.status(400).json({ success: false, message: 'beneficiaire_nom et objet requis' });
    }
    const reference = data.reference || makeRef('DECH');
    const row = await Decharge.create({
      ...data, reference,
      emise_par: req.user.id, emise_le: new Date(),
      statut: 'emise',
    });
    res.status(201).json({ success: true, data: row });
  } catch (e) { next(e); }
}

module.exports = {
  listAvis, emitAvis,
  listOv,   emitOv, signOrdonnance, executeOv,
  listPaie, emitPaie,
  listDecharge, emitDecharge,
};
