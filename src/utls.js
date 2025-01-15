const fs = require('fs')
const path = require('path')
const { classes } = require("../config");

module.exports = {
    createRequiredFolders(){

        let folders = [
            'database',
            'public/exports',
            'public/media',
            'public/temp',
        ]
        
        folders.forEach(folder => {
            const dirPath = path.join(global.DIR, folder);
        
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                    console.log('Directory created:', folder + '\n');
                } else {
                    console.log('Directory already exists:', folder + '\n');
                }
        });
        
    }, 
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
        let _class = classes.find(c => c.class_name == className)         
        return _class?.class_name || '<>'       
    },
    getClassShort(className){
        let _class = classes.find(c => c.class_name == className)         
        return _class?.class_short || '<>'
    },
};
