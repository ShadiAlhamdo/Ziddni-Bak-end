const asyncHandler=require("express-async-handler");
const bcrypt=require("bcryptjs");
const {User, validateRegisterUserTeacher, validateLoginUser, validateRegisterUserStudent, validateEmail, validateNewPassword}=require("../models/user");
const crybto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const VerificationToken = require("../models/VerificationToken");
const { send } = require("process");



/**
 * @Desc Send Reset password Link 
 * @Route /api/password/reset-password-link
 * @Method POST
 * @Access Public
 */
module.exports.sendResetPasswordLinkCtrl = asyncHandler(async (req,res)=>{
    const {error} = validateEmail(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message});
    }
    const user = await User.findOne({email:req.body.email});
    if(!user){
         return res.status(400).json({message:"User Is Not Exist"});
    }

    let verificationToken = await VerificationToken.findOne({userId:user._id});

    if(!verificationToken){
        verificationToken = new VerificationToken({
            userId:user._id,
            token:crybto.randomBytes(32).toString("hex"),
        })
    }

    await verificationToken.save();

    const link =`${process.env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`;

    const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 30px; border-radius: 10px; background-color: #f9f9f9;">
  <h2 style="text-align: center; color: #2c3e50; margin-bottom: 10px;">Ziddni</h2>
  <hr style="border: none; border-top: 2px solid #e67e22; width: 60px; margin: 10px auto;">

  <p style="font-size: 16px; color: #333;">
    Hello,
  </p>

  <p style="font-size: 15px; color: #555;">
    We received a request to reset your password. Click the button below to proceed.
  </p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${link}" 
       style="background-color: #e67e22; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px;">
      Reset My Password
    </a>
  </div>

  <p style="font-size: 14px; color: #777;">
    If you didn’t request this, you can safely ignore this email. Your password will remain unchanged.
  </p>

  <p style="font-size: 13px; color: #aaa; text-align: center; margin-top: 40px;">
    &copy; ${new Date().getFullYear()} Ziddni. All rights reserved.
  </p>
</div>

    `
    await sendEmail(user.email,"Reset Password",htmlTemplate);

    res.status(200).json({message:"Password reset link send To Your Email Please Check Your Inbox"})
});

/**
 * @Desc Get Reset password Link 
 * @Route /api/password/reset-password/:userId/:token
 * @Method Get
 * @Access Public
 */
module.exports.getResetPasswordLinkCtrl=asyncHandler(async (req,res)=>{
    const user = await User.findById(req.params.userId);
    if(!user){
        return res.status(400).json({message:"Invalid Link"});
    }

    const verificationToken = await VerificationToken.findOne({
        userId:req.params.userId,
        token:req.params.token
    });
    if(!verificationToken){
        return res.status(400).json({message:"Invalid Link"});
    }

    res.status(200).json({message:"Valid Url"});
});

/**
 * @Desc  Reset password  
 * @Route /api/password/reset-password/:userId/:token
 * @method PosT
 * @Access Public
 */
module.exports.resetPasswordCtrl=asyncHandler(async (req,res)=>{
    const {error} = validateNewPassword(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message});
    }

    const user = await User.findById(req.params.userId);
    if(!user){
         return res.status(400).json({message:"Invalid Link"});
    }

    const verificationToken = VerificationToken.findOne({
        userId:user._id,
        token:req.params.token
    });

    if(!verificationToken){
         return res.status(400).json({message:"Invalid Link"});
    }

    if(!user.isAccountVerified){
        user.isAccountVerified = true
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password,salt);

    user.password = hashedPassword;

    await user.save();

    await verificationToken.deleteOne(); 

    res.status(200).json({message:"Password Reset Successfully, please Login"});
})