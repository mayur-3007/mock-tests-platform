const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password@123',
  database: 'mock_test',
})

module.exports = pool
