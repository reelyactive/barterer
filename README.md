barterer
========


A real-time location & sensor data API for the IoT
--------------------------------------------------

__barterer__ is an API for the real-time location, identification and sensing of wireless devices, and a core module of reelyActive's [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source middleware for context-aware physical spaces.


Installation
------------

    npm install barterer


Hello barterer!
---------------

    npm start

Browse to [localhost:3001/devices/001bc50940810000/1](http://localhost:3001/devices/001bc50940810000/1) to see if there are any associations for the device with EUI-64 identifier 00-1b-c5-09-40-81-00-00.  By default, this should return Not Found.


REST API
--------

### GET /devices

Retrieve all active devices.

#### Example request

| Method | Route    | Content-Type     |
|:-------|:---------|:-----------------|
| GET    | /devices | application/json |

#### Example response

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/devices"
        }
      },
      "devices": {
        "fee150bada55/2": {},
        "001bc50940810000/1": {},
        "001bc50940820000/1": {}
      }
    }


### GET /devices/{id}/{type}

Retrieve the active device with the given _id_ and _type_.

#### Example request

| Method | Route                   | Content-Type     |
|:-------|:------------------------|:-----------------|
| GET    | /devices/fee150bada55/2 | application/json |

#### Example response

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/devices/fee150bada55/2"
        }
      },
      "devices": {
        "fee150bada55/2": {
          "raddec": {
            "transmitterId": "fee150bada55",
            "transmitterIdType": 2,
            "rssiSignature": [
              {
                "receiverId": "001bc50940820000",
                "receiverIdType": 1,
                "rssi": -71,
                "numberOfDecodings": 2
              },
              {
                "receiverId": "001bc50940810000",
                "receiverIdType": 1,
                "rssi": -84,
                "numberOfDecodings": 2
              }
            ],
            "packets": [
               "(as hexadecimal strings)"
            ],
            "timestamp": 1621865950453,
            "events": [
              2
            ]
          },
          "dynamb": {
            "timestamp": 1621865950453,
            "batteryPercentage": 100,
            "acceleration": [
              -0.46875,
              -0.76953125,
              0.3984375
            ]
          },
          "statid": {
            "uuids": [
              "ffe1",
              "feaa"
            ],
            "uri": "https://sniffypedia.org/Product/Google_Eddystone/",
            "deviceIds": [
              "7265656c652055554944/fee150bada55"
            ],
            "name": "NAME"
          }
        }
      }
    }


Socket.IO
---------

When initialised with a Socket.IO server as an option, __barterer__ supports the following namespaces:
- /devices
- /devices/raddec
- /devices/dynamb
- /devices/{id}/{type}
- /devices/{id}/{type}/raddec
- /devices/{id}/{type}/dynamb

Both raddec and dynamb events are emitted except for namespaces ending with /raddec or /dynamb, in which case only the specified event is emitted.  For an example of the raddec and dynamb JSON structure, see each corresponding object within the sample response of the REST API above.


![barterer logo](https://reelyactive.github.io/barterer/images/barterer-bubble.png)


What's in a name?
-----------------

Barter is a system of exchange by which goods or services are directly exchanged for other goods or services without using a medium of exchange, such as money.  Seems fitting for an API in an open Internet of Things.

Why is barterer represented by a starfish?  Well, in our software architecture, barterer consumes data from barnacles, and in nature, starfish consume barnacles.  One such example is the species [Pisaster ochraceus](http://en.wikipedia.org/wiki/Pisaster_ochraceus).  And, as Wikipedia states, "while most individuals are purple, they can be orange, orange-ochre, yellow, reddish, or brown".  Orange was the only colour in the reelyActive palette which fit, so there you have it, an orange starfish.

If we stretch the story even further, the initials of Pisaster Ochraceus (PO) are the same as the architect of our original API (P-O).  That API was named bartender, but alas, that name had already been claimed on npmjs, and so we exchanged it for barterer (pun intended, as usual).

Why is the starfish holding scales with a one and a zero?  Because he's bartering digital information of course!


Contributing
------------

Discover [how to contribute](CONTRIBUTING.md) to this open source project which upholds a standard [code of conduct](CODE_OF_CONDUCT.md).


Security
--------

Consult our [security policy](SECURITY.md) for best practices using this open source software and to report vulnerabilities.

[![Known Vulnerabilities](https://snyk.io/test/github/reelyactive/barterer/badge.svg)](https://snyk.io/test/github/reelyactive/barterer)


License
-------

MIT License

Copyright (c) 2015-2022 reelyActive

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.

