const { Category } = require('../models');
const { Op } = require('sequelize');

const categoryController = {
    // Create a new category (admin only)
    createCategory: async (req, res) => {
        try {
            const { name, description } = req.body;
            const category = await Category.create({ name, description });
            res.status(201).json({ category });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    // Get all categories (with pagination, tri, recherche)
    getAllCategories: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const offset = (page - 1) * limit;
            const orderBy = req.query.orderBy || 'name';
            const orderDir = req.query.orderDir === 'DESC' ? 'DESC' : 'ASC';
            const search = req.query.search || '';
            const where = {};
            if (search) {
                where.name = { [Op.iLike]: `%${search}%` };
            }
            const { count, rows } = await Category.findAndCountAll({
                where,
                order: [[orderBy, orderDir]],
                offset,
                limit
            });
            res.json({ categories: rows, total: count });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Update a category (admin only)
    updateCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description } = req.body;
            const category = await Category.findByPk(id);
            if (!category) return res.status(404).json({ message: 'Category not found' });
            category.name = name;
            category.description = description;
            await category.save();
            res.json({ category });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    // Delete a category (admin only)
    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);
            if (!category) return res.status(404).json({ message: 'Category not found' });
            await category.destroy();
            res.json({ message: 'Category deleted' });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },
};

module.exports = categoryController;
