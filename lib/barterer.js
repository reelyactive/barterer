/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */


const express = require('express');
const path = require('path');
const DevicesManager = require('./devicesmanager');


const DEVICES_ROUTE_REGEX = /^\/devices[\/]?/;


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
    if(options.io) {
      configureSocketIO(options.io, self);
    }

    let barnacles = options.barnacles;
    this.devices = new DevicesManager(options, barnacles);

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


/**
 * Configure the socket.io API and handle /devices requests.
 * @param {SocketIO} io The socket.io server.
 * @param {Barterer} instance The Barterer instance.
 */
function configureSocketIO(io, instance) {
  instance.io = io;
  instance.activeNamespaces = new Map();

  io.of(DEVICES_ROUTE_REGEX).on('connection', function(socket) {
    handleSocketConnection(socket, instance);
  });
}


/**
 * Handle the given socket.io connection, serving data until disconnection.
 * @param {Socket} socket The socket connection.
 * @param {Barterer} instance The Barterer instance.
 */
function handleSocketConnection(socket, instance) {
  let namespace = socket.nsp;
  let route = namespace.name;
  instance.activeNamespaces.set(route, namespace);

  switch(route) {
    case '/devices':
      // TODO: send everything
      break;
    case '/devices/raddec':
      // TODO: send all raddec events
      break;
    case '/devices/dynamb':
      // TODO: send all dynamb events
      break;
    default:
      let deviceSignature = namespace.name.substring(9);
      console.log('send updates for signature', deviceSignature);
      // TODO: send events only for the given ID
  }

  socket.on('disconnect', function(reason) {
    let isEmptyNamespace = (namespace.sockets.size === 0);

    if(isEmptyNamespace) {
      instance.activeNamespaces.delete(route);
    }
  });
}


module.exports = Barterer;