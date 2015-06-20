/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var express = require('express');
var barterer = require('./barterer');
var Barterer = barterer.Barterer;


var HTTP_PORT = 3001;


/**
 * BartererServer Class
 * Server for barterer, returns an instance of barterer with its own Express
 * server listening on the given port.
 * @param {Object} options The options as a JSON object.
 * @constructor
 */
function BartererServer(options) {
  options = options || {};
  var specifiedHttpPort = options.httpPort || HTTP_PORT;
  var httpPort = process.env.PORT || specifiedHttpPort;

  var app = express();

  var instance = new Barterer(options);
  options.app = app;
  instance.configureRoutes(options);

  app.listen(httpPort, function() {
    console.log('barterer is listening on port', httpPort);
  });

  return instance;
}


module.exports = BartererServer;
module.exports.Barterer = Barterer;
