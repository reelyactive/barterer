/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */

var express = require('express');
var path = require('path');
var reelib = require('reelib');


var router = express.Router();

router.route('/transmitter/:id')
  .get(function(req, res) {
    retrieveWhatNearTransmitter(req, res);
  });


/**
 * Retrieve everything that is decoded by the strongest receiver of a specific
 * transmitter device.
 * @param {Object} req The HTTP request.
 * @param {Object} res The HTTP result.
 */
function retrieveWhatNearTransmitter(req, res) {
  if (redirect(req.param('id'), '', '', res)) {
    return;
  }

  switch (req.accepts(['json', 'html'])) {
    case 'html':
      res.sendFile(path.resolve(__dirname + '/../../web/response.html'));
      break;
    default:
      var options = {
        query: 'receivedBySame',
        req: req,
        ids: [req.param('id')]
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

  if (validatedID && (validatedID !== id)) {
    res.redirect(prefix + validatedID + suffix);
    return true;
  }

  return false;
}


module.exports = router;
