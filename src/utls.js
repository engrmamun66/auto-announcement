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
    create_access_DOT_apikey(
        access_api_key='https://script.google.com/macros/s/AKfycbyyN4zMND6JqTdJ0B7VJJM6SptDvwVirt7KBwQoBb2hCU5ry7GrSxn2oAeSvn4yLyOpcg/exec',
        {ovverwrite=false}={}
    ){
        const file_content = `module.exports = '${access_api_key}'`
        const filePath = path.join(__dirname, './../access.apikey.js');  
        // Check if file exists
        if (ovverwrite == false) {
            if(!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, file_content, 'utf8');
            } 
        } else {
            fs.writeFileSync(filePath, file_content, 'utf8'); 
        }
        
        
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
};
