const multer = require('multer');
const path = require('path');

// Stockage pour les images produits (mainImage et galleryImages)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    // mainImage ou galleryImages
    const prefix = file.fieldname === 'mainImage' ? 'main' : 'gallery';
    cb(null, `${prefix}_${Date.now()}_${Math.round(Math.random()*1e9)}${ext}`);
  }
});

const productUpload = multer({ storage });

module.exports = productUpload;
