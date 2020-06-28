const database = require('../model/database.js');
let db = database.Database;

/* GET home page. */
function renderHomePage(req, res, next) {
  getSensors()
  .then(srows=>getData(srows))
  .then(drows=>filterRows(drows))
  .then(filteredRows=>{
      let filterData = filteredRows;
      // console.log(filterData);
      res.render('index', { devices: filterData });
    }).catch(error => {console.log(error.message)});
};

function getSensors() {
  return new Promise ((resolve, reject) => {
    db.all(`SELECT deviceID, name FROM "alias"`, [], function(err, alias_rows) {
      if(err) {
        reject(err);
      } else {
        // TODO: Use this data to create a list of devices
        // TODO: Use that list of devices to extract their past date and other information into a list
        // TODO: Use that list as the input for the chart.js chart on the home page
        // TODO: Make this have a scale that returns different data via params
        // console.log("From getSensors \n");
        // console.log(alias_rows);
        resolve(alias_rows)
      }
    })
  })
}

function getData(sensors) {
  return new Promise ((resolve, reject) => {
    // console.log(sensors[0].deviceID);
    let sensorData = [];
    sensors.forEach((element) => {
      //TODO This needs to take from params or default to 1 day
      db.all(
        `SELECT * 
      FROM sensors LEFT JOIN alias
      ON sensors.deviceId = alias.deviceID 
      WHERE sensors.date BETWEEN strftime('%Y-%m-%dT%H:%M:%S', 'now', '-1 days') 
      AND strftime('%Y-%m-%dT%H:%M:%S', 'now') 
      AND sensors.deviceId LIKE ?;` , [element.deviceID], function(err, sensor_rows) {
        if (err) {
            reject(err);
        } else {
          sensorData.push(sensor_rows);
          // let filterData = sensor_rows;
          // res.render('index', { devices: filterData });
          if(sensorData.length == sensors.length) {
            // console.log('From getData \n');
            // console.log(sensorData);
            resolve(sensorData);
          }
        }
      })
    })
  })
}

function filterRows(unfiltered_rows) {
  return new Promise((resolve, reject) => {
    // console.log('From filterRows');
    // console.log(unfiltered_rows);
    // Ensure that the deviecs have information to report, else resolve nothing to ignore that sensor, or if they are all empty, just simply render the page blank
    let counter = 0;
    for (counter = 0; counter < unfiltered_rows.length; counter++) {
      if (unfiltered_rows[counter].length == 0) {
        unfiltered_rows.splice(counter, 1);
        counter--;
      }
    }
    if (unfiltered_rows.length > 0) {
      try {
        let filtered_rows = []
        unfiltered_rows.forEach((unfiltered_element) => {
          let temps = [];
          let humid = [];
          let moist = [];
          let date = [];
          let id = unfiltered_element[0].deviceId;
          let name = unfiltered_element[0].name;
          unfiltered_element.forEach((reading) => {
            temps.push(reading.temperature);
            humid.push(reading.humidity);
            moist.push(reading.moisture);
            date.push(reading.date);
            if((date.length == unfiltered_element.length) && (moist.length == unfiltered_element.length) && (humid.length == unfiltered_element.length) && (temps.length == unfiltered_element.length)) {
              let entry = {
                'id': id,
                'name': name,
                'temperature': temps,
                'humidity': humid,
                'moisture': moist,
                'date': date
              };
              filtered_rows.push(entry);
              // console.log('Filtered rows: \n');
              // console.log(filtered_rows);
              resolve(filtered_rows);
            }
          })
        })
      } catch(error) {
        reject(error);
      }
    } else {
      resolve();
    }
  })
}

module.exports = {
    renderHomePage: renderHomePage
};