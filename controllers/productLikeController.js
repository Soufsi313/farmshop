const ProductLike = require('../models/ProductLike');

module.exports = {
  // Ajouter un like
  async like(req, res) {
    try {
      const { userId, productId } = req.body;
      await ProductLike.findOrCreate({ where: { userId, productId } });
      res.status(201).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  // Supprimer un like
  async unlike(req, res) {
    try {
      const { userId, productId } = req.body;
      await ProductLike.destroy({ where: { userId, productId } });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  // Compter les likes d'un produit
  async count(req, res) {
    try {
      const { productId } = req.params;
      const count = await ProductLike.count({ where: { productId } });
      res.json({ productId, likeCount: count });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  // Vérifier si un utilisateur a liké
  async isLiked(req, res) {
    try {
      const { userId, productId } = req.query;
      const like = await ProductLike.findOne({ where: { userId, productId } });
      res.json({ liked: !!like });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
