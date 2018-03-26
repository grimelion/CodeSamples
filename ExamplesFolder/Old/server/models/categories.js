'use strict';

module.exports = function(sequelize, DataTypes) {
  const Categories = sequelize.define('Categories', {
    appId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    catId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    subcatTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dateStart: {
      type: DataTypes.DATE,
      allowNull: true
    },
  },
  {
    indexes: [{
      unique: true,
      fields: ['appId', 'country', 'catId', 'subcatTitle', 'dateStart']
    }],
    associate(models) {
      Categories.belongsToMany(models.Apps, {
        foreignKey: 'appId',
        as: 'cats'
      });
    }
  });
  return Categories;
};
