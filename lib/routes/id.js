/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */

var express = require('express');
var path = require('path');
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
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  var response = responseHandler.prepareResponse(status, rootUrl, queryPath);
  res.status(status).json(response);
}


/**
 * Retrieve a specific device.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveDevice(req, res) {
  switch(req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/response.html'));
      break;
    default:
      var identifiers = [ req.param('id') ];
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.instance.getDevices(identifiers, rootUrl, queryPath,
                              function(response, status) {
        res.status(status).json(response);
      });
      break;
  }
}


module.exports = router;
