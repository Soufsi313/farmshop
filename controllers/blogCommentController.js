const { BlogComment } = require('../models');

const blogCommentController = {
    // Modifier un commentaire (seulement par l'auteur)
    updateComment: async (req, res) => {
        try {
            const { id } = req.params; // id du commentaire
            const userId = req.user.id;
            const { content } = req.body;
            const comment = await BlogComment.findByPk(id);
            if (!comment) return res.status(404).json({ message: 'Commentaire non trouvé.' });
            if (comment.userId !== userId) return res.status(403).json({ message: 'Non autorisé.' });
            comment.content = content;
            await comment.save();
            res.json({ comment });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    // Supprimer un commentaire (seulement par l'auteur)
    deleteComment: async (req, res) => {
        try {
            const { id } = req.params; // id du commentaire
            const userId = req.user.id;
            const comment = await BlogComment.findByPk(id);
            if (!comment) return res.status(404).json({ message: 'Commentaire non trouvé.' });
            if (comment.userId !== userId) return res.status(403).json({ message: 'Non autorisé.' });
            await comment.destroy();
            res.json({ message: 'Commentaire supprimé.' });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },
};

module.exports = blogCommentController;
