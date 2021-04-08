'use strict';
module.exports = (sequelize, DataTypes) => {
  const List = sequelize.define('List', {
    name: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {});
  List.associate = function (models) {
    List.belongsTo(models.User, { foreignKey: 'userId' })
    List.hasMany(models.Task, { foreignKey: 'listId' })
    // associations can be defined here
  };
  return List;
};
