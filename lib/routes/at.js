/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */

var express = require('express');
var responseHandler = require('../responsehandler');


var router = express.Router();

router.route('/')
  .get(function(req, res) {
    retrievePlaces(req, res);
  });


router.route('/:place')
  .get(function(req, res) {
    retrievePlace(req, res);
  });


/**
 * Retrieve all places.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrievePlaces(req, res) {
  var status = responseHandler.NOTIMPLEMENTED;
  var response = responseHandler.prepareResponse(status);
  res.status(status).json(response);
}


/**
 * Retrieve a specific place.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrievePlace(req, res) {
  req.instance.retrievePlace(req, res);
}


module.exports = router;
