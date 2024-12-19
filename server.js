require('dotenv').config()
const fs = require('fs')
const path = require('path')
const express = require('express')
const config = require('./config')

const port = process.env?.PORT || config?.PORT || 3200; 
const utils = require('./src/utls')
const RentMySeo = require('./src/rentmy')


const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const filePath = (fileName) => (path.join(__dirname, `html-files/${fileName}`))
 

app.get('/config.js', (req, res) => {     
  let config_file_path = path.join(__dirname, 'config.js')
  fs.readFile(config_file_path, 'utf8', (err, data) => {     
    data = data.replace('module.exports = RENTMY_GLOBAL', '')
    data = data.replace('WILL_SET_WITH_NODE', utils.reqUrl(req))
    res.send(data);
  });
});



let keys = Object.keys(config.routes);
keys.forEach(async (key) => {
  let route = config.routes[key];
  route.path = route.path.split('?')[0];
  if(!route.path.startsWith('/')) route.path = '/' + route.path
  route.path = route.path.replace(/\{/g, ":").replace(/\}/g, "").replace(':uuid', ':uid')
  console.log('[route] >>> ' + route.path);
  
  app.get(route.path, async (req, res) => {

    let file_path = filePath(route?.file || '');
    if(!fs.existsSync(file_path)){
      res.send(`"${file_path}", does not exist`)
    } else {
      fs.readFile(filePath(route.file), 'utf8', async (err, html) => {
        if (err) {
          console.error('Error reading file:', err)
          res.status(500).send('Internal Server Error')
          return;
        }
        const RentMy = new RentMySeo(config, {env: process.env, key});
        let metaData = await RentMy.getMetaData(req, key, route) || {}

        html = utils.setCdnUrls(html, process.env)
       
        let html_with_seoMeta = utils.setMetaData(html, {
          ...metaData, 
          route,
          storeName: config.store_name, 
        });       
        res.send(html_with_seoMeta);
      });
    }
    
  });

})


  
 


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
