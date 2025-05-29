const multer = require("multer");

// Photo Upload Middleware
const photoUpload = multer({
    storage: multer.memoryStorage(), // استخدم الذاكرة بدلاً من التخزين المحلي
    fileFilter: function(req, file, cb) {
        if (file.mimetype.startsWith("image")) {
            cb(null, true);
        } else {
            cb({ message: "Unsupported File Format" }, false);
        }
    },
    limits: { fileSize: 1024 * 1024 } // 1 ميغابايت
});

module.exports = {
    photoUpload,
};