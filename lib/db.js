const mysql = require('mysql')

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "timetracker",
    password: ""
})

connection.connect()

module.exports = connection