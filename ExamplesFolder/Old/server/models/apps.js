'use strict';

module.exports = (sequelize, DataTypes) => {
  const Apps = sequelize.define('Apps', {
    appId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    downloads: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    associate(models) {
      Apps.hasMany(models.Categories, {
        foreignKey: 'appId',
        as: 'apps'
      });
    }
  });
  return Apps;
};
