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
const POLLING_INTERVAL_MILLISECONDS = 10000;
const DEVICES_ROUTE = '/devices';
const CYTOSCAPE_URL = '/js/cytoscape.min.js';
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
const HLC_MIN_HEIGHT_PX = 480;
const HLC_UNUSABLE_HEIGHT_PX = 260;
const GRID_LAYOUT_OPTIONS = {
    name: "grid"
};
const COSE_LAYOUT_OPTIONS = {
    name: "cose",
    animate: false,
    randomize: false,
    initialTemp: 40
};
const GRAPH_STYLE = [
    { selector: "node[type='transmitter']",
      style: { "background-color": "#83b7d0", label: "data(id)",
               "font-family": "monospace", "font-size": "0.6em",
               "min-zoomed-font-size": "16px" } },
    { selector: "node[type='receiver']",
      style: { "background-color": "#aec844", label: "data(id)",
               "font-family": "monospace", "font-size": "0.4em",
               "min-zoomed-font-size": "16px" } },
    { selector: "node[image]",
      style: { "background-image": "data(image)", "border-color": "#aec844",
               "background-fit": "cover cover", "border-width": "2px" } },
    { selector: "edge", style: { "curve-style": "haystack",
                                 "line-color": "#ddd", label: "data(rssi)",
                                 "text-rotation": "autorotate",
                                 color: "#5a5a5a", "font-size": "0.25em",
                                 "min-zoomed-font-size": "12px" } },
];


// DOM elements
let connection = document.querySelector('#connection');
let noUpdates = document.querySelector('#settingsNoUpdates');
let realTimeUpdates = document.querySelector('#settingsRealTimeUpdates');
let periodicUpdates = document.querySelector('#settingsPeriodicUpdates');
let jsonResponse = document.querySelector('#jsonResponse');
let loading = document.querySelector('#loading');
let error = document.querySelector('#error');
let errorMessage = document.querySelector('#errorMessage');
let devices = document.querySelector('#devices');
let humanTab = document.querySelector('#humantab');
let hlcTab = document.querySelector('#hlctab');
let machineTab = document.querySelector('#machinetab');


// Other variables
let queryUrl = window.location.href;
let devicesUrl = window.location.protocol + '//' + window.location.hostname +
                 ':' + window.location.port + DEVICES_ROUTE;
let isPollPending = false;
let isHyperlocalContextSelected = false;
let pollingInterval;
let machineReadableData;
let socket;
let cy;
let layout;


// Monitor each settings radio button
noUpdates.onchange = updateUpdates;
realTimeUpdates.onchange = updateUpdates;
periodicUpdates.onchange = updateUpdates;


// Render/remove the hyperlocal context graph upon tab selection
humanTab.onclick = unselectHyperlocalContext;
hlcTab.onclick = selectHyperlocalContext;
machineTab.onclick = unselectHyperlocalContext;


// Initialisation: poll the devices once and display the result
pollAndDisplay();


