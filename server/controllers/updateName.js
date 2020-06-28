const database = require('../model/database.js');
let db = database.Database;

function updateName(req, res, next) {
    let name;
    let id;
    let newName = req.query.newName;
    if(req.query.name) {
        name = req.query.name;
    }
    if(req.query.id){
        id = req.query.id;
    }

    db.serialize(function () {
        db.run(`UPDATE alias SET name=? WHERE deviceId LIKE ? OR name LIKE ?`, [newName, id, name], function(err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`Rows updated ${this.changes}`);
            // Add the data to the DB and on resolve
            res.status(200).send({
                success: 'true',
                message: 'Data Received'
            })
        })
    })
}

module.exports = {
    updateName: updateName
};