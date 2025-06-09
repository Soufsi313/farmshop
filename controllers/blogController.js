const Blog = require('../models/Blogs');
const { User } = require('../models/Users');

const blogController = {
    // Création d'un article de blog (admin uniquement)
    createBlog: async (user, blogData) => {
        if (user.role !== 'Admin') {
            throw new Error('Permission refusée : Seul un administrateur peut créer un article de blog.');
        }
        try {
            const blog = await Blog.create(blogData);
            console.log(`Article de blog créé : ${blog.title}`);
            return blog;
        } catch (error) {
            console.error('Erreur lors de la création de l’article de blog :', error);
            throw error;
        }
    },

    // Consultation des articles de blog (public)
    getAllBlogs: async () => {
        try {
            const blogs = await Blog.findAll();
            return blogs;
        } catch (error) {
            console.error('Erreur lors de la récupération des articles de blog :', error);
            throw error;
        }
    },

    // Consultation d'un article de blog par ID (public)
    getBlogById: async (id) => {
        try {
            const blog = await Blog.findByPk(id);
            return blog;
        } catch (error) {
            console.error('Erreur lors de la récupération de l’article de blog :', error);
            throw error;
        }
    },

    // Gestion des signalements de commentaires (admin uniquement)
    handleReportedComment: async (user, commentId, action) => {
        if (user.role !== 'Admin') {
            throw new Error('Permission refusée : Seul un administrateur peut gérer les signalements.');
        }
        // Logique de gestion à implémenter selon la structure des commentaires
        console.log(`Signalement du commentaire ${commentId} traité par l'admin avec l'action : ${action}`);
    },
};

module.exports = blogController;
