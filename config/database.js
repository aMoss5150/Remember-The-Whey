const {
  db: { username, password, database, host },
} = require('./index');

module.exports = {
  development: {
    username,
    password,
    database,
    host,
    dialect: 'postgres',
    seederStorage: 'sequelize',
  },
  production: {
    use_env_variable: 'postgres://ksjsemxfdayqwy:1f46325f673aa0bd58be6d10b6503b43b1c5d5da1b9e26fe2e4223d245924780@ec2-107-22-245-82.compute-1.amazonaws.com:5432/d4sp0snsimon9c',
    dialect: 'postgres',
    seederStorage: 'sequelize',
  }
};
