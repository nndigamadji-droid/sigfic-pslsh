const express = require('express');
const router = express.Router();
const { Beneficiaire } = require('../models');

router.get('/', async (req, res) => {
  const data = await Beneficiaire.findAll({ order: [['nom', 'ASC']] });
  res.json({ success: true, data });
});
router.post('/', async (req, res) => {
  const data = await Beneficiaire.create(req.body);
  res.status(201).json({ success: true, data });
});
router.put('/:id', async (req, res) => {
  const b = await Beneficiaire.findByPk(req.params.id);
  if (!b) return res.status(404).json({ success: false, message: 'Introuvable' });
  await b.update(req.body);
  res.json({ success: true, data: b });
});

module.exports = router;