// GET the devices and display in DOM
function pollAndDisplay() {
  if(!isPollPending) {
    isPollPending = true;
    loading.hidden = false;
    error.hidden = true;
    devices.hidden = true;

    getDevices(queryUrl, function(status, response) {
      machineReadableData = response;
      jsonResponse.textContent = JSON.stringify(machineReadableData, null, 2);
      loading.hidden = true;
      isPollPending = false;

      if(status === STATUS_OK) {
        let isSpecificDevice = (window.location.pathname.length >
                                DEVICES_ROUTE.length + 1);
        updateDevices(response.devices);
        devices.hidden = false;

        if(isSpecificDevice) {
          realTimeUpdates.disabled = false;
        }
        if(isHyperlocalContextSelected) {
          renderHyperlocalContext();
        }
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
  }
}


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
  let content = new DocumentFragment();

  for(const deviceSignature in devicesList) {
    let device = devicesList[deviceSignature];
    let deviceCard = createDeviceCard(deviceSignature, device);
    content.appendChild(deviceCard);
  }

  devices.replaceChildren(content);
}


// Create the device card visualisation
function createDeviceCard(signature, device) {
  let isEmptyDevice = (Object.keys(device).length === 0);
  let deviceUrl = devicesUrl + '/' + signature;
  let headerIcon = createElement('i', 'fas fa-barcode');
  let headerText = createElement('span', 'font-monospace', ' ' + signature);
  let header = createElement('div', 'card-header bg-dark text-white lead',
                             [ headerIcon, headerText ]);
  let body = createElement('div', 'card-body');
  let footerIcon = createElement('i', 'fas fa-link text-muted');
  let footerText = createElement('a', 'text-truncate', deviceUrl);
  let footer = createElement('small', 'card-footer',
                             [ footerIcon, ' ', footerText ]);
  let card = createElement('div', 'card mb-1', header);

  footerText.setAttribute('href', deviceUrl);

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
    let raddecIcon = createElement('i', 'fas fa-satellite-dish');
    let raddecTitle = createElement('span', null,
                                    [ raddecIcon, '\u00a0 raddec' ]);
    let raddecItem = createAccordionItem('raddec', accordionId, raddecTitle,
                                         raddecContent, 'raddeccontainer');
    accordion.appendChild(raddecItem);
  }
  if(device.hasOwnProperty('dynamb')) {
    let dynambContent = cuttlefishDynamb.render(device.dynamb);
    let dynambIcon = createElement('i', 'fas fa-tachometer-alt');
    let dynambTitle = createElement('span', null,
                                    [ dynambIcon, '\u00a0 dynamb' ]);
    let dynambItem = createAccordionItem('dynamb', accordionId, dynambTitle,
                                         dynambContent, 'dynambcontainer');
    accordion.appendChild(dynambItem);
  }
  if(device.hasOwnProperty('statid')) {
    let statidContent = createStatidContent(device.statid);
    let statidIcon = createElement('i', 'fas fa-id-card');
    let statidTitle = createElement('span', null,
                                    [ statidIcon, '\u00a0 statid' ]);
    let statidItem = createAccordionItem('statid', accordionId, statidTitle,
                                         statidContent);
    accordion.appendChild(statidItem);
  }

  return accordion;
}


// Create the raddec visualisation
function createRaddecContent(raddec) {
  let deviceIcon = createElement('i', 'fas fa-wifi');
  let deviceHeader = createElement('th', 'bg-ambient text-white text-center',
                                   deviceIcon);
  let deviceId = raddec.transmitterId + ' / ' +
                 IDENTIFIER_TYPES[raddec.transmitterIdType];
  let deviceText = createElement('td', 'font-monospace', deviceId);
  let deviceRow = createElement('tr', null, [ deviceHeader, deviceText ]);
  let eventIcon = createElement('i', 'fas fa-exchange-alt');
  let eventHeader = createElement('th', 'bg-info text-white text-center',
                                   eventIcon);
  let eventElements = createEventElements(raddec.events);
  let eventTimestamp =  ' \u00a0@ ' +
                        new Date(raddec.timestamp).toLocaleTimeString();
  let eventText = createElement('td', null, [ eventElements, eventTimestamp ]);
  let eventRow = createElement('tr', null, [ eventHeader, eventText ]);
  let receiverIcon = createElement('i', 'fas fa-broadcast-tower');
  let receiverHeader = createElement('th', 'bg-success text-white text-center',
                                     receiverIcon);
  let receiverTable = createElement('td', null,
                                createRssiSignatureTable(raddec.rssiSignature));
  let receiverRow = createElement('tr', null, [ receiverHeader,
                                                receiverTable ]);
  let packetsIcon = createElement('i', 'fas fa-info');
  let packetsHeader = createElement('th', 'bg-ambient text-white text-center',
                                    packetsIcon);
  let packetsCollapse = createElement('td', null, 
                                      createPacketsCollapse(raddec.packets));
  let packetsRow = createElement('tr', null, [ packetsHeader,
                                               packetsCollapse ]);
  let tbody = createElement('tbody', null, [ deviceRow, eventRow, receiverRow,
                                             packetsRow ]);
  let table = createElement('table', 'table', tbody);

  return table;
}


// Create the statid visualisation
function createStatidContent(statid) {
  let tbody = createElement('tbody');

  for(const property in statid) {
    let th = createElement('th', null, property);
    let td = createElement('td', 'font-monospace', statid[property].toString());
    let row = createElement('tr', null, [ th, td ]);
    tbody.appendChild(row);
  }

  return createElement('table', 'table table-hover', tbody);
}


// Create the rssiSignature table visualisation
function createRssiSignatureTable(rssiSignature) {
  let tbody = createElement('tbody');

  rssiSignature.forEach(function(item, index) {
    let signature = item.receiverId + SIGNATURE_SEPARATOR + item.receiverIdType;
    let rowClass = (index === 0) ? 'table-success' : null;
    let receiverSignature = createElement('td', 'font-monospace', signature);
    let decodingText = item.numberOfDecodings + ' @ ' + item.rssi + ' dBm';
    let decodings = createElement('td', 'font-monospace', decodingText);
    let row = createElement('tr', rowClass, [ receiverSignature, decodings ]);

    tbody.appendChild(row);
  });

  return createElement('table', 'table table-hover mb-0', tbody);
}


// Create the packets collapse visualisation
function createPacketsCollapse(packets) {
  let content = new DocumentFragment();
  let button = createElement('button', 'btn btn-outline-ambient btn-sm',
                             'Packets (' + packets.length + ')');
  let collapse = createElement('ul', 'collapse list-unstyled mt-2');

  packets.forEach(function(packet) {
    let packetHex = createElement('small', 'user-select-all', packet);
    let packetListItem = createElement('li', 'font-monospace', packetHex);
    collapse.appendChild(packetListItem);
  });

  button.setAttribute('data-bs-toggle', 'collapse');
  button.setAttribute('data-bs-target', '#packetsCollapse');
  collapse.setAttribute('id', 'packetsCollapse');

  content.appendChild(button);
  content.appendChild(collapse);

  return content;
}


// Prepare the event icons as a DocumentFragment
function createEventElements(events) {
  let elements = new DocumentFragment();

  events.forEach(function(event) {
    let space = document.createTextNode(' \u00a0');
    let i = createElement('i', EVENT_ICONS[event]);
    elements.appendChild(space);
    elements.appendChild(i);
  });

  return elements;
}


// Create an accordion item
function createAccordionItem(name, parentName, title, content, contentId) {
  let accordionCollapseId = name + 'Collapse';
  let accordionButton = createElement('button', 'accordion-button', title);
  let accordionHeader = createElement('h2', 'accordion-header',
                                      accordionButton);
  let accordionBody = createElement('div', 'accordion-body', content);
  let accordionCollapse = createElement('div',
                                        'accordion-collapse collapse show',
                                        accordionBody);
  let accordionItem = createElement('div', 'accordion-item overflow-hidden',
                                    [ accordionHeader, accordionCollapse ]);

  accordionButton.setAttribute('type', 'button');
  accordionButton.setAttribute('data-bs-toggle', 'collapse');
  accordionButton.setAttribute('data-bs-target', '#' + accordionCollapseId);
  accordionCollapse.setAttribute('id', accordionCollapseId);
  accordionCollapse.setAttribute('data-bs-parent', '#' + parentName);

  if(contentId) {
    accordionBody.setAttribute('id', contentId);
  }

  return accordionItem;
}


// Create an element as specified
function createElement(elementName, classNames, content) {
  let element = document.createElement(elementName);

  if(classNames) {
    element.setAttribute('class', classNames);
  }

  if((content instanceof Element) || (content instanceof DocumentFragment)) {
    element.appendChild(content);
  }
  else if(Array.isArray(content)) {
    content.forEach(function(item) {
      if((item instanceof Element) || (item instanceof DocumentFragment)) {
        element.appendChild(item);
      }
      else {
        element.appendChild(document.createTextNode(item));
      }
    });
  }
  else if(content) {
    element.appendChild(document.createTextNode(content));
  }

  return element;
}


// Create and manage a socket.io connection
function createSocket() {
  socket = io(window.location.pathname);

  socket.on('connect', function() {
    connection.replaceChildren(createElement('i', 'fas fa-cloud text-success'));
  });

  socket.on('raddec', function(raddec) {
    let raddecContent = createRaddecContent(raddec);
    let raddecContainer = document.querySelector('#raddeccontainer');
    let signature = raddec.transmitterId + SIGNATURE_SEPARATOR +
                    raddec.transmitterIdType;
    machineReadableData.devices[signature].raddec = raddec;
    jsonResponse.textContent = JSON.stringify(machineReadableData, null, 2);

    raddecContainer.replaceChildren(raddecContent);

    if(isHyperlocalContextSelected) {
      renderHyperlocalContext();
    }
  });

  socket.on('dynamb', function(dynamb) {
    let dynambContent = cuttlefishDynamb.render(dynamb);
    let dynambContainer = document.querySelector('#dynambcontainer');
    let signature = dynamb.deviceId + SIGNATURE_SEPARATOR +
                    dynamb.deviceIdType;
    machineReadableData.devices[signature].dynamb = dynamb;
    jsonResponse.textContent = JSON.stringify(machineReadableData, null, 2);

    dynambContainer.replaceChildren(dynambContent);
  });

  socket.on('connect_error', function() {
    connection.replaceChildren(createElement('i', 'fas fa-cloud text-danger'));
  });

  socket.on('disconnect', function() {
    connection.replaceChildren(createElement('i', 'fas fa-cloud text-warning'));
  });
}


// Update the update method
function updateUpdates(event) {
  if(noUpdates.checked) {
    connection.hidden = true;
    if(socket) { socket.disconnect(); }
    clearInterval(pollingInterval);
  }

  if(realTimeUpdates.checked) { 
    connection.hidden = false;
    clearInterval(pollingInterval);
    createSocket();
  }

  if(periodicUpdates.checked) {
    connection.hidden = true;
    if(socket) { socket.disconnect(); }
    pollAndDisplay();
    pollingInterval = setInterval(pollAndDisplay,
                                  POLLING_INTERVAL_MILLISECONDS);
  }
}


// Add a device node to the hyperlocal context graph
function addDeviceNode(deviceSignature, device) {
  cy.add({ group: "nodes", renderedPosition: { x: 0, y: 0 },
           data: { id: deviceSignature, type: "transmitter" } });

  if(device.hasOwnProperty('raddec')) {
    device.raddec.rssiSignature.forEach(function(entry) {
      let receiverSignature = entry.receiverId + SIGNATURE_SEPARATOR +
                              entry.receiverIdType;
      let edgeSignature = deviceSignature + '@' + receiverSignature;
      isExistingNode = (cy.getElementById(receiverSignature).size() > 0);
      isExistingEdge = (cy.getElementById(edgeSignature).size() > 0);

      if(!isExistingNode) {
        cy.add({ group: "nodes", data: { id: receiverSignature,
                                         type: "receiver" } });
      }
      if(!isExistingEdge) {
        cy.add({ group: "edges", data: { id: edgeSignature,
                                         source: deviceSignature,
                                         target: receiverSignature,
                                         rssi: entry.rssi + "dBm" } });
      }
    });
  }
}


// Unselect the hyperlocal context graph tab
function unselectHyperlocalContext() {
  isHyperlocalContextSelected = false;

  let container = document.getElementById('cy-container');

  container.setAttribute('style', 'height: 0px');
}


// Select the hyperlocal context graph tab
function selectHyperlocalContext() {
  isHyperlocalContextSelected = true;

  let container = document.getElementById('cy-container');
  let height = Math.max(window.innerHeight - HLC_UNUSABLE_HEIGHT_PX,
                        HLC_MIN_HEIGHT_PX) + 'px';
  container.setAttribute('style', 'height:' + height);

  renderHyperlocalContext();
}


// Render the hyperlocal context graph
function renderHyperlocalContext() {
  let options = {
      container: document.getElementById('cy'),
      layout: GRID_LAYOUT_OPTIONS,
      style: GRAPH_STYLE
  };
  let layoutName = 'grid';
  let isSpecificDevice = (window.location.pathname.length >
                          DEVICES_ROUTE.length + 1);

  if(isSpecificDevice) {
    options.layout = COSE_LAYOUT_OPTIONS;
    layoutName = 'cose';
  }

  cy = cytoscape(options);
  layout = cy.layout({ name: layoutName, cy: cy });

  if(machineReadableData) {
    let devicesList = machineReadableData.devices || {};

    for(const deviceSignature in devicesList) {
      let device = devicesList[deviceSignature];

      addDeviceNode(deviceSignature, device);
    }
  }

  layout.stop();
  layout = cy.elements().makeLayout(options.layout);
  layout.run();
}