// Webroot Unity API interaction
// blame pete

// ---SETUP---
// unity config
const uC = {
  urlBase: 'https://unityapi.webrootcloudav.com',
  auth: {
    tokenURLSegment: '/auth/token',
    body: {
      scope: '*',
      grant_type: 'password'
    }
  }
}

// requests
const request = require('request');

// moment
const moment = require('moment');



// ---FUNCTIONS---
// now
function getNow(){
  return Math.floor(Date.now() / 1000);
}



// ---BUSINESS---
// constructor
var Unity = function() {
  this.ready = false;
  this.token = '';
  this.tokenExpireDate = '';
  this.standardHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

};


// --utility--
// set credentials and make initial OAuthTokenRequest
Unity.prototype.connect = function(gsmKey, apiKey, apiSecret, username, password){
  return new Promise((resolve, reject)=>{

    // append details to config
    uC.gsmKey = gsmKey;
    uC.auth.key = apiKey;
    uC.auth.secret = apiSecret;
    uC.auth.body.username = username;
    uC.auth.body.password = password;

    this.setAuthToken()
      .then(res => {
        resolve(res);
        this.ready = true;
      })
      .catch(err => reject(err));
  });
}

// request and set the auth token
Unity.prototype.setAuthToken = function() {
  return new Promise((resolve, reject)=>{
    // don't loose yourself
    const self = this;

    // do we if have a token and is it still good?
    if (this.tokenExpireDate > getNow()){
      // looks like we're good to go
      resolve('Token still valid');
    } else {
      // options
      let options = {
        url: `${uC.urlBase}${uC.auth.tokenURLSegment}`,
        auth : {
          'user': uC.auth.key,
          'password': uC.auth.secret,
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: uC.auth.body
      }

      // the request
      request.post(options, function(err, response, body){
        if(err){
          console.log('error:', err); // Print the error if one occurred
          reject(err);

        } else if(response.statusCode != 200) {
          console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
          reject(`Non-200 response: ${response.statusCode}`);

        } else {
          data = JSON.parse(body);
          self.token = data.access_token;
          self.tokenExpireDate = getNow() + data.expires_in;

          resolve('Success');

        }
      });
    };
  });
};

// make a request to the Unity API
// -> makeRequest() calls the setAuthToken function as needed so calling
// makeRequest() eliminates the need to check auth and key.
Unity.prototype.makeRequest = function(url, method, body = false) {
  return new Promise((resolve, reject)=>{
    // don't loose yourself
    const self = this;

    // Make sure that we have a token to work with
    this.setAuthToken()
      .then(function(){

        // build request options
        const options = {
          url: url,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${self.token}`
          }
        };
        // validate the submitted method
        const viableMethods = ['GET', 'PUT', 'POST', 'DELETE'];
        method = method.toUpperCase()
        if (viableMethods.indexOf(method > -1)) {
          options.method = method;
        } else {
          reject('Bad method');
          return;
        }
        // if there's a body, add it
        if(body){
          options.form = body
        }

        // Request time
        request(options, function(err, response, body){
          if(err){
            reject({err: err, options: options});
          } else {
            resolve({response: response, body: body})
          }
        });

      })
      .catch(err => console.log(err));

  });
};


// --useful stuff--
// get details for a site(s)
Unity.prototype.getSite = function(siteID = false) {
  return new Promise((resolve, reject)=>{
    // don't loose yourself
    const self = this;

    // build the url
    let url = `${uC.urlBase}/service/api/console/gsm/${uC.gsmKey}/sites`

    // if a specific site was requested then then update the url accordingly
    if(siteID){
      url = `${url}/${siteID}`;
    }

    // make the Request
    self.makeRequest(url, 'GET')
      .then(res => resolve(JSON.parse(res.body)))
      .catch(err => reject(err));

  });
};


// get details for an enpoint(s)
Unity.prototype.getEndpoint = function(siteID, endpointID = false) {
  return new Promise((resolve, reject)=>{
    // don't loose yourself
    const self = this;

    // build the url
    let url = `${uC.urlBase}/service/api/console/gsm/${uC.gsmKey}/sites/${siteID}/endpoints`

    // if a specific endpoint was requested then then update the url accordingly
    if(endpointID){
      url = `${url}/${endpointID}`;
    }

    // make the Request
    self.makeRequest(url, 'GET')
      .then(res => resolve(JSON.parse(res.body)))
      .catch(err => reject(err));

  });
};


// get threat history for a site
Unity.prototype.getSiteThreatHistory60 = function(siteID) {
  return new Promise((resolve, reject)=>{
    // don't loose yourself
    const self = this;

    // today
    let today = moment().format('YYYY-MM-DD');
    // 90 days ago
    let todayLess60 = moment().subtract(60, 'day').format('YYYY-MM-DD');

    // build the url
    let url = `${uC.urlBase}/service/api/console/gsm/${uC.gsmKey}/sites/${siteID}/threathistory?startDate=${todayLess60}&pagesize=1000`

    // t
    //console.log(url);

    // make the Request
    self.makeRequest(url, 'GET')
      .then(res => resolve(JSON.parse(res.body)))
      .catch(err => reject(err));

  });
};


module.exports = new Unity;
