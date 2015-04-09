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
  var rootUrl = req.protocol + '://' + req.get('host');
  var queryPath = req.originalUrl;
  var response = responseHandler.prepareResponse(status, rootUrl, queryPath);
  res.status(status).json(response);
}


/**
 * Retrieve a specific place.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrievePlace(req, res) {
  switch(req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/response.html'));
      break;
    default:
      var place = req.param('place');
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.instance.getPlace(place, rootUrl, queryPath,
                            function(response, status) {
        res.status(status).json(response);
      });
      break;
  }
}


module.exports = router;
