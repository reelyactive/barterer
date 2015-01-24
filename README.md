barterer
========


An API for real-time hyperlocal context
---------------------------------------

Barter is a system of exchange by which goods or services are directly exchanged for other goods or services without using a medium of exchange, such as money.


Installation
------------

    npm install barterer


Hello barterer
--------------

```javascript
var barterer = require('barterer');
var api = new barterer();
```


Querying Hyperlocal Context
---------------------------

To query the real-time context where a Bluetooth Smart device is emitting the AdvA-48 identifier 1a:2b:3c:4d:5e:6f make the following request:

- [http://localhost:3001/id/1a2b3c4d5e6f](http://localhost:3001/id/1a2b3c4d5e6f)


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

