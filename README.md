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

When the above is run, you can query the state of the two simulated devices by browsing to [http://localhost:3001/id/001bc50940100000](http://localhost:3001/id/001bc50940100000) and [http://localhost:3001/id/fee150bada55](http://localhost:3001/id/fee150bada55).


Querying Real-Time Location
---------------------------

To query the real-time location of a Bluetooth Smart device which is emitting the AdvA-48 identifier 1a:2b:3c:4d:5e:6f, make the following request:

- [http://localhost:3001/id/1a2b3c4d5e6f](http://localhost:3001/id/1a2b3c4d5e6f)

To query the real-time context of a place named _reelyactive_ make the following request:

- [http://localhost:3001/at/reelyactive](http://localhost:3001/at/reelyactive)

A test place is permanently enabled and is associated with IDs 001bc50940800000 and 001bc50940810000:

- [http://localhost:3001/at/test](http://localhost:3001/at/test)


Where to bind?
--------------

__barnacles__

[barnacles](https://www.npmjs.com/package/barnacles) provides the current state.  In the absence of a barnacles binding, barterer will always return a 404 Not Found status.  barterer can bind to a single instance of barnacles only.

```javascript
api.bind( { barnacles: notifications } );
```

__chickadee__

[chickadee](https://www.npmjs.com/package/chickadee) provides the metadata associated with devices as well as the mapping of place names to device identifiers.  In the absence of a chickadee binding, barterer will always return a 501 Not Implemented status for at/ queries.  barterer can bind to a single instance of chickadee only.

```javascript
api.bind( { chickadee: associations } );
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

