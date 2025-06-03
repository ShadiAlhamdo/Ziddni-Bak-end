const asyncHandler = require("express-async-handler");
const { Question, validateQuestion } = require("../models/question");
const { Answer, validateAnswer } = require("../models/answer");

/**
 * @desc Get the latest question posted in the community
 * @route  /api/community/latest
 * @method GET
 * @Access Private (Only Logged iN User)
 */
exports.getLatestQuestionCtrl = asyncHandler(async (req, res) => {
  const questions = await Question.find().sort({ createdAt: -1 }).populate("user", "username profilePhoto");
  if (!questions) {
    return res.status(404).json({ message: "No questions found" });
  }
  res.status(200).json( questions );
});

/**
 * @desc Post a new question
 * @route  /api/community/question
 * @method POST
 * @Access Private (Only Logged iN User)
 */
exports.postQuestionCtrl = asyncHandler(async (req, res) => {
  const { error } = validateQuestion(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const question = new Question({
    content: req.body.content,
    user: req.user.id,
  });
  await question.save();
  res.status(201).json({ message: "Question posted successfully", question });
});

/**
 * @desc Edit a question
 * @route  /api/community/question/:id
 * @method PUT
 * @Access Private (Only the owner)
 */
exports.editQuestionCtrl = asyncHandler(async (req, res) => {
  const { error } = validateQuestion(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const questionId = req.params.id;
  const question = await Question.findById(questionId);
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }
  if (question.user.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: "Not allowed to edit this question" });
  }
  question.content = req.body.content;
  await question.save();
  res.status(200).json({ message: "Question updated successfully", question });
});

/**
 * @desc Delete a question (and all its answers)
 * @route  /api/community/question/:id
 * @method DELETE
 * @Access Private (Only the owner)
 */
exports.deleteQuestionCtrl = asyncHandler(async (req, res) => {
  const questionId = req.params.id;
  const question = await Question.findById(questionId);
  if(!req.user.isAdmin){
     return res.status(404).json({message:"No User Is Admin"})
  }
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }
  
  if (question.user.toString() !== req.user.id.toString() || req.user.isAdmin) {
    return res.status(403).json({ message: "Not allowed to delete this question" });
  }
  // حذف جميع الإجابات المتعلقة بالسؤال
  await Answer.deleteMany({ question: questionId });
  await question.deleteOne();
  res.status(200).json({ message: "Question and its answers deleted successfully" });
});

/**
 * @desc Get Total Number of Questions
 * @route  /api/community/questions/count
 * @method GET
 * @Access Private (Only Admin)
 */
exports.getQuestionsCountCtrl = asyncHandler(async (req, res) => {
  const count = await Question.countDocuments();
  res.status(200).json( count);
});

/**
 * @desc Get all answers 
 * @route  /api/community/answers
 * @method GET
 * @Access Private (OnlyAdmin)
 */
exports.getAllAnswersCtrl = asyncHandler(async (req, res) => {
 // جلب جميع الإجابات مع بيانات المستخدم ومحتوى السؤال
 const answers = await Answer.find()
 .populate("user", "username profilePhoto")
 .populate("question", "content")
 .sort({ createdAt: -1 });

res.status(200).json({ answers });
});
/**
 * @desc Get all answers for a specific question
 * @route  /api/community/question/:id/answers
 * @method GET
 * @Access Private (Only Logged iN User)
 */
exports.getAnswersCtrl = asyncHandler(async (req, res) => {
  const questionId = req.params.id;
  const answers = await Answer.find({ question: questionId })
    .populate("user", "username profilePhoto")
    .populate("question", "content")
    .sort({ createdAt: -1 });
  res.status(200).json({ answers });
});

/**
 * @desc Post an answer for a question
 * @route  /api/community/question/:id/answer
 * @method POST
 * @Access Private (Only Logged iN User)
 */
exports.postAnswerCtrl = asyncHandler(async (req, res) => {
  const { error } = validateAnswer(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const questionId = req.params.id;
  const answer = new Answer({
    content: req.body.content,
    user: req.user.id,
    question: questionId,
  });
  await answer.save();
  res.status(201).json({ message: "Answer posted successfully", answer });
});

/**
 * @desc Edit an answer
 * @route  /api/community/answer/:id (Answer ID)
 * @method PUT
 * @Access Private (Only the owner)
 */
exports.editAnswerCtrl = asyncHandler(async (req, res) => {
  const { error } = validateAnswer(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const answerId = req.params.id;
  const answer = await Answer.findById(answerId);
  if (!answer) {
    return res.status(404).json({ message: "Answer not found" });
  }
  if (answer.user.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: "Not allowed to edit this answer" });
  }
  answer.content = req.body.content;
  await answer.save();
  res.status(200).json({ message: "Answer updated successfully", answer });
});

/**
 * @desc Delete an answer
 * @route  /api/community/answer/:id (Answer Id)
 * @method DELETE
 * @Access Private (Only the owner)
 */
exports.deleteAnswerCtrl = asyncHandler(async (req, res) => {
  const answerId = req.params.id;
  const answer = await Answer.findById(answerId);
  if (!answer) {
    return res.status(404).json({ message: "Answer not found" });
  }
  if (answer.user.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: "Not allowed to delete this answer" });
  }
  await answer.deleteOne();
  res.status(200).json({ message: "Answer deleted successfully" });
});

/**
 * @desc Get Total Number of Answers
 * @route  /api/community/answers/count
 * @method GET
 * @Access Private (Only Admin or Logged in users)
 */
exports.getAnswersCountCtrl = asyncHandler(async (req, res) => {
  const count = await Answer.countDocuments();
  res.status(200).json( count );
});



/**
 * @desc Search questions by a query string
 * @route  /api/community/search?q=...
 * @method GET
 * @Access Private
 */
exports.searchQuestionsCtrl = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ message: "Query parameter is required" });
  }

  // البحث باستخدام النص الكامل + إحضار بيانات المستخدم
  const questions = await Question.find({ $text: { $search: q } })
    .sort({ score: { $meta: "textScore" } })
    .populate("user", "username profilePhoto");

  res.status(200).json({ message: "Search results", questions });
});

