var https = require('https');
var querystring = require('querystring');
var DB = require('./DB_base');
var sms_config = require('./config.js').SMS_config;
var moment = require('moment');
var schedule = require("node-schedule");
var getSlaveInfo = function (cb) {
    var sql = "SELECT * FROM tb_slave;" ;
    DB.queryDb(sql, '', cb);
};
var sendSMS = function (mobile, money) {
    this.apikey = sms_config.apiKey;
    this.sms_host = 'sms.yunpian.com';
    this.send_tpl_sms_uri = '/v2/sms/tpl_single_send.json';
    this.send_tpl_sms_register_id = sms_config.send_tpl_sms_register_id;

    console.log(this.apikey);
    console.log(this.sms_host);
    try {
        console.log("SMS_Service sendRegisterSMS mobile：" + mobile + " money：" + 'money' );
        var post_data = {
            'apikey': this.apikey,
            'mobile': mobile,
            'tpl_id': this.send_tpl_sms_register_id,
            'tpl_value': querystring.stringify({'#money#': money,'#phone#':mobile})
        };
        var content = querystring.stringify(post_data);
        console.log("SMS_Service sentSMS uri：" + this.send_tpl_sms_uri + " content：" + content + " host:" + this.sms_host);
        var options = {
            hostname: this.sms_host,
            port: 443,
            path: this.send_tpl_sms_uri,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        };
        var req = https.request(options, function (res) {
            var chunks ;
            res.setEncoding('utf8');
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                chunks = chunk;
            });
            res.on('end', function () {
                try {
                    console.log('SMS_BODY: ' + chunks.toString());
                    var resData = JSON.parse(chunks.toString());
                    console.log(resData);
                    if (resData.code != 0) {
                        console.log("SMS_Service sentSMS uri error");
                        console.log(resData.msg + resData.detail);
                    }
                    else {
                        console.log("SMS_Service sentSMS uri success");
                    }
                }
                catch (e) {
                    console.log("SMS_Service sentSMS (res.on data) error");
                    console.log(e.stack);
                }
            });
        });
        req.write(content);
        req.end();
    }
    catch (e) {
        console.log("SMS_Service sendRegisterSMS error:" + e.stack);
    }
};
var filterSlave = function (slaveList) {
      for (var i = 0 ; i < slaveList.length ; i ++){
          if (slaveList[i].sms_phone && slaveList[i].sms_phone.length > 1){
              var filterMoney = slaveList[i].money_alarm;
              var money = slaveList[i].slave_money;
              if (isNaN(filterMoney) || isNaN(money)){
                  console.log('money');
                  continue ;
              }
              money = parseFloat(money);
              filterMoney = parseFloat(filterMoney);
              if (money < filterMoney){
                  sendSMS(slaveList[i].sms_phone, slaveList[i].money_alarm);
              }
          }
      }
};
var rule = new schedule.RecurrenceRule();
rule.hour = [9,12,15,19,21,22];
rule.minute = 0;
//rule.second = [1,35];
var j = schedule.scheduleJob(rule, function(){
    console.log(moment().format('YYYY-MM-DD HH:mm:ss.SSS') + " start ");
    getSlaveInfo(function (err, rows) {
        if (err){
            console.log(err);
        }
        else {
            console.log('start schedul111e!!!');
            //filterSlave(rows);
        }
    });

});
console.log('start schedule!!!');