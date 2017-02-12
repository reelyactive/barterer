barterer
========


A real-time location & sensor data API for the IoT
--------------------------------------------------

barterer is an API for the real-time location of wireless devices.  It answers queries concerning _where is_ and _what near_ a given transmitting device as well as _what at_ a given receiving device.  The responses include the parsed wireless packet data and the identifiers and signal strength of all receiving devices.

__In the scheme of Things (pun intended)__

The [barnowl](https://www.npmjs.com/package/barnowl), [barnacles](https://www.npmjs.com/package/barnacles), barterer and [chickadee](https://www.npmjs.com/package/chickadee) packages all work together as a unit, conveniently bundled as [hlc-server](https://www.npmjs.com/package/hlc-server).  Check out our [developer page](https://reelyactive.github.io/) for more resources on reelyActive software and hardware.


![barterer logo](http://reelyactive.github.io/barterer/images/barterer-bubble.png)


What's in a name?
-----------------

Barter is a system of exchange by which goods or services are directly exchanged for other goods or services without using a medium of exchange, such as money.  Seems fitting for an API in an open Internet of Things.

Why is barterer represented by a starfish?  Well, in our software architecture, barterer consumes data from barnacles, and in nature, starfish consume barnacles.  One such example is the species [Pisaster ochraceus](http://en.wikipedia.org/wiki/Pisaster_ochraceus).  And, as Wikipedia states, "while most individuals are purple, they can be orange, orange-ochre, yellow, reddish, or brown".  Orange was the only colour in the reelyActive palette which fit, so there you have it, an orange starfish.

If we stretch the story even further, the initials of Pisaster Ochraceus (PO) are the same as the architect of our original API (P-O).  That API was named bartender, but alas, that name had already been claimed on npmjs, and so we exchanged it for barterer (pun intended, as usual).

Why is the starfish holding scales with a one and a zero?  Because he's bartering digital information of course!


Installation
------------

    npm install barterer


Hello barterer, barnacles & barnowl
-----------------------------------

```javascript
var barterer = require('barterer');
var barnacles = require('barnacles');
var barnowl = require('barnowl');

var api = new barterer();
var notifications = new barnacles();
var middleware = new barnowl( { n: 2 } );

middleware.bind( { protocol: 'test', path: 'default' } );
notifications.bind( { barnowl: middleware } );
api.bind( { barnacles: notifications } );
```

When the above is run, you can query _whereis_ a given (transmitting) device, _whatat_ a given (receiving) device, and _whatnear_ a given (transmitting) device:
- [http://localhost:3001/whereis/transmitter/001bc50940100000](http://localhost:3001/whereis/transmitter/001bc50940100000)
- [http://localhost:3001/whatat/receiver/001bc50940800000](http://localhost:3001/whatat/receiver/001bc50940800000)
- [http://localhost:3001/whatnear/transmitter/001bc50940100000](http://localhost:3001/whatnear/transmitter/001bc50940100000)


RESTful interactions
--------------------

__GET /whereis/transmitter/{device-id}/__

Retrieve the most recent transmission by the given device id.  The response includes all the receiver devices which decoded this transmission, ordered by decreasing RSSI.  For example, the id _fee150bada55_ would be queried as GET /whereis/transmitter/fee150bada55 and might return:

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/whereis/transmitter/fee150bada55"
        }
      },
      "devices": {
        "fee150bada55": {
          "identifier": {
          {
            "type": "ADVA-48",
            "value": "fee150bada55",
            "advHeader": {
              "type": "ADV_NONCONNECT_IND",
              "length": 22,
              "txAdd": "random",
              "rxAdd": "public"
            },
            "advData": {
              "flags": [
                "LE Limited Discoverable Mode",
                "BR/EDR Not Supported"
              ],
              "completeLocalName": "reelyActive"
            }
          },
          "timestamp": "2015-01-01T12:34:56.789Z",
          "radioDecodings": [
            {
              "rssi": 136,
              "identifier": {
                "type": "EUI-64",
                "value": "001bc50940810000"
              },
              "href": "http://localhost:3001/whatat/receiver/001bc50940810000"
            },
            {
              "rssi": 130,
              "identifier": {
                "type": "EUI-64",
                "value": "001bc50940810001"
              },
              "href": "http://localhost:3001/whatat/receiver/001bc50940810001"
            }
          ],
          "href": "http://localhost:3001/whereis/transmitter/fee150bada55"
        }
      }
    }

__GET /whatat/receiver/{device-id}/__

Retrieve all the most recent transmissions decoded by the receiver device with the given device id.  For example, the id _001bc50940810000_ would be queried as GET /whatat/receiver/001bc50940810000 and might return:

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/whatat/receiver/001bc50940810000"
        }
      },
      "devices": {
        "fee150bada55": {
          "identifier": {
          {
            "type": "ADVA-48",
            "value": "fee150bada55",
            "advHeader": {
              "type": "ADV_NONCONNECT_IND",
              "length": 22,
              "txAdd": "random",
              "rxAdd": "public"
            },
            "advData": {
              "flags": [
                "LE Limited Discoverable Mode",
                "BR/EDR Not Supported"
              ],
              "completeLocalName": "reelyActive"
            }
          },
          "timestamp": "2015-01-01T12:34:56.789Z",
          "radioDecodings": [
            {
              "rssi": 144,
              "identifier": {
                "type": "EUI-64",
                "value": "001bc50940810001"
              },
              "href": "http://localhost:3001/whatat/receiver/001bc50940810001"
            },
            {
              "rssi": 139,
              "identifier": {
                "type": "EUI-64",
                "value": "001bc50940810000"
              },
              "href": "http://localhost:3001/whatat/receiver/001bc50940810000"
            }
          ],
          "href": "http://localhost:3001/whereis/transmitter/fee150bada55"
        }
      }
    }

In the above example, note that queried receiver device (001bc50940810000) does not necessarily decode the transmitting device (fee150bada55) with the strongest RSSI.

__GET /whatnear/transmitter/{device-id}/__

Retrieve all the most recent transmissions decoded by the device that decoded the given id the strongest.  You can think of this as a _whereis_ call followed by a _whatat_ call on the strongest receiver.  For example, the id _fee150bada55_ would be queried as GET /whatnear/transmitter/fee150bada55 and might return:

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/whatnear/transmitter/fee150bada55"
        }
      },
      "devices": {
        "fee150bada55": {
          "identifier": {
          {
            "type": "ADVA-48",
            "value": "fee150bada55",
            "advHeader": {
              "type": "ADV_NONCONNECT_IND",
              "length": 22,
              "txAdd": "random",
              "rxAdd": "public"
            },
            "advData": {
              "flags": [
                "LE Limited Discoverable Mode",
                "BR/EDR Not Supported"
              ],
              "completeLocalName": "reelyActive"
            }
          },
          "timestamp": "2015-01-01T12:34:56.789Z",
          "radioDecodings": [
            {
              "rssi": 141,
              "identifier": {
                "type": "EUI-64",
                "value": "001bc50940810000"
              },
              "href": "http://localhost:3001/whatat/receiver/001bc50940810000"
            },
            {
              "rssi": 138,
              "identifier": {
                "type": "EUI-64",
                "value": "001bc50940810001"
              },
              "href": "http://localhost:3001/whatat/receiver/001bc50940810001"
            }
          ],
          "href": "http://localhost:3001/whereis/transmitter/fee150bada55"
        }
      }
    }

In the above example, note that there are no other transmitter devices near the queried transmitter device (fee150bada55).  If there were other transmitter devices nearby they would be included in the set of "devices".


Where to bind?
--------------

__barnacles__

[barnacles](https://www.npmjs.com/package/barnacles) provides the current state.  In the absence of a barnacles binding, barterer will always return a 404 Not Found status.  barterer can bind to a single instance of barnacles only.

```javascript
api.bind( { barnacles: notifications } );
```


Options
-------

You can create an instance of barterer with any or all of the following options (what's shown are the defaults):

    {
      httpPort: 3001
    }


What's next?
------------

This is an active work in progress.  Expect regular changes and updates, as well as improved documentation!  If you're developing with barterer check out:
* [diyActive](https://reelyactive.github.io/) our developer page
* our [node-style-guide](https://github.com/reelyactive/node-style-guide) and [angular-style-guide](https://github.com/reelyactive/angular-style-guide) for development
* our [contact information](http://www.reelyactive.com/contact/) to get in touch if you'd like to contribute


License
-------

MIT License

Copyright (c) 2015-2016 reelyActive

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.

