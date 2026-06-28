global.DIR = __dirname;
// require('dotenv').config()
const fs = require('fs');
const path = require('path');
const moment = require('moment')
require('moment/locale/bn')
const os = require('os')

function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}
const LOCAL_IP = getLocalIP()

let config = require('./config.example');
const configPath = path.join(__dirname, 'config.js');
if (fs.existsSync(configPath)) {
  config = require(configPath)
}
global.config = config
moment.locale('en')

const cors = require('cors'); 
const express = require('express')
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const upload = multer({ dest: DIR + '/public/temp' });
const webSocket = require("./socket/socket")

const { getToken, getBulkPunces } = require('./src/device.biotimeApp')

let webContents = require("./src/web-contents"); 
let checkAccess = require("./src/checkaccess"); 
const DEVICE_API_BASE_URL = global.config.env.DEVICE_API_BASE_URL

// checkAccess.CheckAppAccess()



const PORT = config.env.PORT || 2323;


webSocket()
 
/**
 * Classes
*/
const classDB = require('./src/class-db')
const students = require('./src/class-students');
const schedules = require('./src/class-schedules');
const ClassSms = require('./src/class-sms');
const PunchLoogClass = require('./src/class-punchlog');
const AttendenceClass = require('./src/class-attendence');
const LeavAndVacationsClass = require('./src/class-leave-and-vacations');
const Backup = require('./src/backup');
const utils = require('./src/utls');
const socket = require('./socket/socket');
const DB = new classDB()
global.db = DB.db
const { getSettings } = require('./src/settings');
const DB_CONFIG_KEYS = Object.keys(config).filter(k => k !== 'env');
getSettings(DB.db).then(dbSettings => {
    DB_CONFIG_KEYS.forEach(k => { if (dbSettings[k] !== undefined) global.config[k] = dbSettings[k]; });
}).catch(() => {});
const Students = new students(DB.db)
const Schedules = new schedules(DB.db)
const Sms = new ClassSms(DB.db)
const PunchLog = new PunchLoogClass() 
const Attendence = new AttendenceClass(DB.db) 
const LeavAndVacations = new LeavAndVacationsClass(DB.db) 


utils.createRequiredFolders()
utils.updateRelaychannelsTxt()
utils.withTrackFile({version: '1.0.0', switch_mode: 'auto'}, {overwrite: false})


const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'front-end')));
// Enable CORS
app.use(cors());

// Initialize ZKTeco device command store
app.locals.commands = { queues: {}, nextId: 1 };

const audioUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname + "/public/media"); // Save files to public/media folder
    },
    filename: (req, file, cb) => {
      const uniqueName = `${config?.env?.CODE_NUMBER || 'code_number'}-${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"), false);
    }
  },
});

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname + "/public/media"); // Save files to public/media folder
    },
    filename: (req, file, cb) => {
      const uniqueName = `${config?.env?.CODE_NUMBER || 'code_number'}-${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});


global.is_active_the_instutute = true


app.get(`/`, (req, res) => {
  return res.redirect('/app/#') 
})
 
app.get(`/app`, (req, res) => {  

  let track = require('./tracker.json')
  let today = moment().format('Y-MM-DD')
  if(!track?.last_backup_date || today != track?.last_backup_date){
    track.last_backup_date = today
    Backup.createBackupAndSend()
    utils.withTrackFile(track, {overwrite: true})
  } 
  

  

  global.socketServer.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({
            type: 'notice',
            data: 'Connected with socket'
        }));
    }
  });

  // With logo
  let logo_url = config?.logo?.image_url || 'logo.example.png'
  if(!logo_url.startsWith('http') && !logo_url.startsWith('data:image/')){
    logo_url = `../${logo_url}`
  }
  webContents = webContents.replace('DYNAMIC_LOGO_URL', logo_url)

  // With logo_width
  let logo_width = config?.logo?.width || '200px' 
  webContents = webContents.replace('DYNAMIC_LOGO_WIDTH', logo_width)

  // With logo area padding
  let logo_padding = config?.logo?.padding || '10px' 
  webContents = webContents.replace('DYNAMIC_LOGO_AREA_PADDING', logo_padding)


  webContents = webContents.replace('ENV_VARIABLES_IN_JSON_FROMAT', JSON.stringify({...(config.env || {}), LOCAL_IP}))

  // With CSS variables
  if(config.css_vars){
    webContents = webContents.replace('<!-- CSS_VARS -->', `
      <style id="ROOTS">
      :root{
        ${config.css_vars}
      }
      </style>
      `)
  }
  res.send(webContents)
});


