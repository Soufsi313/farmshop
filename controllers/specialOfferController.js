const { SpecialOffer, Products } = require('../models');
const { Op } = require('sequelize');

const specialOfferController = {
    // Create a new special offer (admin only)
    createOffer: async (req, res) => {
        try {
            const { name, description, discountType, discountValue, minQuantity, startDate, endDate, productId } = req.body;
            // Check if product already has an active offer in the same period
            const overlap = await SpecialOffer.findOne({
                where: {
                    productId,
                    [Op.or]: [
                        {
                            startDate: { [Op.lte]: endDate },
                            endDate: { [Op.gte]: startDate }
                        }
                    ]
                }
            });
            if (overlap) return res.status(400).json({ message: 'This product already has an active or overlapping offer.' });
            const offer = await SpecialOffer.create({ name, description, discountType, discountValue, minQuantity, startDate, endDate, productId });
            res.status(201).json({ offer });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    // Get all current offers (public)
    getActiveOffers: async (req, res) => {
        try {
            const now = new Date();
            const offers = await SpecialOffer.findAll({
                where: {
                    startDate: { [Op.lte]: now },
                    endDate: { [Op.gte]: now }
                },
                include: [{ model: Products, as: 'product' }]
            });
            res.json({ offers });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Get all offers (admin)
    getAllOffers: async (req, res) => {
        try {
            const offers = await SpecialOffer.findAll({ include: [{ model: Products, as: 'product' }] });
            res.json({ offers });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Update an offer (admin only)
    updateOffer: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, discountType, discountValue, minQuantity, startDate, endDate } = req.body;
            const offer = await SpecialOffer.findByPk(id);
            if (!offer) return res.status(404).json({ message: 'Offer not found' });
            Object.assign(offer, { name, description, discountType, discountValue, minQuantity, startDate, endDate });
            await offer.save();
            res.json({ offer });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    // Delete an offer (admin only)
    deleteOffer: async (req, res) => {
        try {
            const { id } = req.params;
            const offer = await SpecialOffer.findByPk(id);
            if (!offer) return res.status(404).json({ message: 'Offer not found' });
            await offer.destroy();
            res.json({ message: 'Offer deleted' });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    // Remove expired offers (can be called by cron or manually)
    removeExpiredOffers: async (req, res) => {
        try {
            const now = new Date();
            const count = await SpecialOffer.destroy({ where: { endDate: { [Op.lt]: now } } });
            res.json({ message: `${count} expired offers removed.` });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
};

module.exports = specialOfferController;
