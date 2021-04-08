'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      complete: {
        defaultValue: false,
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      date: {
        type: Sequelize.DATEONLY
      },
      repeats: {
        defaultValue: false,
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      notes: {
        type: Sequelize.TEXT
      },
      listId: {
        references: { model: 'Lists' },
        allowNull: false,
        type: Sequelize.INTEGER
      },
      sets: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      reps: {
        type: Sequelize.INTEGER
      },
      duration: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Tasks');
  }
};
