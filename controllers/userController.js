const User = require('../models/Users');

const userController = {
    subscribeToNewsletter: async (userId) => {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('User not found');

            user.isSubscribedToNewsletter = true;
            await user.save();
            console.log(`User ${user.username} subscribed to the newsletter.`);
        } catch (error) {
            console.error('Error subscribing to newsletter:', error);
        }
    },

    unsubscribeFromNewsletter: async (userId) => {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('User not found');

            user.isSubscribedToNewsletter = false;
            await user.save();
            console.log(`User ${user.username} unsubscribed from the newsletter.`);
        } catch (error) {
            console.error('Error unsubscribing from newsletter:', error);
        }
    },

    softDeleteAccount: async (userId) => {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('User not found');

            user.isSoftDeleted = true;
            await user.destroy();
            console.log(`User ${user.username} account soft deleted.`);
        } catch (error) {
            console.error('Error soft deleting account:', error);
        }
    },

    downloadUserData: async (userId) => {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('User not found');

            user.downloadData();
        } catch (error) {
            console.error('Error downloading user data:', error);
        }
    },

    contactAdmin: async (userId, message) => {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('User not found');

            console.log(`User ${user.username} sent a message to admin: ${message}`);
        } catch (error) {
            console.error('Error contacting admin:', error);
        }
    },
};

module.exports = userController;
