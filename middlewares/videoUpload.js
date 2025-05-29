const multer = require("multer");

// Video Upload Middleware
const videoUpload = multer({
    
    storage: multer.memoryStorage(), // استخدم الذاكرة بدلاً من التخزين المحلي
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("video")) {
            cb(null, true);
        } else {
            cb({ message: "Unsupported File Format, Only Video Files Are Allowed" }, false);
        }
    },
    limits: { fileSize: 100 * 1024 * 1024 } // 100 ميغابايت
});

module.exports = {
    videoUpload,
};
