const mongoose = require("mongoose");

// Verification Token Schema
const VerificationTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 500, // يمكن تعديل الحد الأقصى للأحرف حسب الحاجة
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
}, { timestamps: true });

// Category Model
const  VerificationToken = mongoose.model(" VerificationToken",  VerificationTokenSchema);



module.exports =  VerificationToken;
