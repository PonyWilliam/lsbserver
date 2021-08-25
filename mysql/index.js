var config = require('../config/config')
var mysql = require('mysql')

function __connection() {
    var connection = mysql.createConnection({
        host:"sh-cynosdbmysql-grp-2o1mkprk.sql.tencentcdb.com",
        port:21270,
        user:"root",
        password:"xiaowei123!",
        database:"lsbserver"
    })
    connection.connect()
    return connection
}
exports.query = function(sql, parmas = null) {
    let connection = __connection()
    return new Promise(function(reject, resolve) {
        connection.query(sql, parmas, function(err, res, field) {
            if (err){
                reject(err)
            }else{
                reject(res)
            }
            
        })
        connection.end()
    })
}