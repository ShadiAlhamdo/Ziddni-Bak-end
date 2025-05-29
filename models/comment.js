const mongoose = require("mongoose");
const Joi = require("joi");

// Comment Schema
const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 500, // يمكن تعديل الحد الأقصى للأحرف حسب الحاجة
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true,
  }
}, { timestamps: true });

// إنشاء مودل التعليق
const Comment = mongoose.model("Comment", CommentSchema);

// دالة التحقق من صحة البيانات عند إنشاء تعليق
function validateCreateComment(data) {
  const schema = Joi.object({
    content: Joi.string().min(1).max(500).required(),
    video: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required() // التأكد من أن video هو ObjectId صحيح
  });
  return schema.validate(data);
}

// دالة التحقق من صحة البيانات عند تعديل التعليق
function validateUpdateComment(data) {
  const schema = Joi.object({
    content: Joi.string().min(1).max(500).required()
  });
  return schema.validate(data);
}

module.exports = {
  Comment,
  validateCreateComment,
  validateUpdateComment
};
