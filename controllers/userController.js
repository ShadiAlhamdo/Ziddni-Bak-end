const asyncHandler=require("express-async-handler");
const {User, validateUpdateUser}=require("../models/user");
const { Course } = require("../models/course");
const { Video } = require("../models/video");
const { Comment } = require("../models/comment");
const { Answer } = require("../models/answer");         // تأكد من وجود المودل المناسب للإجابات
const { Question } = require("../models/question");       // تأكد من وجود المودل المناسب للأسئلة
const { cloudinaryRemoveImage, cloudinaryRemoveVideo,handleImageUpload } = require("../utils/cloudinary"); 
const { Specialization } = require("../models/specialization");
const bcrypt=require("bcryptjs");


/**
 * @desc Get All Teachers
 * @route /api/users/teacher
 * @method GET
 * @access Private (Only Logged Users)
 */
module.exports.getAllTeachersCtrl = asyncHandler(async (req, res) => {
    const users = await User.find({ role: "teacher" })
        .select("-password")
        .populate("courses questions specialization", "-__v");

    if (!users || users.length === 0) {
        return res.status(404).json({ message: "No teachers found" });
    }

    res.status(200).json(users);
});

/**
 * @desc Get Teachers By Specialization Name
 * @route /api/users/teacher/specialization/specialization?specialization=
 * @method GET
 * @access public
 */
module.exports.getTeachersBySpecializationCtrl = asyncHandler(async (req, res) => {
    const { specialization } = req.query;
    if (!specialization) {
        return res.status(400).json({ message: "Specialization name is required" });
    }

    const specializationDoc = await Specialization.findOne({ specializationName: specialization });
    if (!specializationDoc) {
        return res.status(404).json({ message: "Specialization not found" });
    }

    const users = await User.find({
        role: "teacher",
        specialization: specializationDoc._id
    })
        .select("-password")
        .populate("courses questions specialization", "-__v");

   

    res.status(200).json(users);
});

/**
 * @desc Get Top 4 Teachers With Most Courses (Using $lookup)
 * @route /api/users/teacher/top
 * @method GET
 * @access Public
 */
module.exports.getTopTeachersCtrl = asyncHandler(async (req, res) => {
    const topTeachers = await User.aggregate([
        { $match: { role: "teacher" } }, // فقط المعلمين

        // جلب الكورسات المرتبطة بالمستخدم
        {
            $lookup: {
                from: "courses", // اسم مجموعة الكورسات في MongoDB
                localField: "_id",
                foreignField: "user",
                as: "teacherCourses"
            }
        },

        // حساب عدد الكورسات
        {
            $addFields: {
                coursesCount: { $size: "$teacherCourses" }
            }
        },

        // ترتيب تنازلي
        { $sort: { coursesCount: -1 } },

        // تحديد أول 4
        { $limit: 4 },

        // اختيار الحقول المراد عرضها
        {
            $project: {
                username: 1,
                email: 1,
                profilePhoto: 1,
                coursesCount: 1,
                specialization: 1,
                // يمكن حذف teacherCourses إن لم تكن بحاجة لها
            }
        }
    ]);

    if (!topTeachers || topTeachers.length === 0) {
        return res.status(404).json({ message: "No top teachers found" });
    }

    // Populate التخصصات
    const populatedTeachers = await User.populate(topTeachers, {
        path: "specialization",
        select: "-__v"
    });

    res.status(200).json(populatedTeachers);
});




/**
 * @desc Get All Students
 * @route /api/users/student
 * @method GET
 * @access Private (Only Admin)
 */
module.exports.getAllStudnetsCtrl=asyncHandler(async (req,res)=>{
    const Users=await User.find({role:"student"}).select("-password").populate("courses questions");
    if(!Users){
        res.status(404).json({message:"Users Not Found"});
    }
    res.status(200).json(Users)
});

/**
 * @desc Get User Profile
 * @route /api/users/profile/:Id
 * @method GET
 * @access Private (Only Logged users)
 */
module.exports.getUserProfileCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select("-password")
        .populate("courses")
        .populate({
            path: "questions",
            select: "content createdAt updatedAt", // حدد الحقول التي تريد عرضها من كل سؤال
        });

    if (!user) {
        return res.status(404).json({ message: "User Not Found" });
    }

    return res.status(200).json(user);
});

/**
 * @desc Update User Profile
 * @route /api/users/profile/:Id
 * @method PUT
 * @access Private (Only User Himself)
 */
module.exports.UpdateUserProfileCtrl=asyncHandler(async (req,res)=>{
    const {error}=validateUpdateUser(req.body);
    if(error){
        return res.status(400).json({message:error.details[1].message});
    }
    if(req.body.password)
    {
        const salt=await bcrypt.genSalt(10);
        req.body.password=await bcrypt.hash(req.body.password,salt);
    }

    const UpdatedUser=await User.findByIdAndUpdate(req.params.id , {
        $set:{
            username:req.body.username,
            password:req.body.password,
            bio:req.body.bio,
            phoneNumber:req.body.phoneNumber,
            whatsappLink:req.body.whatsappLink,     
        }
    },{new:true}).select("-password")
    .populate("courses");
    
    res.status(200).json(UpdatedUser);

});

