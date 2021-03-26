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
   * @param {Barnacles} aggregator The aggregator instance.
   * @constructor
   */
  constructor(options, aggregator) {
    options = options || {};

    this.aggregator = aggregator;
  }

  /**
   * Retrieve a device.
   * @param {String} id The id of the device.
   * @param {String} type The type of id of the device.
   * @param {String} property A specific device property to get.
   * @param {callback} callback Function to call on completion.
   */
  retrieve(id, type, property, callback) {
    if(!this.aggregator) {
      return callback(400);
    }
    return callback(404);

    // TODO: retrieve from aggregator
    //return callback(200, { devices: {} });
  }

}


module.exports = DevicesManager;
