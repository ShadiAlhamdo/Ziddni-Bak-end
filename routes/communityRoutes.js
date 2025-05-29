const express = require("express");
const router = express.Router();
const {
  getLatestQuestionCtrl,
  postQuestionCtrl,
  editQuestionCtrl,
  deleteQuestionCtrl,
  getAnswersCtrl,
  postAnswerCtrl,
  editAnswerCtrl,
  deleteAnswerCtrl,
  getUserQuestionsCtrl,
  searchQuestionsCtrl,
  getAllAnswersCtrl,
  getQuestionsCountCtrl,
  getAnswersCountCtrl
} = require("../controllers/communityController");
const { verifyToken, verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");

// جلب أحدث سؤال
router.get("/latest", verifyToken, getLatestQuestionCtrl);
// نشر سؤال جديد
router.post("/question", verifyToken, postQuestionCtrl);

router.get('/question/count', verifyTokenAndAdmin, getQuestionsCountCtrl);

// تعديل سؤال
router.put("/question/:id",validateObjectId, verifyToken, editQuestionCtrl);
// حذف سؤال (مع حذف الإجابات)
router.delete("/question/:id", validateObjectId,verifyToken, deleteQuestionCtrl);
// جلب إجابات سؤال معين
router.get("/question/:id/answers", verifyToken, getAnswersCtrl);
// نشر إجابة لسؤال معين
router.post("/question/:id/answer", verifyToken, postAnswerCtrl);
router.get("/answer", verifyTokenAndAdmin, getAllAnswersCtrl);

router.get('/answer/count', verifyTokenAndAdmin, getAnswersCountCtrl);
// تعديل إجابة
router.put("/answer/:id",validateObjectId, verifyToken, editAnswerCtrl);
// حذف إجابة
router.delete("/answer/:id", validateObjectId,verifyToken, deleteAnswerCtrl);
// البحث عن أسئلة
router.get("/search", verifyToken, searchQuestionsCtrl);

module.exports = router;
