const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./Users');
const Blog = require('./Blogs');

const BlogComment = sequelize.define('BlogComment', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    // Optionally: status, reported, etc.
}, {
    timestamps: true,
});

// Associations
BlogComment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
BlogComment.belongsTo(Blog, { foreignKey: 'blogId', as: 'blog' });
User.hasMany(BlogComment, { foreignKey: 'userId', as: 'blogComments' });
Blog.hasMany(BlogComment, { foreignKey: 'blogId', as: 'comments' });

module.exports = BlogComment;
