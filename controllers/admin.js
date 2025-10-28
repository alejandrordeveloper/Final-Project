const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// List products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error listing products' });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, stock, image } = req.body;
    const p = new Product({ name, description, price, stock, image });
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    res.status(400).json({ error: 'Error creating product' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const update = req.body;
    const p = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json(p);
  } catch (err) {
    res.status(400).json({ error: 'Error updating product' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Error deleting product' });
  }
});

module.exports = router;
