'use strict';
//nothing

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Tasks', [{
      name: 'Test',
      complete: false,
      repeats: false,
      date: '2021-5-1',
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
      repeats: false,
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
      repeats: false,
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
      repeats: false,
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
      repeats: false,
      notes: "This is my notes.",
      listId: 3,
      sets: 3,
      reps: 8,
      duration: 45,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'Overhead Press',
      complete: false,
      repeats: false,
      notes: "Overhead.",
      listId: 6,
      sets: 5,
      reps: 5,
      duration: 60,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'Military Press',
      complete: false,
      repeats: false,
      notes: "This is my notes.",
      listId: 6,
      sets: 2,
      reps: 10,
      duration: 45,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'Lat Pulldown',
      complete: false,
      repeats: false,
      notes: "Lat pulldown.",
      listId: 7,
      sets: 5,
      reps: 5,
      duration: 60,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      name: 'Chin Up',
      complete: false,
      repeats: false,
      notes: "This is my notes.",
      listId: 7,
      sets: 2,
      reps: 10,
      duration: 45,
      createdAt: new Date(),
      updatedAt: new Date()
    }
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
