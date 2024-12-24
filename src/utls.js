const fs = require('fs')
const path = require('path')

module.exports = {
    reqUrl(req){
      try {
        return req.protocol + '://' + req.get('host');
    } catch (error) {
        return 'error-url'
    }
    },
    reqFullUrl(req){
      try {
          return req.protocol + '://' + req.get('host') + req.originalUrl;
      } catch (error) {
          return 'error-url'
      }
    },
    audioFullUrl(req, audio_path){
        return `${req.protocol}://${req.get("host")}${audio_path}`
    }
};
