// Webroot Unity API interaction
// blame pete

// ---SETUP---
// unity config
const config = {
  url: 'https://unityapi.webrootcloudav.com/auth/token',
  body: {
    scope: '*',
    grant_type: 'password'
  },
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}


const axios = require('axios');
const qs = require('qs');


// ---FUNCTIONS---
// now
function getNow(){
  return Math.floor(Date.now());
}



// ---BUSINESS---

class Unity {
  constructor(apiKey, apiSecret, username, password){
    this.ready = false;
    this.req = config;
    this.auth = {
      key: apiKey,
      secret: apiSecret
    }
    this.req.body.username = username;
    this.req.body.password = password;
    this.req.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    this.req.headers.Authorization = "Basic " + Buffer.from(`${this.auth.key}:${this.auth.secret}`).toString('base64');

    this.requestToken()
      .then(() => {
        this.ready = true;
      })
      .catch(err => console.log(err))
  }

  requestToken(){
    return new Promise((resolve, reject)=>{
      // don't loose yourself
      const self = this;
      // be safe
      try{

        const opts = {
          method: 'POST',
          headers: this.req.headers,
          data: qs.stringify(this.req.body),
          url: this.req.url
        }

        axios(opts)
          .then(res => {
            self.token = res.data.access_token;
            self.refresh = res.data.refresh_token;
            self.tokenExp = getNow() + (res.data.expires_in * 1000);
            resolve();
          })
          .catch(err => reject(err))
      }catch(err){
        reject(err);
      }
    });
  }

  updateToken(){
    return new Promise((resolve, reject)=>{
      // don't loose yourself
      const self = this;
      // be safe
      try{

        // is the token stale?
        if(getNow() > self.tokenExp){

          self.requestToken()
            .then(res => {
              resolve();
            })
            .catch(err => reject(err))
        } else {
          resolve();
        }
      } catch(err) {
        reject(err);
      }
    });
  }


  getToken(){
    return new Promise((resolve, reject)=>{
      // don't loose yourself
      const self = this;
      // be safe
      try{
        // is the token ready?
        if(self.ready){

          self.updateToken()
            .then(() => resolve(self.token))
            .catch(err => reject(err));
        } else {

          setTimeout(function(){
            self.getToken()
              .then(token => resolve(token))
              .catch(err => reject(err));
          }, 1000);
        }
      }catch(err){
        reject(err);
      }
    });
  }

}


module.exports = Unity;
