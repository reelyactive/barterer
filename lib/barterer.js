/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var express = require('express');
var path = require('path');
var reelib = require('reelib');
var responseHandler = require('./responsehandler');


/**
 * Barterer Class
 * API for real-time location and hyperlocal context.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function Barterer(options) {
  var self = this;
  options = options || {};

  self.routes = {
    "/whereis": require('./routes/whereis'),
    "/whatat": require('./routes/whatat'),
    "/whatnear": require('./routes/whatnear'),
    "/": express.static(path.resolve(__dirname + '/../web'))
  };

  console.log('reelyActive Barterer instance is exchanging data in an open IoT');
}


/**
 * Configure the routes of the API.
 * @param {Object} options The options as a JSON object.
 */
Barterer.prototype.configureRoutes = function(options) {
  options = options || {};
  var self = this;

  if(options.app) {
    var app = options.app;

    app.use(function(req, res, next) {
      req.barterer = self;
      next();
    });

    for(var mountPath in self.routes) {
      var router = self.routes[mountPath];
      app.use(mountPath, router);
    }
  }
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
};


/**
 * Get the state of the given device(s) based on the given options.
 * @param {Object} options The query options.
 * @param {String} rootUrl The root URL of the original query.
 * @param {String} queryPath The query path of the original query.
 * @param {callback} callback Function to call on completion.
 */
Barterer.prototype.getDevicesState = function(options, rootUrl, queryPath,
                                              callback) {
  var self = this;
  var status;
  var response;

  if(self.dataStore) {
    if(isValidOptions(options)) {
      self.dataStore.getState(options, function(state) {
        status = responseHandler.OK;
        response = responseHandler.prepareResponse(status, rootUrl, queryPath,
                                                   state);
        callback(response, status);
      });
    }
    else {
      status = responseHandler.BADREQUEST;
      response = responseHandler.prepareResponse(status, rootUrl, queryPath);
      callback(response, status);
    }
  }
  else {
    status = responseHandler.SERVICEUNAVAILABLE;
    response = responseHandler.prepareResponse(status, rootUrl, queryPath);
    callback(response, status);
  }
};


/**
 * Determine if the given options are valid.
 * @param {Object} options The given options.
 * @return {boolean} True if the options are valid, false otherwise.
 */
function isValidOptions(options) {
  if(!options) {
    return false;
  }

  if(options.hasOwnProperty('ids') && Array.isArray(options.ids)) {
    for(var cId = 0; cId < options.ids.length; cId++) {
      if(!reelib.identifier.isValid(options.ids[cId])) {
        return false;
      }
    }
    return true;
  }

  else {
    return false;
  }
}


module.exports.Barterer = Barterer;
