const express = require("express");
const { createCommentCtrl, updateCommentCtrl, deleteCommentCtrl, getCommentsByVideoCtrl, getAllCommentsCtrl, getLastFourCommentsCtrl, getCommentsCountCtrl } = require("../controllers/commentController");
const { verifyToken, verifyTokenAndAdmin, verifyTokenAndStudent } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");

const router = express.Router();
// /api/comments
router.route("/")
      .post( verifyTokenAndStudent, createCommentCtrl)
      .get(verifyTokenAndAdmin,getAllCommentsCtrl);

// /api/comments/count
router.get('/count', verifyTokenAndAdmin, getCommentsCountCtrl);

// /api/comments/:id
router.route("/:id")
      .put( validateObjectId,verifyToken, updateCommentCtrl)
      .delete(validateObjectId, verifyToken, deleteCommentCtrl);

// /api/comments/video/:id
router.get("/video/:id",validateObjectId,verifyToken, getCommentsByVideoCtrl);

// /api/comments/last
router.get("/last", getLastFourCommentsCtrl);


module.exports = router;