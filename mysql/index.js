var config = require('../config/config')
var mysql = require('mysql')

function __connection() {
    var connection = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database
    })
    connection.connect()
    return connection
}
exports.query = function(sql, parmas = null) {
    let connection = __connection()
    return new Promise(function(reject, resolve) {
        connection.query(sql, parmas, function(err, res, field) {
            if (err) throw err
            reject(res)
        })
        connection.end()
    })
}