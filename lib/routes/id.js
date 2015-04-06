/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */

var express = require('express');
var responseHandler = require('../responsehandler');


var router = express.Router();

router.route('/')
  .get(function(req, res) {
    retrieveDevices(req, res);
  });


router.route('/:id')
  .get(function(req, res) {
    retrieveDevice(req, res);
  });


/**
 * Retrieve all devices.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveDevices(req, res) {
  var status = responseHandler.NOTIMPLEMENTED;
  var response = responseHandler.prepareResponse(status);
  res.status(status).json(response);
}


/**
 * Retrieve a specific device.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveDevice(req, res) {
  req.instance.retrieveDevice(req, res);
}


module.exports = router;
