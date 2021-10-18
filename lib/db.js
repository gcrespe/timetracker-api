const mysql = require('mysql')

const connection = mysql.createPool({
    host: "us-cdbr-east-04.cleardb.com",
    user: "b418c0a03e662d",
    database: "heroku_73fd6eb3c5d362b",
    password: "ef1288ed"
})

connection.connect()

module.exports = connection