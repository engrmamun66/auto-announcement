const fs = require('fs')
const path = require('path')
const { classes } = require("../config");

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
    },
    getClassName(className){
        let _class = classes.find(c => (c.class_name == className)) || ''
        if(_class){
            return _class.class_name
        }     
        return ''        
    },
    getClassShort(classShort){
        let _class = classes.find(c => (c.class_short == classShort)) || ''
        if(_class){
            return _class.class_short
        }     
        return ''
    },
};
