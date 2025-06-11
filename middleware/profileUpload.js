const multer = require('multer');
const path = require('path');

// Configuration du stockage pour les photos de profil
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'profile_' + req.params.id + '_' + Date.now() + ext);
  }
});

const upload = multer({ storage });

module.exports = upload;
