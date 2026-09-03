const { Router } = require('express');
const cdataController = require('../controllers/cdataController');
const getrequestController = require('../controllers/getrequestController');
const commandController = require('../controllers/commandController');
const registryController = require('../controllers/registryController');
const devicecmdController = require('../controllers/devicecmdController');

const router = Router();

router.all([
    '/iclock/cdata',
    '/iclock/cdata/',
    '/iClock/cdata',
    '/iClock/cdata/',
], (req, res) => cdataController.handle(req, res));

router.all([
    '/iclock/registry',
    '/iclock/registry/',
    '/iClock/registry',
    '/iClock/registry/',
], (req, res) => registryController.handle(req, res));

router.all([
    '/iclock/getrequest',
    '/iclock/getrequest/',
    '/iClock/getrequest',
    '/iClock/getrequest/',
], (req, res) => getrequestController.handlePolling(req, res));

router.all([
    '/iclock/devicecmd',
    '/iclock/devicecmd/',
    '/iClock/devicecmd',
    '/iClock/devicecmd/',
], (req, res) => devicecmdController.handle(req, res));

// Physical devices poll /iclock/* above and can't "log in" — everything below
// here is triggered from the app's own UI (Devices page etc.) and needs a session.
router.use(requireAuth);

// { "pin": "123", "name": "John", "password": "", "card": "" }  — privilege forced to 1
router.post('/:cn/add-enroller',    (req, res) => commandController.addEnroller(req, res));

// { "pin": "123", "name": "John", "password": "", "card": "" }  — privilege forced to 6
router.post('/:cn/add-admin',       (req, res) => commandController.addAdmin(req, res));

// { "pin": "123", "name": "John", "password": "", "card": "" }  — privilege forced to 14
router.post('/:cn/add-superadmin',  (req, res) => commandController.addSuperAdmin(req, res));

// { "pin": "123", "name": "John", "password": "", "card": "" }
router.post('/:cn/add-user',        (req, res) => commandController.addUser(req, res));

// { "pin": "123" }  or  ?pin=123
router.post('/:cn/remove-user',     (req, res) => commandController.removeUser(req, res));

// { "users": [{ "pin": "123", "name": "John", "card": "" }, { "pin": "456", "name": "Jane", "card": "" }] }
router.post('/:cn/add-users',       (req, res) => commandController.addUsers(req, res));

// { "pin": "123", "name": "John Doe", "card": "C001", ... }
router.post('/:cn/update-user',     (req, res) => commandController.updateUser(req, res));

// { "pins": ["123", "456"] }
router.post('/:cn/remove-users',    (req, res) => commandController.removeUsers(req, res));

// no body — device POSTs user data back to /iclock/cdata
router.post('/:cn/get-users',       (req, res) => commandController.getUsers(req, res));

// { "startTime": "2024-01-01 00:00:00", "endTime": "2024-01-31 23:59:59" }  — date range optional
router.post('/:cn/get-attendance',  (req, res) => commandController.getAttendance(req, res));

// no body — device POSTs fingerprint templates back to /iclock/cdata
router.post('/:cn/get-fingerprints',    (req, res) => commandController.getFingerprints(req, res));

// { "pin": "123", "fid": 0, "tmp": "<template_data>", "valid": 1 }  — fid: 0-9, valid: 1=valid/0=invalid
router.post('/:cn/create-fingerprint',  (req, res) => commandController.createFingerprint(req, res));

// no body — syncs device clock to server time
router.post('/:cn/sync-time',           (req, res) => commandController.syncTime(req, res));

// no body
router.post('/:cn/refresh',             (req, res) => commandController.refresh(req, res));

// no body
router.post('/:cn/check',               (req, res) => commandController.check(req, res));

// no body — deletes all attendance logs on device
router.post('/:cn/clear-attlog',        (req, res) => commandController.clearAttlog(req, res));

// no body — deletes all users on device
router.post('/:cn/clear-users',         (req, res) => commandController.clearUsers(req, res));

// no body — deletes all fingerprints on device
router.post('/:cn/clear-fingerprints',  (req, res) => commandController.clearFingerprints(req, res));

// { "pin": "123"}  — delete all fingers for user
// { "pin": "123", "fid": 0 }  — fid optional (0-9) to delete specific finger
router.post('/:cn/delete-fingerprint',  (req, res) => commandController.deleteFingerprint(req, res));

// no body  or  ?door=1  or  { "door": 1 }
router.post('/:cn/open-door',       (req, res) => commandController.openDoor(req, res));
router.post('/:cn/close-door',      (req, res) => commandController.closeDoor(req, res));

// { "delay": 10 }  — seconds, updates polling interval without reboot (takes effect on next poll)
router.post('/:cn/set-delay',       (req, res) => commandController.setDelay(req, res));

// { "delay": 10 }  — optional, seconds before device reboots
router.post('/:cn/restart',         (req, res) => commandController.restart(req, res));

// { "command": "REBOOT" }
router.post('/:cn/push-command',    (req, res) => commandController.pushRawCommand(req, res));

module.exports = router;
