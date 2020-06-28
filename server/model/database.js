const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('sensorDb.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connecting to the database.');

  db.exec('PRAGMA foreign_keys = ON;', function(error) {
    if (error) {
      console.error('Pragma statement failed!');
    } else {
      console.log('Foreign Key Enforcement is on')

    }
  })

  db.serialize(function() {

    var dbSchema = `CREATE TABLE IF NOT EXISTS sensors (
      deviceId text, 
      ip text, 
      temperature text, 
      humidity text, 
      moisture text, 
      date text);
      
      CREATE TABLE IF NOT EXISTS alias (
        deviceID text NOT NULL UNIQUE, 
        ip text, 
        name text);`;
  
    db.exec(dbSchema, function(err){
      if(err) {
        console.log(err);
      } else {
        console.log('Connected to the database')
      }
    })
  })
});

module.exports.Database = db;