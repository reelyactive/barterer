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

  header.appendChild(headerIcon);
  header.appendChild(headerText);
  footer.appendChild(footerIcon);
  footer.appendChild(footerSpace);
  footer.appendChild(footerText);
  card.appendChild(header);

  if(!isEmptyDevice) {
    let accordion = createDeviceAccordion(device);
    body.appendChild(accordion);
    card.appendChild(body);
  }

  card.appendChild(footer);

  return card;
}


// Create the device accordion visualisation
function createDeviceAccordion(device) {
  let accordionId = 'deviceAccordion';
  let accordion = createElement('div', 'accordion accordion-flush');
  accordion.setAttribute('id', accordionId);

  if(device.hasOwnProperty('raddec')) {
    let raddecContent = createRaddecContent(device.raddec);
    let raddecItem = createAccordionItem('raddec', accordionId, raddecContent);
    accordion.appendChild(raddecItem);
  }
  if(device.hasOwnProperty('dynamb')) {
    let dynambContent = createDynambContent(device.dynamb);
    let dynambItem = createAccordionItem('dynamb', accordionId, dynambContent);
    accordion.appendChild(dynambItem);
  }
  if(device.hasOwnProperty('statid')) {
    let statidContent = createStatidContent(device.statid);
    let statidItem = createAccordionItem('statid', accordionId, statidContent);
    accordion.appendChild(statidItem);
  }

  return accordion;
}


// Create the raddec visualisation
function createRaddecContent(raddec) {
  let content = new DocumentFragment();
  let raddecList = createRaddecList(raddec);
  let rssiSignatureTable = createRssiSignatureTable(raddec.rssiSignature);
  let packetsAccordion = createPacketsAccordion(raddec.packets);

  content.appendChild(raddecList);
  content.appendChild(rssiSignatureTable);
  content.appendChild(packetsAccordion);

  return content;
}


// Create the dynamb visualisation
function createDynambContent(dynamb) {
  let content = new DocumentFragment();
  let table = createElement('table', 'table table-hover');
  let caption = createElement('caption', 'caption-top');
  let captionIcon = createElement('i', 'fas fa-clock');
  let tbody = createElement('tbody');

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
  content.appendChild(table);

  return content;
}


// Create the statid visualisation
function createStatidContent(statid) {
  let content = new DocumentFragment();
  let table = createElement('table', 'table table-hover');
  let tbody = createElement('tbody');

  for(const property in statid) {
    let row = createElement('tr');
    let th = createElement('th', null, property);
    let td = createElement('td', 'font-monospace', statid[property]);

    row.appendChild(th);
    row.appendChild(td);
    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  content.appendChild(table);

  return content;
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


// Create an accordion item
function createAccordionItem(name, parentName, content) {
  let accordionItem = createElement('div', 'accordion-item');
  let accordionHeader = createElement('h2', 'accordion-header');
  let accordionButton = createElement('button', 'accordion-button', name);
  let accordionCollapse = createElement('div',
                                        'accordion-collapse collapse show');
  let accordionBody = createElement('div', 'accordion-body');
  let accordionCollapseId = name + 'Collapse';

  accordionButton.setAttribute('type', 'button');
  accordionButton.setAttribute('data-bs-toggle', 'collapse');
  accordionButton.setAttribute('data-bs-target', '#' + accordionCollapseId);
  accordionCollapse.setAttribute('id', accordionCollapseId);
  accordionCollapse.setAttribute('data-bs-parent', '#' + parentName);

  accordionHeader.appendChild(accordionButton);
  accordionBody.appendChild(content);
  accordionCollapse.appendChild(accordionBody);
  accordionItem.appendChild(accordionHeader);
  accordionItem.appendChild(accordionCollapse);

  return accordionItem;
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
