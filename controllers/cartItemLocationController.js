const CartItemLocation = require('../models/CartItemLocation');

module.exports = {
  // Get all cart location items for a cartLocation
  async getAll(req, res) {
    try {
      const { cartLocationId } = req.params;
      const items = await CartItemLocation.findAll({ where: { cartLocationId } });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Add a product to cart location
  async add(req, res) {
    try {
      const { cartLocationId, productId, quantity, duration } = req.body;
      const item = await CartItemLocation.create({ cartLocationId, productId, quantity, duration });
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Update quantity or duration
  async update(req, res) {
    try {
      const { id } = req.params;
      const { quantity, duration } = req.body;
      const item = await CartItemLocation.findByPk(id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      if (quantity !== undefined) item.quantity = quantity;
      if (duration !== undefined) item.duration = duration;
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
      const item = await CartItemLocation.findByPk(id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      await item.destroy();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
