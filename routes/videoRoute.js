const express = require("express");
const router = express.Router();
const validateObjectId = require("../middlewares/validateObjectId");
const { verifyToken, verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const { photoUpload } = require("../middlewares/photoUpload");
const { createVideoCtrl, updateVideoCtrl, deleteVideoCtrl, updateVideoImageCtrl, getAllVideosInCourseCtrl, getSingleVideoCtrl, getAllVideosCtrl, getVideosCountCtrl } = require("../controllers/videoController");
const { videoUpload } = require("../middlewares/videoUpload");

// /api/videos
router.get("/",verifyTokenAndAdmin,getAllVideosCtrl);

// /api/videos/count
router.get('/count', verifyTokenAndAdmin, getVideosCountCtrl);      

// /api/videos/:id
router.route("/:id")
      .get( verifyToken, getSingleVideoCtrl)
      .post(validateObjectId, verifyToken, videoUpload.single("video"), createVideoCtrl)
      .put(validateObjectId, verifyToken, videoUpload.single("video"), updateVideoCtrl)
      .delete(validateObjectId, verifyToken, deleteVideoCtrl);



// جلب جميع الفيديوهات في دورة معينة
router.get("/course/:id",validateObjectId, verifyToken, getAllVideosInCourseCtrl);

// /api/videos/upload-image/:id
router.put("/upload-image/:id", validateObjectId, verifyToken, photoUpload.single("image"), updateVideoImageCtrl);



module.exports = router;
