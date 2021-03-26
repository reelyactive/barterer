/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */

const express = require('express');
const path = require('path');
const responseHandler = require('./responsehandler');


let router = express.Router();

router.route('/:id/:type')
  .get(function(req, res) {
    retrieveDevice(req, res);
  });

router.route('/:id/:type/:property')
  .get(function(req, res) {
    retrieveDevice(req, res);
  });


/**
 * Retrieve the given device.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveDevice(req, res) {
  if(redirect(req.params.id, '', '', res)) {
    return;
  }

  switch(req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/barterer/devices/index.html'));
      break;
    default:
      let id = req.params.id;
      let type = req.params.type;
      let property = req.params.property;
      let rootUrl = req.protocol + '://' + req.get('host');
      let queryPath = req.originalUrl;
      let devices = req.barterer.devices;
      devices.retrieve(id, type, property, function(status, data) {
        let response = responseHandler.prepareResponse(req, status, data);
        res.status(status).json(response);
      });
      break;
  }
}


/**
 * Redirect if required and return the status.
 * @param {String} id The given ID.
 * @param {String} prefix The prefix to the ID in the path.
 * @param {String} suffix The suffix to the ID in the path.
 * @param {Object} res The HTTP result.
 * @return {boolean} Redirection performed?
 */
function redirect(id, prefix, suffix, res) {
  let standardisedId = null;  // TODO: convert to standardised ID

  if(standardisedId && (standardisedId !== id)) {
    res.redirect(prefix + standardisedId + suffix);
    return true;
  }

  return false;
}


module.exports = router;
