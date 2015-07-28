# Log Colors
A colorized winston console logger. Sometimes you want a very simple logger which just logs to this console. However colors and pretty printing are useful enough to have as a default. For these cases use **log-colors**

# Installation
```bash
npm install -S log-colors
```

# Usage
Use as you would a standard winston logger

```javascript
var logger = require('log-colors')
logger.debug('this should be colorized and pretty-printed', {
  foo: 'bar'
}
```

# Test
Execute the command
```bash
npm test
```
