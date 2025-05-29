const express = require("express");
const router=express.Router();
const { photoUpload } = require("../middlewares/photoUpload");
const { verifyTokenAndAdmin,verifyTokenAndStudent, verifyToken,
       verifyTokenAndTeacher } = require("../middlewares/verifyToken");
const { createCourseCtrl, getAllCoursesCtrl, getSingleCourseCtrl, getCourseCountCtrl, deleteCourseCtrl, updateCourseCtrl, updateCourseImageCtrl, getCoursesByCategoryCtrl, toggleLikeCourseCtrl } = require("../controllers/courseController");
const {getUserSubscribedCoursesCtrl,getUserFavoriteCoursesCtrl, toggleSubscribeCourseCtrl, toggleFavoriteCourseCtrl} = require("../controllers/userCourseRelController");
const validateObjectId = require("../middlewares/validateObjectId");

// /api/courses
router.route("/")
      .post(verifyTokenAndTeacher,photoUpload.single("image"),createCourseCtrl)
      .get(getAllCoursesCtrl);
      
// /api/courses/my-subscribed
router.get("/my-subscribed", verifyToken, getUserSubscribedCoursesCtrl);

// /api/courses/my-favorites
router.get("/my-favorites", verifyToken, getUserFavoriteCoursesCtrl);

// /api/courses/count
router.route("/count").get(getCourseCountCtrl);

// /api//category"
router.get("/category", getCoursesByCategoryCtrl);

// /api/courses/update-image/:id
router.route("/update-image/:id")
      .put(validateObjectId,verifyToken,photoUpload.single("image"),updateCourseImageCtrl);

// /api/courses/like/:id
router.put("/like/:id", verifyToken, toggleLikeCourseCtrl);

// /api/courses/:id
router.route("/:id")
      .get(validateObjectId,getSingleCourseCtrl)
      .delete(validateObjectId,verifyToken,deleteCourseCtrl)
      .put(validateObjectId,verifyToken,updateCourseCtrl)











// /api/courses/subscribe/:id (Course Id)
router.route("/subscribe/:id")
      .put( validateObjectId,verifyTokenAndStudent, toggleSubscribeCourseCtrl);

// /api/courses/favorite/:id (Course ID)
router.route("/favorite/:id")
      .put(validateObjectId, verifyTokenAndStudent, toggleFavoriteCourseCtrl);




module.exports = router;