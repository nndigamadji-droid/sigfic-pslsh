const { Document, DocumentType, Dossier } = require('../models');
const path = require('path');
const fs = require('fs');
const auditService = require('../services/audit.service');

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.dossier_id) where.dossier_id = req.query.dossier_id;
    const data = await Document.findAll({
      where,
      include: [{ model: DocumentType, as: 'type', attributes: ['id', 'code', 'libelle'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function upload(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Aucun fichier reçu' });
    const { dossier_id, type_id, description } = req.body;

    const doc = await Document.create({
      dossier_id: dossier_id || null,
      type_id: type_id || null,
      nom_original: req.file.originalname,
      nom_stocke: req.file.filename,
      chemin_stockage: req.file.path,
      mime_type: req.file.mimetype,
      taille_octets: req.file.size,
      description,
      uploaded_by: req.user.id,
    });

    await auditService.log(req.user.id, 'documents:upload', 'document', doc.id, {
      new: { nom_original: req.file.originalname },
    });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

async function download(req, res, next) {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document introuvable' });
    if (!fs.existsSync(doc.chemin_stockage))
      return res
        .status(404)
        .json({ success: false, message: 'Fichier introuvable sur le serveur' });
    res.download(doc.chemin_stockage, doc.nom_original);
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document introuvable' });
    if (fs.existsSync(doc.chemin_stockage)) fs.unlinkSync(doc.chemin_stockage);
    await doc.destroy();
    await auditService.log(req.user.id, 'documents:delete', 'document', doc.id, {});
    res.json({ success: true, message: 'Document supprimé' });
  } catch (err) {
    next(err);
  }
}

async function listTypes(req, res, next) {
  try {
    const data = await DocumentType.findAll({ order: [['libelle', 'ASC']] });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, upload, download, destroy, listTypes };
