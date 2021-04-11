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
const MESSAGE_NOT_FOUND = 'Device Not Found [404].';
const DEVICES_ROUTE = '/devices';
const SIGNATURE_SEPARATOR = '/';
const IDENTIFIER_TYPES = [
    'Unknown',
    'EUI-64',
    'EUI-48',
    'RND-48'
];
const EVENT_ICONS = [
    'fas fa-sign-in-alt',
    'fas fa-route',
    'fas fa-info',
    'fas fa-heartbeat',
    'fas fa-sign-out-alt'
];


// DOM elements
let jsonResponse = document.querySelector('#jsonResponse');
let loading = document.querySelector('#loading');
let error = document.querySelector('#error');
let errorMessage = document.querySelector('#errorMessage');
let devices = document.querySelector('#devices');


// Other variables
let queryUrl = window.location.href;
let devicesUrl = window.location.protocol + '//' + window.location.hostname +
                 ':' + window.location.port + DEVICES_ROUTE;


// Initialisation: GET the associations and display in DOM
getDevices(queryUrl, function(status, response) {
  jsonResponse.textContent = JSON.stringify(response, null, 2);
  loading.hidden = true;

  if(status === STATUS_OK) {
    updateDevices(response.devices);
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



// Update the devices in the DOM
function updateDevices(devicesList) {
  for(const deviceSignature in devicesList) {
    let device = devicesList[deviceSignature];
    let deviceCard = createDeviceCard(deviceSignature, device);
    devices.appendChild(deviceCard);
  }
}


// Create the device card visualisation
function createDeviceCard(signature, device) {
  let isEmptyDevice = (Object.keys(device).length === 0);
  let deviceUrl = devicesUrl + '/' + signature;
  let card = createElement('div', 'card mb-1');
  let header = createElement('div', 'card-header bg-dark text-white lead');
  let headerIcon = createElement('i', 'fas fa-barcode');
  let headerText = createElement('span', 'font-monospace', ' ' + signature);
  let body = createElement('div', 'card-body');
  let footer = createElement('small', 'card-footer');
  let footerIcon = createElement('i', 'fas fa-link text-muted');
  let footerSpace = document.createTextNode(' ');
  let footerText = createElement('a', 'text-truncate', deviceUrl);
  footerText.setAttribute('href', deviceUrl);

  if(device.hasOwnProperty('raddec')) {
    let raddecCard = createRaddecCard(device.raddec);
    body.appendChild(raddecCard);
  }
  if(device.hasOwnProperty('dynamb')) {
    let dynambCard = createDynambCard(device.dynamb);
    body.appendChild(dynambCard);
  }
  if(device.hasOwnProperty('statid')) {
    let statidCard = createStatidCard(device.statid);
    body.appendChild(statidCard);
  }

  header.appendChild(headerIcon);
  header.appendChild(headerText);
  footer.appendChild(footerIcon);
  footer.appendChild(footerSpace);
  footer.appendChild(footerText);
  card.appendChild(header);
  if(!isEmptyDevice) { card.appendChild(body); }
  card.appendChild(footer);

  return card;
}


// Create the raddec card visualisation
function createRaddecCard(raddec) {
  let card = createElement('div', 'card my-2');
  let body = createElement('div', 'card-body');
  let raddecList = createRaddecList(raddec);
  let rssiSignatureTable = createRssiSignatureTable(raddec.rssiSignature);
  let packetsAccordion = createPacketsAccordion(raddec.packets);
  let footer = createElement('div', 'card-footer');
  let footerText = createElement('small', 'text-muted');

  footerText.textContent = 'raddec';

  body.appendChild(raddecList);
  body.appendChild(rssiSignatureTable);
  body.appendChild(packetsAccordion);
  footer.appendChild(footerText);
  card.appendChild(body);
  card.appendChild(footer);

  return card;
}


// Create the dynamb card visualisation
function createDynambCard(dynamb) {
  let card = createElement('div', 'card my-2');
  let body = createElement('div', 'card-body');
  let table = createElement('table', 'table table-hover');
  let caption = createElement('caption', 'caption-top');
  let captionIcon = createElement('i', 'fas fa-clock');
  let tbody = createElement('tbody');
  let footer = createElement('div', 'card-footer');
  let footerText = createElement('small', 'text-muted');

  footerText.textContent = 'dynamb';

  for(const property in dynamb) {
    if(property === 'timestamp') {
      let localeTimestamp = new Date(dynamb['timestamp']).toLocaleTimeString();
      let captionText = document.createTextNode(' \u00a0' + localeTimestamp);

      caption.appendChild(captionIcon);
      caption.appendChild(captionText);
      table.appendChild(caption);
    }
    else {
      let row = createElement('tr');
      let th = createElement('th', null, property);
      let td = createElement('td', 'font-monospace', dynamb[property]);

      row.appendChild(th);
      row.appendChild(td);
      tbody.appendChild(row);
    }
  }

  table.appendChild(tbody);
  body.appendChild(table);
  footer.appendChild(footerText);
  card.appendChild(body);
  card.appendChild(footer);

  return card;
}


// Create the statid card visualisation
function createStatidCard(statid) {
  let card = createElement('div', 'card my-2');
  let body = createElement('div', 'card-body');
  let table = createElement('table', 'table table-hover');
  let tbody = createElement('tbody');
  let footer = createElement('div', 'card-footer');
  let footerText = createElement('small', 'text-muted');

  footerText.textContent = 'statid';

  for(const property in statid) {
    let row = createElement('tr');
    let th = createElement('th', null, property);
    let td = createElement('td', 'font-monospace', statid[property]);

    row.appendChild(th);
    row.appendChild(td);
    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  body.appendChild(table);
  footer.appendChild(footerText);
  card.appendChild(body);
  card.appendChild(footer);

  return card;
}


// Create the identifier, timestamp and events inline list visualisation
function createRaddecList(raddec) {
  let ul = createElement('ul', 'list-inline text-center');
  let transmitterId = createElement('li', 'list-inline-item mx-3');
  let transmitterIdIcon = createElement('i', 'fas fa-wifi text-ambient');
  let transmitterIdValue = createElement('span', 'font-monospace', ' \u00a0' +
                                                   raddec.transmitterId);
  let transmitterIdType = createElement('li', 'list-inline-item mx-3');
  let transmitterIdTypeIcon = createElement('i',
                                           'fas fa-info-circle text-ambient');
  let transmitterIdTypeValue = document.createTextNode(' \u00a0' +
                                    IDENTIFIER_TYPES[raddec.transmitterIdType]);
  let timestamp = createElement('li', 'list-inline-item mx-3');
  let timestampIcon = createElement('i', 'fas fa-clock text-muted');
  let timestampValue = document.createTextNode(' \u00a0' + 
                               new Date(raddec.timestamp).toLocaleTimeString());
  let events = createElement('li', 'list-inline-item mx-3');
  let eventsIcon = createElement('i', 'fas fa-exchange-alt text-muted');
  let eventsValue = createEventElements(raddec.events);

  transmitterId.appendChild(transmitterIdIcon);
  transmitterId.appendChild(transmitterIdValue);
  transmitterIdType.appendChild(transmitterIdTypeIcon);
  transmitterIdType.appendChild(transmitterIdTypeValue);
  timestamp.appendChild(timestampIcon);
  timestamp.appendChild(timestampValue);
  events.appendChild(eventsIcon);
  events.appendChild(eventsValue);
  ul.appendChild(transmitterId);
  ul.appendChild(transmitterIdType);
  ul.appendChild(timestamp);
  ul.appendChild(events);

  return ul;
}

// Create the rssiSignature table visualisation
function createRssiSignatureTable(rssiSignature) {
  let table = createElement('table', 'table table-hover');
  let caption = createElement('caption', null, 'rssiSignature');
  let thead = createElement('thead');
  let tbody = createElement('tbody');
  let headrow = createElement('tr');
  let receiver = createElement('th');
  let receiverIcon = createElement('i', 'fas fa-broadcast-tower text-success');
  let decodings = createElement('th');
  let decodingsIcon = createElement('i', 'fas fa-hashtag text-success');
  let rssi = createElement('th');
  let rssiIcon = createElement('i', 'fas fa-signal text-success');
  
  receiver.appendChild(receiverIcon);
  decodings.appendChild(decodingsIcon);
  rssi.appendChild(rssiIcon);
  headrow.appendChild(receiver);
  headrow.appendChild(decodings);
  headrow.appendChild(rssi);
  thead.appendChild(headrow);

  rssiSignature.forEach(function(item, index) {
    let signature = item.receiverId + SIGNATURE_SEPARATOR + item.receiverIdType;
    let rowClass = (index === 0) ? 'table-success' : null;
    let row = createElement('tr', rowClass);
    let receiverSignature = createElement('td', 'font-monospace', signature);
    let numberOfDecodings = createElement('td', null, item.numberOfDecodings);
    let rssiValue = createElement('td', null, item.rssi + ' dBm');

    row.appendChild(receiverSignature);
    row.appendChild(numberOfDecodings);
    row.appendChild(rssiValue);
    tbody.appendChild(row);
  });

  table.appendChild(caption);
  table.appendChild(thead);
  table.appendChild(tbody);

  return table;
}


// Create the packets accordion visualisation
function createPacketsAccordion(packets) {
  let accordion = createElement('div', 'accordion accordion-flush');
  let accordionItem = createElement('div', 'accordion-item');
  let accordionHeader = createElement('h5', 'accordion-header');
  let accordionButton = createElement('button', 'accordion-button collapsed',
                                      'Packets (' + packets.length + ')');
  let accordionCollapse = createElement('div', 'accordion-collapse collapse');
  let accordionBody = createElement('ul', 'accordion-body list-unstyled');

  packets.forEach(function(packet) {
    let packetListItem = createElement('li', 'font-monospace user-select-all',
                                   packet);
    accordionBody.appendChild(packetListItem);
  });

  accordion.setAttribute('id', 'packetsAccordion');
  accordionButton.setAttribute('data-bs-toggle', 'collapse');
  accordionButton.setAttribute('data-bs-target', '#packetsCollapse');
  accordionCollapse.setAttribute('id', 'packetsCollapse');
  accordionCollapse.setAttribute('data-bs-parent', '#packetsAccordion');

  accordionHeader.appendChild(accordionButton);
  accordionCollapse.appendChild(accordionBody);
  accordionItem.appendChild(accordionHeader);
  accordionItem.appendChild(accordionCollapse);
  accordion.appendChild(accordionItem);

  return accordion;
}


// Prepare the event icons as a DocumentFragment
function createEventElements(events) {
  let elements = document.createDocumentFragment();

  events.forEach(function(event) {
    let space = document.createTextNode(' \u00a0');
    let i = createElement('i', EVENT_ICONS[event]);
    elements.appendChild(space);
    elements.appendChild(i);
  });

  return elements;
}


// Create an element as specified
function createElement(elementName, classNames, textContent) {
  let element = document.createElement(elementName);

  if(classNames) {
    element.setAttribute('class', classNames);
  }

  if(textContent) {
    element.textContent = textContent;
  }

  return element;
}
