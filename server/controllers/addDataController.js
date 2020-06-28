const database = require('../model/database.js');
let moment = require('moment');
let db = database.Database;

// Add new data to the database
function addData(req, res, next) {
    let ISOdateTime = moment(new Date()).format('YYYY-MM-DDTHH:mm:ss.SSS');
    let sensorObj = req.query;
    sensorObj.ISOdateTime = ISOdateTime;
    console.log(sensorObj);

    db.serialize(function () {
        db.run('CREATE TABLE IF NOT EXISTS sensors(deviceId text, ip text, temperature text, humidity text, moisture text, date text)');

        db.run(`INSERT INTO sensors(deviceId, ip, temperature, humidity, moisture, date) VALUES(?,?,?,?,?,?)`, [sensorObj.deviceId, sensorObj.ip, sensorObj.temperature, sensorObj.humidity, sensorObj.moisture, sensorObj.ISOdateTime], function(err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`Rows inserted ${this.changes}`);
        })

        db.run(`INSERT INTO alias(deviceId, ip, name) VALUES(?,?,?)`, [sensorObj.deviceId, sensorObj.ip, sensorObj.deviceId], function(err) {
            if (err) {
                try {
                    db.run(`UPDATE alias SET ip=? WHERE deviceId=?`, [sensorObj.ip, sensorObj.deviceId], function(error) {
                        if (error) {
                            console.error(error.message);
                        }
                    })
                } catch(error) {
                    console.error(error);
                    return console.error(err.message);
                }
            }
            // This doesn't work for this type of update.  Figure out how to log this info out
            console.log(`Rows inserted ${this.changes}`);
            // Add the data to the DB and on resolve
            res.status(200).send({
                success: 'true',
                message: 'Data Received'
            })
        })
    })
};
  


module.exports = {
    addData: addData
};