/**
 * Created by lyy on 2015/10/5.
 */
var moment = require('moment');
var mysql = require('mysql');
var dbConfig = require('./config.js').DB_config;
var pool  = mysql.createPool({
    "host": dbConfig.host,
    "port": dbConfig.port,
    "database": dbConfig.database,
    "multipleStatements": dbConfig.multipleStatements||false,
    "user": dbConfig.user,
    "password": dbConfig.password,
    "connectionLimit": dbConfig.connectionLimit||5
});

var log = {
    info:function (str) {
        console.log(str);
    }
};
var queryDbStream = function (strSqls, cb, endCb) {
    var strSql = "" ;
    for ( var i = 0 ; i < strSqls.length ; i ++ ){
        strSql += strSqls[i] ;
    }
    pool.getConnection(function(err, connection) {
        // Use the connection
        if (err) {
            cb(err);
            return ;
        }
        var query = connection.query(strSql);
        query
            .on('error', function(err) {
                // Handle error, an 'end' event will be emitted after this as well
                if (err) {
                    cb(err);
                    connection.release();
                }
            })
            .on('fields', function(fields, index) {
                // the fields for the result rows that follow
            })
            .on('result', function(row, index) {
                // index refers to the statement this result belongs to (starts at 0)
                if ( cb ){
                    cb("",row,index) ;
                }
            })
            .on('end', function() {
                // all rows have been received
                connection.release();
                endCb();
            });
    });
};
var queryDb = function (strSql, logInfo, cb) {
    if (cb === undefined){
        cb = logInfo ;
        logInfo =  moment().format('YYYY-MM-DD HH:mm:ss.SSS' + ' ');
    }
    console.log(logInfo);
    log.info(logInfo+ strSql);
    pool.getConnection(function(err, connection) {
        if (err) {
            cb(err);
            return ;
        }
        connection.query( strSql , function(err, rows) {
            // And done with the connection.
            if (err) {
                cb(err);
                connection.release();
                return;
            }
            cb(err, rows);

            connection.release();
            // Don't use the connection here, it has been returned to the pool.
        });
    });
};
exports.beginTransactions = function(cb){
    pool.getConnection(function(err, connection) {
        if (err) {
            cb(err);
            return ;
        }
        connection.beginTransaction(function(err) {
            if (!err) {
                cb(null, connection);
            } else {
                cb(err);
            }
        });
    });
};
exports.queryTransactions = function(connection, strSql, logInfo, cb){
    if (cb === undefined){
        cb = logInfo ;
        logInfo =  moment().format('YYYY-MM-DD HH:mm:ss.SSS' + ' ');
    }
    log.info(logInfo + strSql);
    connection.query( strSql , function(err, rows) {
        if (err) {
            cb(err);
            return;
        }
        cb(err, rows);
    });
};
exports.endTransactions = function(connection, cb){
    connection.release();
};
exports.queryDb = function (strSql, logInfo, cb) {
    queryDb(strSql,cb);
};
exports.queryDbStream = function (strSql,cb) {
    queryDbStream(strSql,cb);
};
exports.escape = function(data){
    return pool.escape(data) ;
};