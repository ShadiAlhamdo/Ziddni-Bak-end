const mongoose = require("mongoose");
const Joi = require("joi");

const specializationSchema= new mongoose.Schema({
    specializationName:{
        type:String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    specializationPhoto: {
        type: Object,
        default: {
            url: "https://media.istockphoto.com/id/2185390900/de/foto/night-work-ai-avatar-coding.jpg?s=2048x2048&w=is&k=20&c=TgK3-zIX_GJOBfzz58kQovBbaAdPbkshP-QW-MYO_gU=",
            publicId: null
        }
    }
});

const Specialization = mongoose.model("Specialization", specializationSchema);

// Validate Add Specialization
function validateAddSpecialization(obj){
    const schema = Joi.object({
        specializationName: Joi.string().trim().min(2).max(100).required(),
    });
    return schema.validate(obj);
}
module.exports={
    Specialization,
    validateAddSpecialization,
}