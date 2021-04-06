'use strict';
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: DataTypes.STRING,
    complete: DataTypes.BOOLEAN,
    date: DataTypes.DATE,
    notes: DataTypes.TEXT,
    listId: DataTypes.INTEGER,
    sets: DataTypes.INTEGER,
    reps: DataTypes.INTEGER,
    duration: DataTypes.INTEGER
  }, {});
  Task.associate = function(models) {
    Task.belongsTo(models.List, { foreignKey: 'listId' })
    // associations can be defined here
  };
  return Task;
};
