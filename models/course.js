const mongoose=require("mongoose");
const joi=require("joi");

// Course Schema 
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: Object,
    default: {
      url: "",
      publicId: null,
    },
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  subscribers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  videos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
}, { timestamps: true });



// Validate Create Course
function ValidateCreateCourse(obj){
    const schema=joi.object({
        title:joi.string().min(2).max(200).trim().required(),
        description:joi.string().min(10).trim().required(),
        category:joi.string().trim().required(),
    });
    return schema.validate(obj);
};
// Validate Update Course
function ValidateUpdateCourse(obj){
    const schema=joi.object({
        title:joi.string().min(2).max(200).trim(),
        description:joi.string().min(10).trim(),
        category:joi.string().trim(),
    });
    return schema.validate(obj);
};

// Course Model
const Course=mongoose.model("Course",courseSchema);

module.exports={
    Course,
    ValidateCreateCourse,
    ValidateUpdateCourse,
}
