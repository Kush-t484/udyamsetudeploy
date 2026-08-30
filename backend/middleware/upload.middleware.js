const multer = require('multer');
const path = require('path');
const fs = require('fs');
const env = require('../config/env');

// Ensure upload folder exists
if (!fs.existsSync(env.UPLOAD_DIR)) {
    fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, env.UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file format. Allowed formats: PDF, DOC, DOCX, JPG, PNG, ZIP'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
    fileFilter: fileFilter
});

module.exports = upload;
