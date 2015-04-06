/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var http = require('http');
var express = require('express');
var responseHandler = require('./responsehandler');

var HTTP_PORT = 3001;


/**
 * Barterer Class
 * API for real-time location and hyperlocal context.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function Barterer(options) {
  var self = this;
  options = options || {};
  self.specifiedHttpPort = options.httpPort || HTTP_PORT;
  self.httpPort = process.env.PORT || self.specifiedHttpPort;

  self.app = express();

  self.router = express.Router();
  self.router.use(function(req, res, next) {
    // TODO: basic error checking goes here in the middleware
    next();
  });

  // ----- route: / ------
  self.router.route('/')

    .get(function(req, res) {
      routeNotImplemented(function(response, status) {
        res.status(status).json(response);
      });
    });

  // ----- route: /id/:id ------
  self.router.route('/id/:id')

    .get(function(req, res) {
      var identifiers = [ req.param('id') ];
      self.retrieveDevices(identifiers, req, function(response, status) {
        res.status(status).json(response);
      });
    });

  // ----- route: /at/:place ------
  self.router.route('/at/:place')

    .get(function(req, res) {
      var place = req.param('place');
      self.retrievePlace(place, req, function(response, status) {
        res.status(status).json(response);
      });
    });

  self.app.use('/', self.router);

  console.log("reelyActive Barterer instance is exchanging data in an open IoT");

  self.app.listen(self.httpPort, function() {
    console.log("barterer is listening on port", self.httpPort);
  });
};


/**
 * Bind the API to the given data source and/or associations.
 * @param {Object} options The options as a JSON object.
 */
Barterer.prototype.bind = function(options) {
  options = options || {};
  var self = this;

  if(options.barnacles) {
    self.dataStore = options.barnacles;
  }
  if(options.chickadee) {
    self.associations = options.chickadee;
  }
}


/**
 * Retrieve (get) the state of the given device(s).
 * @param {Array} identifiers The array of identifiers.
 * @param {Object} req The request.
 * @param {callback} callback Function to call on completion.
 */
Barterer.prototype.retrieveDevices = function(identifiers, req, callback) {
  var self = this;

  if(self.dataStore) {
    self.dataStore.getState({ ids: identifiers }, function(state) {
      var foundNothing = !Object.keys(state).length;
      if(foundNothing) {
        var data = { devices: { } };
        callback(responseHandler.prepareResponse(responseHandler.OK, req,
                                                 data), responseHandler.OK);
      }
      else if(self.associations) {
        self.associations.addUrls(state, function(associated) {
          var data = { devices: associated };
          callback(responseHandler.prepareResponse(responseHandler.OK, req,
                                                   data), responseHandler.OK);
        });
      }
      else {
        var data = { devices: state };
        callback(responseHandler.prepareResponse(responseHandler.OK, req,
                                                 data), responseHandler.OK);
      }
    });
  }
  else {
    callback(responseHandler.prepareResponse(responseHandler.NOTIMPLEMENTED),
             responseHandler.NOTIMPLEMENTED);
  } 
}


/**
 * Retrieve (get) the state of the given place.
 * @param {String} place The name of the place.
 * @param {Object} req The request.
 * @param {callback} callback Function to call on completion.
 */
Barterer.prototype.retrievePlace = function(place, req, callback) {
  var self = this;

  if(self.associations) {
    self.associations.retrievePlace(place, req, function(response, status) {
      if(status === responseHandler.OK) {
        var identifiers = response.places[place].identifiers;
        if(identifiers.length > 0) {
          self.retrieveDevices(identifiers, req, callback);
        }
        else {
          callback(responseHandler.prepareResponse(responseHandler.NOTFOUND),
                   responseHandler.NOTFOUND);
        }
      }
      else {
        callback(responseHandler.prepareResponse(responseHandler.NOTFOUND),
                 responseHandler.NOTFOUND);
      }
    });
  }
  else {
    callback(responseHandler.prepareResponse(responseHandler.NOTIMPLEMENTED),
             responseHandler.NOTIMPLEMENTED);
  }
}


/**
 * Handle a route that is not implemented.
 * @param {callback} callback Function to call on completion.
 */
function routeNotImplemented(callback) {
  callback(responseHandler.prepareResponse(responseHandler.NOTIMPLEMENTED),
           responseHandler.NOTIMPLEMENTED);
}


module.exports = Barterer;
