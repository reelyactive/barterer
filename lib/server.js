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
  this.specifiedHttpPort = options.httpPort || HTTP_PORT;
  this.httpPort = process.env.PORT || this.specifiedHttpPort;

  this.app = express();

  this.router = express.Router();
  this.router.use(function(req, res, next) {
    // TODO: basic error checking goes here in the middleware
    next();
  });

  // ----- route: / ------
  this.router.route('/')

    .get(function(req, res) {
      res.json(responseHandler.prepareFailureResponse("notImplemented"));
    });

  // ----- route: /id/:id ------
  this.router.route('/id/:id')

    .get(function(req, res) {
      searchByIDs(self, getRequestParameters(req), function(result) {
        res.json(result);
      });
    });

  // ----- route: /at/:place ------
  this.router.route('/at/:place')

    .get(function(req, res) {
      searchByPlace(self, getRequestParameters(req), function(result) {
        res.json(result);
      });
    });

  this.app.use('/', self.router);

  console.log("reelyActive Barterer instance is exchanging data in an open IoT");

  this.app.listen(this.httpPort, function() {
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
 * Get the current state of events.
 * @param {Object} options The options as a JSON object.
 * @param {callback} callback Function to call on completion.
 */
Barterer.prototype.getState = function(options, callback) {
  options = options || {};
  var self = this;

  if(self.dataStore) {
    self.dataStore.getState(options, callback);
  }
  else {
    callback({});
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
 * Search based on device identifiers.
 * @param {Barterer} instance The given Barterer instance.
 * @param {Object} params The parameters to search on.
 * @param {function} callback Function to call on completion.
 */
function searchByIDs(instance, params, callback) {
  instance.getState( { ids: params.ids }, function(state) {
    var foundNothing = !Object.keys(state).length;
    if(foundNothing) {
      callback(responseHandler.prepareFailureResponse("notFound"));
    }
    else if(instance.associations) {
      instance.associations.addUrls(state, function(linked) {
        callback(responseHandler.prepareResponse(linked, params));
      });
    }
    else {
      callback(responseHandler.prepareResponse(state, params));
    }
  });
}


/**
 * Search based on a place name.
 * @param {Barterer} instance The given Barterer instance.
 * @param {Object} params The parameters to search on.
 * @param {function} callback Function to call on completion.
 */
function searchByPlace(instance, params, callback) {
  if(instance.associations) {
    instance.associations.getPlaceIDs(params.place, function(ids) {
      if(ids.length > 0) {
        params.ids = ids;
        searchByIDs(instance, params, callback);
      }
      else {
        callback(responseHandler.prepareFailureResponse("notFound"));
      }
    });
  }
  else {
    callback(responseHandler.prepareFailureResponse("notImplemented"));
  }
}


module.exports = Barterer;
