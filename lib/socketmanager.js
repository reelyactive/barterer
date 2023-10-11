/**
 * Copyright reelyActive 2021-2023
 * We believe in an open Internet of Things
 */


const DEVICES_ROUTE = '/devices';
const DEVICES_ROUTE_REGEX = /^\/devices[\/]?/;


/**
 * SocketManager Class
 * Manages the retrieval of wireless device data.
 */
class SocketManager {

  /**
   * SocketManager constructor
   * @param {Object} options The options as a JSON object.
   * @param {SocketIO} io The socket.io instance.
   * @param {Barnacles} barnacles The barnacles instance.
   * @param {Chimps} chimps The optional chimps instance.
   * @constructor
   */
  constructor(options, io, barnacles, chimps) {
    let self = this;
    options = options || {};

    this.activeNamespaces = new Map();
    this.barnacles = barnacles;
    this.chimps = chimps;

    if(io) {
      io.of(DEVICES_ROUTE_REGEX).on('connection', function(socket) {
        handleSocketConnection(socket, self);
      });

      handleBarnaclesEvents(barnacles, self.activeNamespaces);
      if(self.chimps) {
        handleChimpsEvents(chimps, self.activeNamespaces);
      }
    }

  }

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

  socket.on('disconnect', function(reason) {
    let isEmptyNamespace = (namespace.sockets.size === 0);

    if(isEmptyNamespace) {
      instance.activeNamespaces.delete(route);
    }
  });
}


/**
 * Handle the event stream from barnacles.
 * @param {Barnacles} barnacles The barnacles instance.
 * @param {Map} activeNamespaces The active namespaces to update.
 */
function handleBarnaclesEvents(barnacles, activeNamespaces) {
  barnacles.on('raddec', function(raddec) {
    handleRaddecEvent(raddec, activeNamespaces);
  });

  barnacles.on('dynamb', function(dynamb) {
    handleDynambEvent(dynamb, activeNamespaces);
  });
}


/**
 * Handle the event stream from chimps.
 * @param {Chimps} chimps The chimps instance.
 * @param {Map} activeNamespaces The active namespaces to update.
 */
function handleChimpsEvents(chimps, activeNamespaces) {
  chimps.on('spatem', function(spatem) {
    handleSpatemEvent(spatem, activeNamespaces);
  });
}


/**
 * Handle a raddec event from barnacles.
 * @param {raddec} raddec The raddec event.
 * @param {Map} activeNamespaces The active namespaces to update.
 */
function handleRaddecEvent(raddec, activeNamespaces) {
  let deviceRoute = DEVICES_ROUTE + '/' + raddec.signature;

  if(activeNamespaces.has(DEVICES_ROUTE)) {
    activeNamespaces.get(DEVICES_ROUTE).emit('raddec', raddec);
  }
  if(activeNamespaces.has(DEVICES_ROUTE + '/raddec')) {
    activeNamespaces.get(DEVICES_ROUTE + '/raddec').emit('raddec', raddec);
  }
  if(activeNamespaces.has(deviceRoute)) {
    activeNamespaces.get(deviceRoute).emit('raddec', raddec);
  }
}


/**
 * Handle a dynamb event from barnacles.
 * @param {dynamb} dynamb The dynamb event.
 * @param {Map} activeNamespaces The active namespaces to update.
 */
function handleDynambEvent(dynamb, activeNamespaces) {
  let deviceRoute = DEVICES_ROUTE + '/' + dynamb.deviceId + '/' +
                    dynamb.deviceIdType;

  if(activeNamespaces.has(DEVICES_ROUTE)) {
    activeNamespaces.get(DEVICES_ROUTE).emit('dynamb', dynamb);
  }
  if(activeNamespaces.has(DEVICES_ROUTE + '/dynamb')) {
    activeNamespaces.get(DEVICES_ROUTE + '/dynamb').emit('dynamb', dynamb);
  }
  if(activeNamespaces.has(deviceRoute)) {
    activeNamespaces.get(deviceRoute).emit('dynamb', dynamb);
  }
}


/**
 * Handle a spatem event from chimps.
 * @param {spatem} spatem The spatem event.
 * @param {Map} activeNamespaces The active namespaces to update.
 */
function handleSpatemEvent(spatem, activeNamespaces) {
  let deviceRoute = DEVICES_ROUTE + '/' + spatem.deviceId + '/' +
                    spatem.deviceIdType;

  if(activeNamespaces.has(DEVICES_ROUTE)) {
    activeNamespaces.get(DEVICES_ROUTE).emit('spatem', spatem);
  }
  if(activeNamespaces.has(DEVICES_ROUTE + '/spatem')) {
    activeNamespaces.get(DEVICES_ROUTE + '/spatem').emit('spatem', spatem);
  }
  if(activeNamespaces.has(deviceRoute)) {
    activeNamespaces.get(deviceRoute).emit('spatem', spatem);
  }
}


module.exports = SocketManager;