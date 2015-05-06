barterer
========


What's in a name?
-----------------

barterer is an API for real-time location and hyperlocal context.  Why the name?  Barter is a system of exchange by which goods or services are directly exchanged for other goods or services without using a medium of exchange, such as money.  Sounds fitting for an API in an open Internet of Things.


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
var middleware = new barnowl();

middleware.bind( { protocol: 'test', path: 'default' } );
notifications.bind( { barnowl: middleware } );
api.bind( { barnacles: notifications } );
```

When the above is run, you can query _whereis_ a given (transmitting) device such as [http://localhost:3001/whereis/001bc50940100000](http://localhost:3001/whereis/001bc50940100000), _whatat_ a given (receiving) device such as [http://localhost:3001/whatat/001bc50940800000](http://localhost:3001/whatat/001bc50940800000), and finally _whatnear_ a given (transmitting) device such as [http://localhost:3001/whatnear/001bc50940100000](http://localhost:3001/whatnear/001bc50940100000).


RESTful interactions
--------------------

__GET /whereis/id/__

Retrieve the most recent transmission by the given device id, including all the devices which decoded this transmission.  For example, the id _001bc50940100000_ would be queried as GET /whereis/001bc50940100000 and might return:

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/whereis/001bc50940100000"
        }
      },
      "devices": {
        "001bc50940100000": {
          "identifier": {
            "type": "EUI-64",
            "value": "001bc50940100000",
            "flags": {
              "transmissionCount": 0
            }
          },
          "timestamp": "2015-01-01T12:34:56.789Z",
          "radioDecodings": [
            {
              "rssi": 136,
              "identifier": {
                "type": "EUI-64",
                "value": "001bc50940800000"
              },
              "href": "http://localhost:3001/whatat/001bc50940800000"
            }
          ],
          "href": "http://localhost:3001/whereis/001bc50940100000"
        }
      }
    }

__GET /whatat/id/__

Retrieve all the most recent transmissions decoded by the device with the given id.  For example, the id _001bc50940800000_ would be queried as GET /whatat/001bc50940800000 and might return:

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/whatat/001bc50940800000"
        }
      },
      "devices": {
        "001bc50940100000": {
          "identifier": {
            "type": "EUI-64",
            "value": "001bc50940100000",
            "flags": {
              "transmissionCount": 0
            }
          },
          "timestamp": "2015-01-01T12:34:56.789Z",
          "radioDecodings": [
            {
              "rssi": 136,
              "identifier": {
                "type": "EUI-64",
                "value": "001bc50940800000"
              },
              "href": "http://localhost:3001/whatat/001bc50940800000"
            }
          ],
          "href": "http://localhost:3001/whereis/001bc50940100000"
        }
      }
    }

__GET /whatnear/id/__

Retrieve all the most recent transmissions decoded by the device that decoded the given id the strongest.  You can think of this as a _whereis_ call followed by a _whatat_ call on the strongest decoder.  For example, the id _001bc50940100000_ would be queried as GET /whatnear/001bc50940100000 and might return:

    {
      "_meta": {
        "message": "ok",
        "statusCode": 200
      },
      "_links": {
        "self": {
          "href": "http://localhost:3001/whatnear/001bc50940100000"
        }
      },
      "devices": {
        "001bc50940100000": {
          "identifier": {
            "type": "EUI-64",
            "value": "001bc50940100000",
            "flags": {
              "transmissionCount": 0
            }
          },
          "timestamp": "2015-01-01T12:34:56.789Z",
          "radioDecodings": [
            {
              "rssi": 136,
              "identifier": {
                "type": "EUI-64",
                "value": "001bc50940800000"
              },
              "href": "http://localhost:3001/whatat/001bc50940800000"
            }
          ],
          "href": "http://localhost:3001/whereis/001bc50940100000"
        }
      }
    }



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

This is an active work in progress.  Expect regular changes and updates, as well as improved documentation!


License
-------

MIT License

Copyright (c) 2015 reelyActive

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.

