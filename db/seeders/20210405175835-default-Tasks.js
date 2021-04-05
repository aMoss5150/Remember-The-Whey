'use strict';
//nothing

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Tasks', [{
      name: 'test',
      complete: false,
      notes: "This is my notes.",
      listId: 1,
      sets: 3,
      reps: 5,
      duration: 100,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Squats',
      complete: false,
      notes: "This is my notes.",
      listId: 2,
      sets: 3,
      reps: 5,
      duration: 100,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Deadlift',
      complete: false,
      notes: "This is my notes.",
      listId: 2,
      sets: 3,
      reps: 3,
      duration: 60,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Lunges',
      complete: false,
      notes: "This is my notes.",
      listId: 2,
      sets: 3,
      reps: 8,
      duration: 45,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'bicep curls',
      complete: false,
      notes: "This is my notes.",
      listId: 3,
      sets: 3,
      reps: 8,
      duration: 45,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    ], {});
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
    return queryInterface.bulkDelete("Tasks", null, {});
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
