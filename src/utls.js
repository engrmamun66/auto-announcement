const fs = require('fs')
const path = require('path')
const { classes } = global.config

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
    withTrackFile(data=null, {overwrite=true}={}){
        const file_content = JSON.stringify(data || {}, null, 4)
        const filePath = path.join(global.DIR, 'tracker.json');  
        // Check if file exists
        if (overwrite == false) {
            if(!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, file_content, 'utf8');
            } 
        } else {
            fs.writeFileSync(filePath, file_content, 'utf8'); 
        }
    }, 
    updateRelaychannelsTxt(comma_separated_ports=''){ 
        const filePath = path.join(global.DIR, 'relaychannels.txt');  
        fs.writeFileSync(filePath, String(comma_separated_ports), 'utf8'); 
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
    encodeString: function (data='') {
        try {
            return btoa(unescape(encodeURIComponent(data)));
        } catch (error) {
            return data;
        }
    },
    decodeString: function (data) {
        try {
            return decodeURIComponent(escape(atob(data)));
        } catch (error) {
            return data;
        }
    },
    listGroupBy: function (array, property) {
        if (!array?.length || !property) return {};
        return array.reduce((result, obj) => {
          const key = obj[property];
          if (!result[key]) {
            result[key] = [];
          }
          result[key].push(obj);
          return result;
        }, {});
      },
};
