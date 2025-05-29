const express = require("express");
const { verifyTokenAndAdmin, verifyToken, verifyTokenAndOnlyUser, verifyTokenAndAuthorization } = require("../middlewares/verifyToken");
const {  getAllTeachersCtrl, getAllStudnetsCtrl, getUserProfileCtrl, UpdateUserProfileCtrl, getStudentssCountCtrl, getTeacherCountCtrl, profilePhotoUploadCtrl, deleteUserProfileCtrl, getTeachersBySpecializationCtrl, getTopTeachersCtrl } = require("../controllers/userController");
const validateObjectId = require("../middlewares/validateObjectId");
const { photoUpload } = require("../middlewares/photoUpload");
const router=express.Router();

// /api/users/teacher
router.route("/teacher")
      .get(verifyToken,getAllTeachersCtrl)

// /api/users/teacher/count
router.route("/teacher/count")
      .get(verifyTokenAndAdmin,getTeacherCountCtrl)
// /api/users/teachers
router.route("/teacher/specialization")
     .get(verifyToken,getTeachersBySpecializationCtrl)  
// /api/users/teacher/top
router.route("/teacher/top")
      .get(getTopTeachersCtrl)
// /api/users/student
router.route("/student")
      .get(verifyTokenAndAdmin,getAllStudnetsCtrl)

// /api/users/student/count
router.route("/student/count")
      .get(verifyTokenAndAdmin,getStudentssCountCtrl)

// /api/users/profile/:Id
router.route("/profile/:id")
      .get(verifyToken,validateObjectId,getUserProfileCtrl)
      .put(validateObjectId,verifyTokenAndOnlyUser,UpdateUserProfileCtrl)
      .delete(validateObjectId,verifyTokenAndAuthorization,deleteUserProfileCtrl)
// /api/users/profile/profile-photo-upload
router.route("/profile/profile-photo-upload").post(verifyToken, photoUpload.single("image"), profilePhotoUploadCtrl);

module.exports = router;