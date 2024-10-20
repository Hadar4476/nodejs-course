const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'Hadtriolla8699377!', {
  dialect: 'mysql',
  // default value is localhost
  host: 'localhost',
});

module.exports = sequelize;
