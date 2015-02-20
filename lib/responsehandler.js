/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


var MESSAGE_OK = "ok";
var MESSAGE_NOTFOUND = "notFound";
var MESSAGE_NOTIMPLEMENTED = "notImplemented";
var MESSAGE_BADREQUEST = "badRequest";
var CODE_OK = 200;
var CODE_NOTFOUND = 404;
var CODE_NOTIMPLEMENTED = 501;
var CODE_BADREQUEST = 400;


/**
 * Prepares the JSON for an API query response which is successful
 * @param {Number} status Integer status code
 * @param {Object} params The parameters of the query
 * @param {Object} devices List of devices
 */
function prepareResponse(status, params, devices) {
  var response = {};
  prepareMeta(response, status);
  if(params) {
    prepareLinks(response, params);
  }
  if(devices) {
    prepareDevices(response, devices, params);
  }
  return response;
};


/**
 * Prepares and adds the _meta to the given API query response
 * @param {Object} response JSON representation of the response
 * @param {Number} status Integer status code
 */
function prepareMeta(response, status) {
  switch(status) {
    case CODE_OK:
      response._meta = { "message": MESSAGE_OK,
                         "statusCode": CODE_OK };
      break;
    case CODE_NOTFOUND:
      response._meta = { "message": MESSAGE_NOTFOUND,
                         "statusCode": CODE_NOTFOUND };
      break;
    case CODE_NOTIMPLEMENTED:
      response._meta = { "message": MESSAGE_NOTIMPLEMENTED,
                         "statusCode": CODE_NOTIMPLEMENTED };
      break;   
    default:
      response._meta = { "message": MESSAGE_BADREQUEST,
                         "statusCode": CODE_BADREQUEST }; 
  }
};


/**
 * Prepares and adds the _links to the given API query response
 * @param {Object} response JSON representation of the response
 * @param {Object} params The query parameters
 */
function prepareLinks(response, params) {
  var selfLink = { "href": params.rootUrl + params.queryPath };
  response._links = {};
  response._links["self"] = selfLink;
}


/**
 * Prepares and adds the devices to the given API query response
 * @param {Object} response JSON representation of the response
 * @param {Object} devices The list of devices
 * @param {Object} params The query parameters
 */
function prepareDevices(response, devices, params) {
  for(device in devices) {
    devices[device].href = params.rootUrl + "/id/" + device;
  }
  response.devices = devices;
}


module.exports.OK = CODE_OK;
module.exports.NOTFOUND = CODE_NOTFOUND;
module.exports.BADREQUEST = CODE_BADREQUEST;
module.exports.NOTIMPLEMENTED = CODE_NOTIMPLEMENTED;
module.exports.prepareResponse = prepareResponse;
