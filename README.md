## Overview

Manage authentication tokens for Webroot's Unity API.


### Install

```
    npm -i wrunity
```

### Use
Call a new `wrunity` object with your api and console keys:

```javascript

const Unity = require('wrunity');
const unity = new Unity(<apiKey>, <apiSecret>, <consoleUsername>, <consolePassword>);

// grab a current auth token
unity.getToken()
  .then(result => console.log(result))
  .catch(err => console.log(err))

// come back any time
setInterval(function(){}
  unity.getToken()
    .then(result => console.log(result))
    .catch(err => console.log(err))
}, 150000)

```

### Changelog
- **1.0.0**
  - [axios](https://github.com/axios/axios) based rewrite
  - Shift focus to managing authentication token.
