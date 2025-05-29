const mongoose = require("mongoose");
const Joi = require("joi");

// Category Schema
const CategorySchema = new mongoose.Schema({
  title: {
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
  
}, { timestamps: true });

// Category Model
const Category = mongoose.model("Category", CategorySchema);

// Validate Careate Category
function validateCreateCategory(data) {
  const schema = Joi.object({
    title: Joi.string().min(1).max(500).required(),
  });
  return schema.validate(data);
}

// Validate UPdate Category
function validateUpdateCategory(data) {
  const schema = Joi.object({
    title: Joi.string().min(1).max(500).required()
  });
  return schema.validate(data);
}

module.exports = {
  Category,
  validateCreateCategory,
  validateUpdateCategory,
};
