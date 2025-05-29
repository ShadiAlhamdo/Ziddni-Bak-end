const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

// User Schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
    },
    profilePhoto: {
        type: Object,
        default: {
            url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1VbuFKxaZgswnNeZAbmFbeVBMTGTxjYJ5eA&s",
            publicId: null
        }
    },
    bio: {
        type: String,
        
    },
    role: {
        type: String,
        enum: ["student", "teacher"],
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isAccountVerified: {
        type: Boolean,
        default: false
    },
    phoneNumber: {
        type: String,
        
    },
    whatsappLink: {
        type: String,
        
    },
    specialization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Specialization",
        required: function () { return this.role === "teacher"; }
    },
}, {
    timestamps: true,
    toJSON: {virtuals:true},
    toObject:{virtuals:true}
});
// Populate Courses That Belongs To This User When He get His Profile
UserSchema.virtual("courses",{
    ref:"Course",
    foreignField:"user",
    localField:"_id"
});
// Populate Question That Belongs To This User When He get His Profile
UserSchema.virtual("questions",{
    ref:"Question",
    foreignField:"user",
    localField:"_id"
});
// Generate Auth Token
UserSchema.methods.generateAuthToken = function () {
    return jwt.sign({ id: this._id, role: this.role, isAdmin: this.isAdmin }, process.env.SECRET_KEY);
};

const User = mongoose.model("User", UserSchema);

// Validation Register Functions

function validateRegisterUserTeacher(obj) {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100).required(),
        email: Joi.string().trim().min(5).email().max(100).required(),
        password: Joi.string().trim().min(8).required(),
        role: Joi.string().valid("student", "teacher").required(),
        bio: Joi.string().allow(""),                      // ✅ سمح بـ bio
        phoneNumber: Joi.string().allow(""),              // ✅ سمح بـ phoneNumber
        whatsappLink: Joi.string().allow(""),
        specialization: Joi.string().regex(/^[0-9a-fA-F]{24}$/).when("role", { is: "teacher", then: Joi.string().required() })
    });
    return schema.validate(obj);
}
function validateRegisterUserStudent(obj) {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100).required(),
        email: Joi.string().trim().min(5).email().max(100).required(),
        password: Joi.string().trim().min(8).required(),
        role: Joi.string().valid("student", "teacher").required(),
        bio: Joi.string().allow(""),                      // ✅ سمح بـ bio
        phoneNumber: Joi.string().allow(""),              // ✅ سمح بـ phoneNumber
        whatsappLink: Joi.string().allow("")  ,
        specialization: Joi.string().allow("")  ,           // ✅ سمح بـ whatsappLink
    });
    return schema.validate(obj);
}
// Validation Login Functions
function validateLoginUser(obj) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(100).trim().required(),
        password: Joi.string().min(8).required()
    });
    return schema.validate(obj);
}
// Validation Update Functions
function validateUpdateUser(obj) {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100),
        password: Joi.string().trim().min(8),
        bio: Joi.string(),
        phoneNumber: Joi.string(),
        whatsappLink: Joi.string(),
        specialization: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
    });
    return schema.validate(obj);
}
// Validate Email
function validateEmail(obj) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(100).trim().required(),
    });
    return schema.validate(obj);
}
// Validation New  Password
function validateNewPassword(obj) {
    const schema = Joi.object({
        password: Joi.string().trim().min(8).required()
    });
    return schema.validate(obj);
}

module.exports={
    User,
    validateRegisterUserTeacher,
    validateRegisterUserStudent,
    validateLoginUser,
    validateUpdateUser,
    validateEmail,
    validateNewPassword,
}