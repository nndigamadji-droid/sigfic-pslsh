const { ArticleStock, MouvementStock, Immobilisation, Fournisseur, Dossier } = require('../models');
const auditService = require('../services/audit.service');
const { Op } = require('sequelize');

async function listArticles(req, res, next) {
  try {
    const data = await ArticleStock.findAll({ order: [['designation', 'ASC']] });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createArticle(req, res, next) {
  try {
    const data = await ArticleStock.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function showArticle(req, res, next) {
  try {
    const data = await ArticleStock.findByPk(req.params.id, {
      include: [{ model: MouvementStock, as: 'mouvements', order: [['date_mouvement', 'DESC']] }],
    });
    if (!data) return res.status(404).json({ success: false, message: 'Article introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function listMouvements(req, res, next) {
  try {
    const where = {};
    if (req.query.article_id) where.article_id = req.query.article_id;
    if (req.query.type) where.type_mouvement = req.query.type;
    const data = await MouvementStock.findAll({
      where,
      include: [{ model: ArticleStock, as: 'article', attributes: ['id', 'code', 'designation'] }],
      order: [['date_mouvement', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createMouvement(req, res, next) {
  try {
    const { article_id, type_mouvement, quantite } = req.body;
    const article = await ArticleStock.findByPk(article_id);
    if (!article) return res.status(404).json({ success: false, message: 'Article introuvable' });

    if (type_mouvement === 'sortie' && article.stock_actuel < quantite) {
      return res.status(400).json({ success: false, message: 'Stock insuffisant' });
    }

    const mouvement = await MouvementStock.create({ ...req.body, agent_id: req.user.id });

    const delta = type_mouvement === 'entree' ? parseFloat(quantite) : -parseFloat(quantite);
    await article.update({ stock_actuel: parseFloat(article.stock_actuel) + delta });

    res.status(201).json({ success: true, data: mouvement });
  } catch (err) {
    next(err);
  }
}

async function listImmobilisations(req, res, next) {
  try {
    const data = await Immobilisation.findAll({
      include: [{ model: Fournisseur, as: 'fournisseur', attributes: ['id', 'raison_sociale'] }],
      order: [['designation', 'ASC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function createImmobilisation(req, res, next) {
  try {
    const data = await Immobilisation.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function showImmobilisation(req, res, next) {
  try {
    const data = await Immobilisation.findByPk(req.params.id, {
      include: [
        { model: Fournisseur, as: 'fournisseur' },
        { model: Dossier, as: 'dossier', attributes: ['id', 'reference'] },
      ],
    });
    if (!data)
      return res.status(404).json({ success: false, message: 'Immobilisation introuvable' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listArticles,
  createArticle,
  showArticle,
  listMouvements,
  createMouvement,
  listImmobilisations,
  createImmobilisation,
  showImmobilisation,
};