/**
 * @desc Get Teacher Count
 * @route /api/users/teacher/count
 * @method GET
 * @access Private (Only Admin)
 */
module.exports.getTeacherCountCtrl=asyncHandler(async (req,res)=>{
    const count=await User.countDocuments({role:"teacher"});
    
    res.status(200).json(count)
});

/**
 * @desc Get Studbet Count
 * @route /api/users/student/count
 * @method GET
 * @access Private (Only Admin)
 */
module.exports.getStudentssCountCtrl=asyncHandler(async (req,res)=>{
    const count=await User.countDocuments({role:"student"});
    
    res.status(200).json(count)
});

/**
 * @desc Profile Photo Upload
 * @route /api/users/profile/profile-photo-upload
 * @method POST
 * @access Private (Only Logged in User)
 */
module.exports.profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
    // 1- Validation
    if (!req.file) {
        return res.status(400).json({ message: "No File Provided" });
    }

    // 2- Get The Buffer of the Image
    const fileBuffer = req.file.buffer;

    // 3- Upload to Cloudinary
    try {
        const imageInfo = await handleImageUpload(fileBuffer);
    //4- Get The User From DB
    const user=await User.findById(req.user.id);

    //5- Delete The Old Profile Photo If Exist
    if(user.profilePhoto.publicId !== null)
    {
        await cloudinaryRemoveImage(user.profilePhoto.publicId);
    }
    //6- Change the ProfilePhoto Field In The DB
    user.profilePhoto = {
        url:imageInfo.secure_url,
        publicId:imageInfo.public_id,
    };

    await user.save();

    // 7- Send the response to the client
        res.status(200).json({
            message: "Your Profile Photo Uploaded Successfully",
            profilePhoto:{url:imageInfo.secure_url, publicId:imageInfo.public_id}
        });
    } catch (error) {
        console.error("Error in profilePhotoUploadCtrl:", error);
        res.status(500).json({ message: "Error uploading image" });
    }
});


/**
 * @desc Delete Users Profile (Account)
 * @route /api/users/profile/:id
 * @method DELETE
 * @access Private (Only Admin & User HimSelf)
 */
module.exports.deleteUserProfileCtrl = asyncHandler(async (req, res) => {
    // 1- الحصول على المستخدم من قاعدة البيانات
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "The User Not Found" });
    }
  
    // 2- حذف جميع الإجابات التي كتبها المستخدم
    await Answer.deleteMany({ user: user._id });
  
    // 3- حذف جميع الأسئلة التي نشرها المستخدم مع حذف كل الإجابات التابعة لهذه الأسئلة
    const userQuestions = await Question.find({ user: user._id });
    if (userQuestions?.length > 0) {
      const questionIds = userQuestions?.map(q => q._id);
      await Answer.deleteMany({ question: { $in: questionIds } });
      await Question.deleteMany({ user: user._id });
    }
  
    // 4- إذا كان المستخدم أستاذًا
    if (user.role === "teacher") {
      // A- الحصول على جميع الكورسات التي تنتمي لهذا المستخدم
      const courses = await Course.find({ user: user._id });
      for (const course of courses) {
        // B- الحصول على جميع الفيديوهات التابعة للكورس
        const videos = await Video.find({ course: course._id });
        const videoIds = videos?.map(v => v._id);
  
        // C- حذف جميع التعليقات على هذه الفيديوهات
        await Comment.deleteMany({ video: { $in: videoIds } });
  
        // D & E- حذف صور الفيديوهات والفيديوهات نفسها من Cloudinary
        for (const video of videos) {
          if (video.image && video.image.publicId) {
            await cloudinaryRemoveImage(video.image.publicId);
          }
          if (video.publicId) {
            await cloudinaryRemoveVideo(video.publicId);
          }
        }
        // F- حذف صورة الكورس من Cloudinary إن وُجدت
        if (course.image && course.image.publicId) {
          await cloudinaryRemoveImage(course.image.publicId);
        }
      }
      // G- حذف جميع الفيديوهات التابعة للكورسات
      await Video.deleteMany({ course: { $in: courses.map(c => c._id) } });
      // H- حذف الكورسات نفسها
      await Course.deleteMany({ user: user._id });
    } else if (user.role === "student") {
      // 5- إذا كان المستخدم طالباً: حذف جميع التعليقات التي كتبها في الفيديوهات
      await Comment.deleteMany({ user: user._id });
    }
  
    // 6- حذف صورة الملف الشخصي من Cloudinary (إن وُجدت)
    if (user.profilePhoto && user.profilePhoto.publicId) {
      await cloudinaryRemoveImage(user.profilePhoto.publicId);
    }
  
    // 7- حذف المستخدم نفسه
    await User.findByIdAndDelete(req.params.id);
  
    res.status(200).json({ message: "Your Profile Has Been Deleted Successfully" });
});


