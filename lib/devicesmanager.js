/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */


/**
 * DevicesManager Class
 * Manages the retrieval of wireless device data.
 */
class DevicesManager {

  /**
   * DevicesManager constructor
   * @param {Object} options The options as a JSON object.
   * @param {Barnacles} barnacles The barnacles instance.
   * @constructor
   */
  constructor(options, barnacles) {
    options = options || {};

    this.barnacles = barnacles;
  }

  /**
   * Retrieve a device.
   * @param {String} id The id of the device.
   * @param {Number} type The type of id of the device.
   * @param {String} property The specific property to get.
   * @param {callback} callback Function to call on completion.
   */
  retrieve(id, type, property, callback) {
    let properties;

    if(!this.aggregator) {
      return callback(400);
    }

    if(property) {
      properties = [ property ];
    }

    this.barnacles.retrieveDevice(id, type, properties, function(devices) {
      if(devices) {
        return callback(200, { devices: devices });
      }

      return callback(404);
    });
  }

}


module.exports = DevicesManager;
