/**
 * Copyright reelyActive 2015-2023
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
   * @param {Chimps} chimps The optional chimps instance.
   * @constructor
   */
  constructor(options, barnacles, chimps) {
    options = options || {};

    this.barnacles = barnacles;
    this.chimps = chimps;
  }

  /**
   * Retrieve a device.
   * @param {String} id The id of the device.
   * @param {Number} type The type of id of the device.
   * @param {String} property The specific property to get.
   * @param {callback} callback Function to call on completion.
   */
  retrieve(id, type, property, callback) {
    let self = this;
    let properties;

    if(!this.barnacles) {
      return callback(400);
    }

    if(property) {
      properties = [ property ];
    }

    self.barnacles.retrieveDevices(id, type, properties, function(devices) {
      if(devices) {
        if(self.chimps) {
          self.chimps.retrieveDevices(id, type, properties,
                                      function(complementaryDevices) {
            if(complementaryDevices) {
              for(const signature in devices) {
                if(complementaryDevices.hasOwnProperty(signature)) {
                  Object.assign(devices[signature],
                                complementaryDevices[signature]);
                }
              }
            }
            return callback(200, { devices: devices });    
          });
        }
        else {
          return callback(200, { devices: devices });
        }
      }
      else {
        return callback(404);
      }
    });
  }

}


module.exports = DevicesManager;
