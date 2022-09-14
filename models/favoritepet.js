'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class favoritepet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  favoritepet.init({
    animalId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    status: DataTypes.STRING,
    age: DataTypes.STRING,
    breed: DataTypes.STRING,
    image: DataTypes.STRING,
    gender: DataTypes.STRING,
    description: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'favoritepet',
  });
  return favoritepet;
};