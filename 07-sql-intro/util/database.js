const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'node-complete',
  password: 'Hadtriolla8699377!',
});

module.exports = pool.promise();
