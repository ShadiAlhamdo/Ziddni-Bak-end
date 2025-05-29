const mongoose = require("mongoose");
const Joi = require("joi");

const AnswerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  }
}, { timestamps: true });

const Answer = mongoose.model("Answer", AnswerSchema);

function validateAnswer(data) {
  const schema = Joi.object({
    content: Joi.string().min(1).required(),
  });
  return schema.validate(data);
}

module.exports = { Answer, validateAnswer };