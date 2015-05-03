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

  self.app.use('/devices', require('./routes/devices'));
  self.app.use('/places', require('./routes/places'));
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
 * Get the context of the given device(s).
 * @param {Array} devices The device(s) to query.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Barterer.prototype.getDevicesContext = function(devices, rootUrl, queryPath,
                                                callback) {
  var self = this;

  getState(self, devices, function(state, err) {
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
 * Get the context of the given place.
 * @param {String} name The place name to query.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Barterer.prototype.getPlaceContext = function(name, rootUrl, queryPath,
                                              callback) {
  var self = this;

  getPlaceInfrastructureDevices(self, name, function(devices, err) {
    if(err) {
      var status = err.status;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath);
      callback(response, status);
    }
    else {
      self.getDevicesContext(devices, rootUrl, queryPath,
                             function(response, status) {
        callback(response, status);
      });
    }
  });
}


/**
 * Get the current state from the dataStore.
 * @param {Barterer} instance The given barterer instance.
 * @param {Array} devices The array of devices to query.
 * @param {callback} callback Function to call on completion.
 */
function getState(instance, devices, callback) {
  if(instance.dataStore) {
    instance.dataStore.getState({ ids: devices }, function(state) {
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
 * Get the infrastructure devices associated with the given place.
 * @param {Barterer} instance The given barterer instance.
 * @param {String} name The place name to query.
 * @param {callback} callback Function to call on completion.
 */
function getPlaceInfrastructureDevices(instance, name, callback) {
  if(instance.associations) {
    instance.associations.getPlace(name, '', '', function(response, status) {
      if(response.places) { // TODO: update if chickadee supports infrastruct.
        var devices = response.places[name].devices;
        for(var cDevice = 0; cDevice < devices.length; cDevice++) {
          devices[cDevice] = devices[cDevice].id;
        }
        callback(devices);
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
