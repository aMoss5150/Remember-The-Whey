'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Lists', [{
      name: '_hidden',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Legs',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Arms',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Back',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: '_hidden',
      userId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Push',
      userId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'Pull',
      userId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Lists', null, {});
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
