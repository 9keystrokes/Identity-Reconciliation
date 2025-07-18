const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Contact', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    phoneNumber: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    linkedId: { type: DataTypes.INTEGER, allowNull: true },
    linkPrecedence: { type: DataTypes.ENUM('primary', 'secondary'), allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    deletedAt: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'Contacts',
    timestamps: true,
    paranoid: true,
  });
};
