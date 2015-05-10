/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var express = require('express');
var path = require('path');
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
};


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
}


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
}


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

  if(self.dataStore) {
    self.dataStore.getState(options, function(state) {
      var status = responseHandler.OK;
      var response = responseHandler.prepareResponse(status, rootUrl,
                                                     queryPath, state);
      callback(response, status);
    });
  }
  else {
    var status = responseHandler.SERVICEUNAVAILABLE;
    var response = responseHandler.prepareResponse(status, rootUrl,
                                                   queryPath);
    callback(response, status);
  }
}


module.exports.Barterer = Barterer;
