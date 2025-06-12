const CartItem = require('../models/CartItem');

module.exports = {
  // Get all cart items for a user/cart
  async getAll(req, res) {
    try {
      const { cartId } = req.params;
      const items = await CartItem.findAll({ where: { cartId } });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Add a product to cart
  async add(req, res) {
    try {
      const { cartId, productId, quantity } = req.body;
      const item = await CartItem.create({ cartId, productId, quantity });
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update quantity
  async update(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const item = await CartItem.findByPk(id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      item.quantity = quantity;
      await item.save();
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Remove item
  async remove(req, res) {
    try {
      const { id } = req.params;
      const item = await CartItem.findByPk(id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      await item.destroy();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
