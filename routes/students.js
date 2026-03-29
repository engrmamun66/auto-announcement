const express = require('express');

module.exports = function (Students, { upload, audioUpload, imageUpload }) {
  const router = express.Router();

  router.get('/students', (req, res) => Students.getStudents(req, res));
  router.get('/students/all', (req, res) => Students.allStudents(req, res));
  router.get('/students/export', (req, res) => Students.exportAll(req, res));
  router.get('/students/erase-all', (req, res) => Students.truncateStudentsTable(req, res));

  router.post('/students/import', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    Students.importExcel(req.file.path, req.query.force_as_newentity === 'true', (error, message) => {
      if (error) return res.status(500).send(`Failed to import data: ${error.message}`);
      res.send(message);
    });
  });

  router.post('/students/add', imageUpload.single('profile_image_file'), (req, res) => Students.addStudent(req, res));
  router.post('/students/update', imageUpload.single('profile_image_file'), (req, res) => Students.updateStudent(req, res));
  router.post('/students/update-status', (req, res) => Students.updateStatus(req, res));
  router.post('/students/clone/:id', (req, res) => Students.cloneStudent(req, res));
  router.post('/students/upload-audio', audioUpload.single('file'), (req, res) => Students.uploadAudio(req, res));

  router.delete('/students/delete/:id', (req, res) => Students.deleteStudent(req, res));
  router.delete('/students/delete-audio/:id/:column', (req, res) => Students.deleteAudio(req, res));

  router.get('/student/:id', (req, res) => Students.getStudent(req, res));
  router.get('/student/by-dakhela/:dakhela', (req, res) => Students.getStudentByDakhela(req, res));
  router.get('/single-student', (req, res) => Students.getStudent(req, res));

  return router;
};
