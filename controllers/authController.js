const asyncHandler=require("express-async-handler");
const bcrypt=require("bcryptjs");
const {User, validateRegisterUserTeacher, validateLoginUser, validateRegisterUserStudent}=require("../models/user");
const crybto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const VerificationToken = require("../models/VerificationToken");

/**
 * @Desc Register New User
 * @Route /api/auth/register
 * @Method POST
 * @Access Public
 */
module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
    // التحقق من صحة البيانات
   if(req.body.role==="teacher"){
    const { error } = validateRegisterUserTeacher(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
   }else if(req.body.role==="student"){
    const { error } = validateRegisterUserStudent(req.body);
    if (error) {        
        return res.status(400).json({ message: error.details[0].message });
    }
   }else{
    return res.status(400).json({ message:"Sorry There Are Error"});
   }
   

    // التحقق مما إذا كان البريد الإلكتروني مسجل مسبقًا
    let existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
        return res.status(400).json({ message: "This email is already Exist" });
    }

    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // إنشاء المستخدم الجديد
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role,
        phoneNumber: req.body.role === "teacher" ? req.body.phoneNumber : undefined,
        whatsappLink: req.body.role === "teacher" ? req.body.whatsappLink : undefined,
        specialization: req.body.role === "teacher" ? req.body.specialization : undefined
    });

    // حفظ المستخدم في قاعدة البيانات
    await user.save();

    //Creating New Verification Token & save On Db (Verify Account)
    const vireficationToken = new VerificationToken({
        userId: user._id,
        token:crybto.randomBytes(32).toString("hex"),
    });
    await vireficationToken.save();
    // Making The Link
    const link=`${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${vireficationToken.token}`
    //Putzing Zhe Link In To Html Template
    const htmlTemplate=`
   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 30px; border-radius: 10px; background-color: #f9f9f9;">
  <h2 style="text-align: center; color: #2c3e50; margin-bottom: 10px;">Ziddni</h2>
  <hr style="border: none; border-top: 2px solid #3498db; width: 60px; margin: 10px auto;">

  <p style="font-size: 16px; color: #333;">
    Welcome to <strong>Ziddni</strong>! 🎉 Thank you for joining our educational platform.
  </p>

  <p style="font-size: 15px; color: #555;">
    To get started, please verify your email address by clicking the button below.
  </p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${link}" 
       style="background-color: #3498db; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px;">
      Verify My Email
    </a>
  </div>

  <p style="font-size: 14px; color: #777;">
    If you did not sign up for a Ziddni account, you can safely ignore this email.
  </p>

  <p style="font-size: 13px; color: #aaa; text-align: center; margin-top: 40px;">
    &copy; ${new Date().getFullYear()} Ziddni. All rights reserved.
  </p>
</div>

    `
    //Sending The Link to The User
    await sendEmail(user.email,"Verify Your Email",htmlTemplate);

    

    // إرسال الاستجابة مع التوكن
    res.status(201).json({ message: "We send To You An Email, Please Verify Your Email Address"});
});

/**
 * @desc Login User 
 * @route  /api/auth/login
 * @method POST
 * @access Public
 */

module.exports.loginUserCtrl=asyncHandler(async (req,res)=>{
    const {error}=validateLoginUser(req.body);
    if(error){
     return   res.status(400).json({message:error.details[0].message});
    }
    const user =await User.findOne({email:req.body.email});
    if(!user){
        return   res.status(400).json({message:"invalid Email or Password"});
    }
    const isPasswordMatch=await bcrypt.compare(req.body.password,user.password);
    if(!isPasswordMatch){
        return   res.status(400).json({message:"invalid Email or Password"});
    }

    //@TODO Sending Email (Verify Account If Not Verified)
    if(!user.isAccountVerified){
            return res.status(400).json({ message: "We send To You An Email, Please Verify Your Email Address"});
    }

    const token=user.generateAuthToken();

    res.status(200).json({
        _id:user._id,
        username:user.username,
        isAdmin:user.isAdmin,
        profilePhoto:user.profilePhoto,
        role:user.role,
        token,
    });
});

/**
 * @desc Verify User Account  
 * @route  /api/auth/:userId/verify/:token
 * @method GET
 * @access Public
 */
module.exports.verifyUserAccountCtrl = asyncHandler(async (req,res)=>{
    const user = await User.findById(req.params.userId);
    if(!user){
        return res.status(400).json({message:"Invalid Link"});
    }

    const verificationToken = await VerificationToken.findOne({
        userId:user._id,
        token:req.params.token,
    })
    
    if(!verificationToken ){
        return  res.status(400).json({message:"Invalid Link"});
    }
    
    user.isAccountVerified = true;

    await user.save();

    await verificationToken.deleteOne(); 


    res.status(200).json({message:"Your Account Verify , Please Login 0_0 "});

});