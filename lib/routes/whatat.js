/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */

var express = require('express');
var path = require('path');
var reelib = require('reelib');


var router = express.Router();

router.route('/receiver/:id')
  .get(function(req, res) {
    retrieveWhatAtTransmitter(req, res);
  });


/**
 * Retrieve what is decoded by a specific receiver device.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveWhatAtTransmitter(req, res) {
  if(redirect(req.params.id, '', '', res)) {
    return;
  }

  switch(req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/response.html'));
      break;
    default:
      var options = {
        query: 'receivedBy',
        req: req,
        ids: [req.params.id]
      };
      var rootUrl = req.protocol + '://' + req.get('host');
      var queryPath = req.originalUrl;
      req.barterer.getDevicesState(options, rootUrl, queryPath,
                                   function(response, status) {
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
  var validatedID = reelib.identifier.toIdentifierString(id);

  if(validatedID && (validatedID !== id)) {
    res.redirect(prefix + validatedID + suffix);
    return true;
  }

  return false;
}


module.exports = router;
