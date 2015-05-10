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

  if(options.app) {
    self.app = options.app;

    self.app.use(function(req, res, next) {
      req.barterer = self;
      next();
    });

    self.app.use('/whereis', require('./routes/whereis'));
    self.app.use('/whatat', require('./routes/whatat'));
    self.app.use('/whatnear', require('./routes/whatnear'));
    self.app.use('/', express.static(path.resolve(__dirname + '/../web')));
  }

  console.log('reelyActive Barterer instance is exchanging data in an open IoT');
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
