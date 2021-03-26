/**
 * Copyright reelyActive 2015-2021
 * We believe in an open Internet of Things
 */


// Constants
const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_BAD_REQUEST = 400;
const STATUS_NOT_FOUND = 404;
const MESSAGE_BAD_REQUEST = 'Bad Request [400].  An error likely occurred on the server.';
const MESSAGE_NOT_FOUND = 'Association for this device Not Found [404].';
const DEVICES_ROUTE = '/devices';


// DOM elements
let jsonResponse = document.querySelector('#jsonResponse');
let identifier = document.querySelector('#identifier');
let loading = document.querySelector('#loading');
let error = document.querySelector('#error');
let errorMessage = document.querySelector('#errorMessage');
let devices = document.querySelector('#devices');


// Other variables
let devicesUrl = window.location.href;
let devicesIndex = devicesUrl.indexOf(DEVICES_ROUTE);
let deviceIdSignature = devicesUrl.substring(devicesIndex + 9);


// Initialisation: GET the associations and display in DOM
getDevices(devicesUrl, function(status, response) {
  identifier.textContent = deviceIdSignature;
  jsonResponse.textContent = JSON.stringify(response, null, 2);
  loading.hidden = true;

  if(status === STATUS_OK) {
    //deviceIdSignature = Object.keys(response.devices)[0];
    identifier.textContent = deviceIdSignature;
    devices.hidden = false;
  }
  else if(status === STATUS_BAD_REQUEST) {
    errorMessage.textContent = MESSAGE_BAD_REQUEST;
    error.hidden = false;
  }
  else if(status === STATUS_NOT_FOUND) {
    errorMessage.textContent = MESSAGE_NOT_FOUND;
    error.hidden = false;
  }
});


// GET the associations
function getDevices(url, callback) {
  let httpRequest = new XMLHttpRequest();

  httpRequest.onreadystatechange = function() {
    if(httpRequest.readyState === XMLHttpRequest.DONE) {
      return callback(httpRequest.status,
                      JSON.parse(httpRequest.responseText));
    }
  };
  httpRequest.open('GET', url);
  httpRequest.setRequestHeader('Accept', 'application/json');
  httpRequest.send();
}
