var express = require('express');
var router = express.Router();

var homeController = require('../controllers/homeController');
router.get('/', homeController.renderHomePage);

var heartbeatController = require('../controllers/heartbeatController');
router.get('/api/v1/heartbeat', heartbeatController.heartbeat);

var addDataController = require('../controllers/addDataController');
router.post('/api/v1/addData', addDataController.addData);

var updateNameController = require('../controllers/updateName');
router.post('/api/v1/updateName', updateNameController.updateName);

var deviceController = require('../controllers/deviceController');
router.get('/device/:deviceId', deviceController.getDevice);

module.exports = router;