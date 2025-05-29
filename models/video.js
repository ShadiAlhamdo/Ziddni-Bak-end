const mongoose=require("mongoose");
const joi=require("joi");

// Video Schema 
const videoSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
        minlength:2,
        maxlength:200,
    },
    url: {
        type: String,
        required: true,
    },
    publicId: {
        type: String,
        required: true,
    },
    image:{
        type:Object,
        default:{
            url:"https://cdn.pixabay.com/photo/2023/03/08/23/21/books-7838952_1280.jpg",
            publicId:null,
        }
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    
},{timestamps:true});

// Validate Create Video
function ValidateCreateVideo(obj) {
    const schema=joi.object({
          title:joi.string().min(2).max(200).trim().required(),
      });
      return schema.validate(obj);
};
// Validate Update Video
function ValidateUpdateVideo(obj) {
    const schema = joi.object({
        title: joi.string().min(2).max(200).trim().optional(),
        url: joi.string().uri().optional(),
        image: joi.object({
            url: joi.string().uri().optional(),
            publicId: joi.string().optional()
        }).optional()
    });
    return schema.validate(obj);
};

// Video Model
const Video=mongoose.model("Video",videoSchema);

module.exports={
    Video,
    ValidateCreateVideo,
    ValidateUpdateVideo,
}
