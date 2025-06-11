const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Messages = sequelize.define('Messages', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fromId: {
    type: DataTypes.INTEGER,
    allowNull: true, // null pour les messages anonymes
  },
  toId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  threadId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lu: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  traite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  documents: {
    type: DataTypes.TEXT, // JSON.stringify([])
    allowNull: true,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('documents');
      try { return raw ? JSON.parse(raw) : []; } catch { return []; }
    },
    set(val) {
      this.setDataValue('documents', JSON.stringify(val || []));
    }
  }
}, {
  timestamps: true,
  paranoid: true // Soft delete
});

module.exports = Messages;
