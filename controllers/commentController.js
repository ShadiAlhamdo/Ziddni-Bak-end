const asyncHandler = require("express-async-handler");
const { Comment, validateCreateComment, validateUpdateComment } = require("../models/comment");
const { Video } = require("../models/video"); // التأكد من أن الفيديو موجود قبل التعليق

/**
 * @Desc Create New Comment
 * @Route /api/comments
 * @Method POST
 * @Access private (Only Logged in users)
 */
exports.createCommentCtrl = asyncHandler(async (req, res) => {
  // تحقق من صحة البيانات المدخلة
  const { error } = validateCreateComment(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { content, video } = req.body;

  // التحقق من وجود الفيديو
  const existingVideo = await Video.findById(video);
  if (!existingVideo) {
    return res.status(404).json({ message: "Video Is Not Exist" });
  }

  // إنشاء التعليق وربطه بالمستخدم (يُفترض أن بيانات المستخدم محفوظة في req.user بعد التوثيق)
  const comment = new Comment({
    content,
    user: req.user.id,
    video
  });

  await comment.save();

  res.status(201).json({ message: "Comment Add Successfully",comment });
});
/**
 * @Desc Update Comment
 * @Route /api/comments/:id
 * @Method PUT
 * @Access private (Only Owner The Comment)
 */
exports.updateCommentCtrl = asyncHandler(async (req, res) => {
  const { error } = validateUpdateComment(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const commentId = req.params.id;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ message: "The Comment Is Not Exist" });
  }

  // التأكد من أن المستخدم هو صاحب التعليق
  if (comment.user.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: "Access Denied , You´r Not Allowed" });
  }

  comment.content = req.body.content;
  await comment.save();

  res.status(200).json({ message: "Comment Updated Successfully", comment });
});

/**
 * @Desc Get All Comments
 * @Route /api/comments
 * @Method GET
 * @Access private (Only Admin)
 */
exports.getAllCommentsCtrl = asyncHandler(async (req, res) => {
  // جلب جميع التعليقات مع معلومات الفيديو، الكورس، والمستخدم
  const comments = await Comment.find()
    .populate({
      path: "user",
      select: "username", // أو name إذا كان هذا الحقل موجود
    })
    .populate({
      path: "video",
      select: "title course",
      populate: {
        path: "course",
        select: "title"
      }
    })
    .sort({ createdAt: -1 });

  res.status(200).json(comments);
});

/**
 * @Desc Get Last 4 Comments (regardless of video)
 * @Route /api/comments/last
 * @Method GET
 * @Access private (only logged Users)
 */
exports.getLastFourCommentsCtrl = asyncHandler(async (req, res) => {
  const comments = await Comment.find()
    .populate("user", "username profilePhoto")
    .populate({
      path: "video",
      select: "title",
    })
    .sort({ createdAt: -1 })
    .limit(4);

  res.status(200).json({ comments });
});


/**
 * @Desc Get All Comments for a Specific Video
 * @Route /api/comments/video/:id
 * @Method GET
 * @Access private (only logged Users)
 */
exports.getCommentsByVideoCtrl = asyncHandler(async (req, res) => {
    const videoId = req.params.id;
  
    // التحقق من وجود الفيديو
    const existingVideo = await Video.findById(videoId);
    if (!existingVideo) {
      return res.status(404).json({ message: "Video Is Not Exist" });
    }
  
    // جلب جميع التعليقات الخاصة بالفيديو مع معلومات المستخدم (مثلاً الاسم والصورة الشخصية)
    const comments = await Comment.find({ video: videoId })
      .populate("user", "username profilePhoto")
      .sort({ createdAt: -1 }); // ترتيب التعليقات بحيث يكون الأحدث أولاً
  
    res.status(200).json({ comments });
});
/**
 * @Desc Delete Comment
 * @Route /api/comments/:id
 * @Method Delete
 * @Access private (Only Owner The Comment)
 */
exports.deleteCommentCtrl = asyncHandler(async (req, res) => {
  const commentId = req.params.id;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ message:"The Comment Is Not Exist" });
  }

  // السماح بحذف التعليق لصاحبه أو للأدمن (بافتراض أن req.user يحتوي على isAdmin)
  if (comment.user.toString() !== req.user.id.toString() && !req.user.isAdmin) {
    return res.status(403).json({ message: "Access Denied , You´r Not Allowed"});
  }

  await comment.deleteOne();

  res.status(200).json({ message:"Comment Deleted Successfully"});
});
/**
 * @Desc Get Total Number of Comments
 * @Route /api/comments/count
 * @Method GET
 * @Access private (Only Admin or Logged in users - حسب الحاجة)
 */
exports.getCommentsCountCtrl = asyncHandler(async (req, res) => {
  const count = await Comment.countDocuments();
  res.status(200).json( count );
});
