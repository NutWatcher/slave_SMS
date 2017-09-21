/**
 * Created by lyy on 2017/9/20.
 */

var DB_config = {
    "host": "127.0.0.1",
    "port": "3306",
    "database": "",
    "multipleStatements": "true",
    "connectionLimit":1,
    "user": "",
    "password": ""
};
var SMS_config ={
    apiKey:"",
    send_tpl_sms_register_id:""
};
console.log(DB_config);
console.log(SMS_config);
exports.SMS_config = SMS_config;
exports.DB_config = DB_config;