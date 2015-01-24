/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var http = require('http');
var express = require('express');

var HTTP_PORT = 3001;


/**
 * Barterer Class
 * API for real-time hyperlocal context.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function Barterer(options) {
  var self = this;
  options = options || {};
  this.specifiedHttpPort = options.httpPort || HTTP_PORT;
  this.httpPort = process.env.PORT || this.specifiedHttpPort;

  this.app = express();

  this.app.get('/id/:id', function(req, res) {
    searchByIDs(self, getRequestParameters(req), function(result) {
      res.json(result);
    });
  });

  console.log("reelyActive Barterer instance is exchanging data in an open IoT");

  this.app.listen(this.httpPort, function() {
    console.log("barterer is listening on port", self.httpPort);
  });
};


/**
 * Bind the API to the given data source.
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
 * Return the API request parameters as an object.
 * @param {Object} req The request.
 */
function getRequestParameters(req) {
  var params = {};
  params.ids = [ req.param('id') ];
  params.place = req.param('place');
  params.rootUrl = req.protocol + '://' + req.get('host');
  params.queryPath = req.originalUrl;
  params.body = req.body;
  return params;
}


/**
 * Search hyperlocal context based on identifiers.
 * @param {Barterer} instance The given Barterer instance.
 * @param {Object} params The parameters to search on.
 * @param {function} callback Function to call on completion.
 */
function searchByIDs(instance, params, callback) {
  instance.dataStore.getState( { ids: params.ids }, function(state) {
    callback(state);
  });
}


module.exports = Barterer;