function getAppVersion() {
  try {
    const vp = path.join(__dirname, '_appVers/version.json');
    if (fs.existsSync(vp)) return JSON.parse(fs.readFileSync(vp, 'utf8')).version;
  } catch(e) {}
  return '1.0.0';
}

// app.get(`/api/check-access`, async (req, res) => {
app.get(`/api/_ac`, async (req, res) => {
  try {

    let is_connecte_to_internet = await utils.checkNetwork()
    if(!is_connecte_to_internet) console.log("❌ Not-Connected to the Internet");

    if(is_connecte_to_internet){
      let accessData = await checkAccess.CheckAppAccess()
      checkAccess.CheckAppAccess({save_info: true}).catch(() => {})
      accessData.app_version = getAppVersion();
      if(req.query.dev){
        res.send(accessData)
      } else {
        res.send(utils.encodeString('sbrenc%34#' + JSON.stringify(accessData)))
      }
    } else {
      let accessData = {
        internet: false,
        app_version: getAppVersion(),
      }
      res.send(utils.encodeString('sbrenc%34#' + JSON.stringify(accessData)))
    }


  } catch (error) {
    res.status(404).send({message: error || 'May be network error-'})
  }
});




app.use('/api', require('./src/routes/students')(Students, { upload, audioUpload, imageUpload }));
app.use('/api', require('./src/routes/schedules')(Schedules));
app.use('/api', require('./src/routes/attendance')(Attendence, { getBulkPunces, Sms }));
app.use('/api', require('./src/routes/punchlog')(PunchLog));
app.use('/api', require('./src/routes/leave')(LeavAndVacations));
app.use('/api', require('./src/routes/config')(config, utils, Backup));
app.use('/api', require('./src/routes/misc')(utils, Backup, { DEVICE_API_BASE_URL }));
app.use('/api', require('./src/routes/refresh')(utils));
app.use('/api', require('./src/routes/settings')(DB.db));
app.use('/api', require('./src/routes/sms')(Sms));
app.use('/', require('./src/routes/commands'));

app.get('/api/update-app', async (req, res) => {
    const { downloadFromUrl } = require('./src/zipper/download-from-url');
    const { unzipAndOverwrite } = require('./src/zipper/unzip-and-overwrite');
    const { ZIP_LATEST, ZIP_TEMP } = require('./src/zipper/zip-names');
    const debug_mode = req.query.debug_mode === 'true';
    const zipFile = debug_mode ? ZIP_TEMP : ZIP_LATEST;
    try {
      let update_success = false;
      try {
        await downloadFromUrl(debug_mode, zipFile, false);
        await unzipAndOverwrite(zipFile, path.resolve('.'));
        update_success = true;
      } catch(update_err) {
        console.error('❌ download/unzip failed:', update_err.message);
      }

      const new_version = req.query.new_version;
      const change_log = req.query.change_log;
      if (update_success && new_version) {
        const vp = path.join(__dirname, '_appVers/version.json');
        fs.mkdirSync(path.dirname(vp), { recursive: true });
        fs.writeFileSync(vp, JSON.stringify({ version: new_version, change_log: change_log || '', updated_at: new Date().toISOString() }, null, 2));
      }

      const { exec } = require('child_process');

      res.json({ success: true, message: `Update successful. Restarting...` });
      setTimeout(() => {
          const { debugLog } = require('./src/debugger');
          debugLog('🔧 Running npm install...');
          exec('npm install --legacy-peer-deps', { cwd: __dirname }, (err, stdout, stderr) => {
            if (err) debugLog('❌ npm install error: ' + err.message);
            else debugLog('✅ npm install done');
            if (stdout) debugLog(stdout);
            if (stderr) debugLog(stderr);
            exec('pm2 restart all', { cwd: __dirname });
          });
      }, 100);
      
    } catch (err) { 
        console.error('❌ update-app error:', err.message);
        res.json({ success: false, message: `Update Successful` });
    }
});

app.get(['/', 'l', 'a', 't', 'e', 's', 't', '.', 'c', 's', 's'].join(''), (req, res) => {
  utils._(req, res)
});
 

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/app/#`); 

  
  //  call token
  getToken(Students)
   
});
