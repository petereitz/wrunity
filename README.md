## Overview

A Node.js module for Webroot's Unity API.


### Install

    npm -i wrunity


### Use
```javascript
const unity = require('wrUnity');
unity.connect(<gsmKey>, <apiKey>, <apiSecret>, <username>, <password>)
  .then(() => {
    unity.makeRequest('https://unityapi.webrootcloudav.com/service/api/console/gsm/your-gsmKey/sites', 'get')
      .then(res => console.log(res))
      .catch(err => console.log(err));
  });
```

### Changelog
- **1.0.0**
  - [axios](https://github.com/axios/axios) based rewrite
  - Shift focus to managing authentication token.
