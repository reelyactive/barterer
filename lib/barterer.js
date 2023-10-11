/**
 * Copyright reelyActive 2015-2023
 * We believe in an open Internet of Things
 */


const express = require('express');
const path = require('path');
const DevicesManager = require('./devicesmanager');
const SocketManager = require('./socketmanager');


/**
 * Barterer Class
 * API for real-time location and hyperlocal context.
 */
class Barterer {

  /**
   * Barterer constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    let self = this;
    options = options || {};

    if(options.app) {
      configureExpress(options.app, self);
    }

    let barnacles = options.barnacles;
    let chimps = options.chimps;
    let io = options.io;
    this.devices = new DevicesManager(options, barnacles, chimps);
    this.socket = new SocketManager(options, io, barnacles, chimps);

    console.log('reelyActive Barterer instance is exchanging data in an open IoT');
  }

}


/**
 * Configure the routes of the API.
 * @param {Express} app The Express app.
 * @param {Barterer} instance The Barterer instance.
 */
function configureExpress(app, instance) {
  app.use(function(req, res, next) {
    req.barterer = instance;
    next();
  });
  app.use('/devices', require('./routes/devices'));
  app.use('/', express.static(path.resolve(__dirname + '/../web')));
}


module.exports = Barterer;