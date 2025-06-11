const Messages = require('../models/Messages');
const User = require('../models/Users');

const messagesController = {
  // Envoyer un message
  send: async (req, res) => {
    try {
      const { toId, fromId, subject, body, threadId, documents } = req.body;
      const toUser = await User.findByPk(toId);
      if (!toUser) return res.status(404).json({ message: 'Destinataire non trouvé' });
      const newThreadId = threadId || (Date.now() + '-' + Math.random().toString(36).substr(2, 9));
      const msg = await Messages.create({
        fromId: fromId || null,
        toId,
        subject,
        body,
        threadId: newThreadId,
        documents: documents || [],
        date: new Date(),
        lu: false,
        traite: false
      });
      res.json({ message: 'Message envoyé', threadId: newThreadId, msg });
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  },

  // Lire la boîte de réception (pagination)
  inbox: async (req, res) => {
    try {
      const { toId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { count, rows } = await Messages.findAndCountAll({
        where: { toId },
        order: [['date', 'DESC']],
        offset: (page - 1) * limit,
        limit
      });
      res.json({ inbox: rows, total: count });
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  },

  // Lire les threads
  threads: async (req, res) => {
    try {
      const { toId } = req.params;
      const messages = await Messages.findAll({
        where: { toId },
        order: [['date', 'ASC']]
      });
      const threads = {};
      messages.forEach(msg => {
        if (!threads[msg.threadId]) threads[msg.threadId] = [];
        threads[msg.threadId].push(msg);
      });
      res.json({ threads });
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  },

  // Supprimer un message
  delete: async (req, res) => {
    try {
      const { toId, msgId } = req.params;
      const msg = await Messages.findOne({ where: { id: msgId, toId } });
      if (!msg) return res.status(404).json({ message: 'Message non trouvé' });
      await msg.destroy();
      res.json({ message: 'Message supprimé' });
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  },

  // Marquer comme traité
  markTreated: async (req, res) => {
    try {
      const { toId, msgId } = req.params;
      const msg = await Messages.findOne({ where: { id: msgId, toId } });
      if (!msg) return res.status(404).json({ message: 'Message non trouvé' });
      msg.traite = true;
      await msg.save();
      res.json({ message: 'Message marqué comme traité' });
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  },

  // Marquer comme lu
  markRead: async (req, res) => {
    try {
      const { toId, msgId } = req.params;
      const msg = await Messages.findOne({ where: { id: msgId, toId } });
      if (!msg) return res.status(404).json({ message: 'Message non trouvé' });
      msg.lu = true;
      await msg.save();
      res.json({ message: 'Message marqué comme lu' });
    } catch (err) {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  }
};

module.exports = messagesController;
