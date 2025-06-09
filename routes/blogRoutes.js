const express = require('express');
const blogController = require('../controllers/blogController');

const router = express.Router();

// Créer un article de blog (admin uniquement)
router.post('/create', async (req, res) => {
    try {
        const user = req.body.user; // L'utilisateur doit être passé dans le body ou via un middleware d'authentification
        const blog = await blogController.createBlog(user, req.body.blogData);
        res.status(201).json(blog);
    } catch (error) {
        res.status(403).send(error.message);
    }
});

// Récupérer tous les articles de blog (public)
router.get('/', async (req, res) => {
    try {
        const blogs = await blogController.getAllBlogs();
        res.status(200).json(blogs);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Récupérer un article de blog par ID (public)
router.get('/:id', async (req, res) => {
    try {
        const blog = await blogController.getBlogById(req.params.id);
        res.status(200).json(blog);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Gérer les signalements de commentaires (admin uniquement)
router.post('/handle-report', async (req, res) => {
    try {
        const { user, commentId, action } = req.body;
        await blogController.handleReportedComment(user, commentId, action);
        res.status(200).send('Signalement traité.');
    } catch (error) {
        res.status(403).send(error.message);
    }
});

module.exports = router;
