/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var http = require('http');
var express = require('express');
var path = require('path');
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

  self.app.use(function(req, res, next) {
    req.instance = self;
    next();
  });

  self.app.use('/id', require('./routes/id'));
  self.app.use('/at', require('./routes/at'));
  self.app.use('/', express.static(path.resolve(__dirname + '/../web')));

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
 * Get the state of the given device(s).
 * @param {Array} identifiers The device identifier(s) to query.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Barterer.prototype.getDevices = function(identifiers, rootUrl, queryPath,
                                         callback) {
  var self = this;

  getState(self, identifiers, function(state, err) {
    if(err) {
      var status = err.status;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath);
      callback(response, status);
    }
    else {
      var status = responseHandler.OK;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath, state);
      callback(response, status);
    }
  });
}


/**
 * Get the state of the given place.
 * @param {String} place The place name to query.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Barterer.prototype.getPlace = function(place, rootUrl, queryPath, callback) {
  var self = this;

  getPlaceIdentifiers(self, place, function(identifiers, err) {
    if(err) {
      var status = err.status;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath);
      callback(response, status);
    }
    else {
      self.getDevices(identifiers, rootUrl, queryPath, 
                      function(response, status) {
        callback(response, status);
      });
    }
  });
}


/**
 * Get the current state from the dataStore.
 * @param {Barterer} instance The given barterer instance.
 * @param {Array} identifiers The array of identifiers to query.
 * @param {callback} callback Function to call on completion.
 */
function getState(instance, identifiers, callback) {
  if(instance.dataStore) {
    instance.dataStore.getState({ ids: identifiers }, function(state) {
      var foundNothing = !Object.keys(state).length;
      if(foundNothing) {
        callback( { devices: { } } );
      }
      else if(instance.associations) {
        instance.associations.addUrls(state, function(associated) {
          callback( { devices: associated } );
        });
      }
      else {
        callback( { devices: state } );
      }
    });
  }
  else {
    var err = { message: "Not bound to a barnacles instance",
                status: responseHandler.SERVICEUNAVAILABLE };
    callback(null, err);
  }
}


/**
 * Get the identifiers associated with the given place.
 * @param {Barterer} instance The given barterer instance.
 * @param {String} place The place to query.
 * @param {callback} callback Function to call on completion.
 */
function getPlaceIdentifiers(instance, place, callback) {
  if(instance.associations) {
    instance.associations.getPlace(place, '', '', function(response, status) {
      if(response.places) {
        var identifiers = response.places[place].identifiers;
        callback(identifiers);
      }
      else {
        var err = { message: "Unknown place",
                    status: responseHandler.NOTFOUND };
        callback(null, err);
      }
    });
  }
  else {
    var err = { message: "Not bound to a chickadee instance",
                status: responseHandler.SERVICEUNAVAILABLE };
    callback(null, err);
  }
}


module.exports = Barterer;
