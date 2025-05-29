const mongoose = require("mongoose");
const Joi = require("joi");

const QuestionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, { timestamps: true });

// إنشاء فهرس نصي للبحث عن الأسئلة حسب المحتوى
QuestionSchema.index({ content: "text" });

const Question = mongoose.model("Question", QuestionSchema);

// Validateion Question
function validateQuestion(data) {
  const schema = Joi.object({
    content: Joi.string().min(5).required()
  });
  return schema.validate(data);
}

module.exports = { Question, validateQuestion };
