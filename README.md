[![Build Status](https://travis-ci.org/happner/happn-logger.svg?branch=master)](https://travis-ci.org/happner/happn-logger)

# happn-logger

`npm install happn-logger --save`

Logger using log4js.

## Usage

With context and component.

```javascript
var Logger = require('happn-logger');
var context = Logger.createContext('ContextName');
var log = context.createLogger('ComponentName');

log.info('message');

// [ INFO] - 1ms    ContextName (ComponentName) message
```

With component only.

```javascript
var Logger = require('happn-logger');
var log = context.createLogger('ComponentName');

log.info('message');

// [ INFO] - 1ms    (ComponentName) message
```

