const asyncHandler=require("express-async-handler");
const {Course,ValidateCreateCourse,ValidateUpdateCourse}=require("../models/course");
const { handleImageUpload, cloudinaryRemoveImage, cloudinaryUploadImage, cloudinaryRemoveVideo } = require("../utils/cloudinary");
const {Video}=require("../models/video")
const {Comment}=require("../models/comment")

/**
 * @Desc Create New Course
 * @Route /api/courses
 * @method POST
 * @Accsess Private (Only Logged in User And Teacher)
 */

module.exports.createCourseCtrl = asyncHandler(async (req, res) => {
    // 1- التحقق من الصورة
    
    if (!req.file) {
        return res.status(400).json({ message: "No Image Provided" });
    }

    // 2- التحقق من البيانات
    const { error } = ValidateCreateCourse(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 3- التحقق مما إذا كان نفس المستخدم لديه نفس عنوان البوست
    const existingCourse = await Course.findOne({ title: req.body.title, user: req.user.id });
    if (existingCourse) {
        return res.status(400).json({ message: "You already have a Course with this title." });
    }

    // 4- رفع الصورة
    const fileBuffer = req.file.buffer;
    try {
        const imageInfo = await handleImageUpload(fileBuffer);

        // 5- إنشاء المنشور وحفظه في قاعدة البيانات
        const course = new Course({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            user: req.user.id,
            image: {
                url: imageInfo.secure_url,
                publicId: imageInfo.public_id,
            }
        });

        await course.save();

        // 6- إرسال الاستجابة إلى العميل
        res.status(201).json({ message: "Course Has Created Successfully",courseId:course._id });

    } catch (error) {
        console.error("Error in createCourseCtrl:", error);
        res.status(500).json({ message: "Error uploading image" });
    }
});

/**
 * @Desc Get All Courses
 * @Route /api/courses
 * @method GET
 * @Accsess Public
 */
module.exports.getAllCoursesCtrl = asyncHandler(async (req, res) => {
    const POST_PER_PAGE = 6;
    const { pageNumber, popular, search } = req.query;
    let courses;
    let query = {};

    // ✅ 1. إضافة البحث بالاسم أو الوصف إذا تم توفير كلمة بحث
    if (search) {
        query = {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        };
    }

    // ✅ 2. الأكثر شهرة
    if (popular === "true") {
        courses = await Course.find(query)
            .sort({ subscribersCount: -1 })
            .limit(6)
            .populate("user", ["-password"]);
    }
    // ✅ 3. البحث مع صفحات
    else if (pageNumber) {
        courses = await Course.find(query)
            .skip((pageNumber - 1) * POST_PER_PAGE)
            .limit(POST_PER_PAGE)
            .sort({ createdAt: -1 })
            .populate("user", ["-password"]);
    }
    // ✅ 4. جميع الكورسات
    else {
        courses = await Course.find(query)
            .sort({ createdAt: -1 })
            .populate("user", ["-password"]);
    }

    res.status(200).json({ courses });
});


/**
 * @Desc Get Courses By Category
 * @Route /api/courses/category
 * @method GET
 * @Access Public
 */
module.exports.getCoursesByCategoryCtrl = asyncHandler(async (req, res) => {
    const { category } = req.query;

    if (!category) {
        return res.status(400).json({ message: "Category query is required" });
    }

    const courses = await Course.find({ category })
        .sort({ createdAt: -1 })
        .populate("user", ["-password"]);

   
    res.status(200).json({ courses });
});


/**
 * @Desc Get Single Course
 * @Route /api/courses/:id
 * @method GET
 * @Accsess Public
 */
module.exports.getSingleCourseCtrl=asyncHandler(async (req,res)=>{
    const course=await Course.findById(req.params.id).populate("user",["-password"]).populate("videos");
    if(!course){
        return res.status(404).json({message:"course Not Found"});
    }
    res.status(200).json(course)

});

/**
 * @Desc Get Count Of Courses
 * @Route /api/courses/count
 * @method GET
 * @Accsess public
 */
module.exports.getCourseCountCtrl=asyncHandler(async (req,res)=>{
    const count=await Course.countDocuments();
    
    res.status(200).json(count);

});

/**
 * @Desc Update Course
 * @Route /api/courses/:id
 * @method PUT
 * @Accsess Private (Only Owner Of The Course)
 */
module.exports.updateCourseCtrl=asyncHandler(async (req,res)=>{
    // 1- Vlaidation
 const {error}=ValidateUpdateCourse(req.body);
 if(error){
   return  res.status(400).json({message:error.details[0].message});
 }
 // 2- Get The Post From The Db
 const course=await Course.findById(req.params.id);
 if(!course){
    return  res.status(404).json({message:"Course Not Found"});
 }
 // 3- Check if Course Belong To Logged in User
 if(req.user.id !== course.user.toString()){
    return res.status(403).json({message:"Access Denied , You Are Not Allowed"});
 }
 // 4- Update The Course
 const updatedCourse=await Course.findByIdAndUpdate(req.params.id,{
    $set:{
        title:req.body.title,
        description:req.body.description,
        category:req.body.category,
    }
 },{new:true}).populate("user",["-password"]);
 //5- Send Response To Client
 res.status(200).json(updatedCourse);
});

/**
 * @Desc Update Course Image
 * @Route /api/courses/update-image/:id
 * @method PUT
 * @Accsess Private (Only Owner Of The Post)
 */
module.exports.updateCourseImageCtrl=asyncHandler(async (req,res)=>{ 
    // 1- Vlaidation
    if(!req.file){
        return  res.status(400).json({message:"No Image Provided"});
    }
    // 2- Get The Course From The Db
 const course=await Course.findById(req.params.id);
 if(!course){
    return res.status(404).json({message:"Course Not Found"});
 }
 // 3- Check if Course Belong To Logged in User
 if(req.user.id !== course.user.toString()){
    return res.status(403).json({message:"Access Denied , You Are Not Allowed"});
 }
 //4- Delete The Old Image
  await cloudinaryRemoveImage(course.image.publicId);
 //5- Ulpload New Photo
 const result=await cloudinaryUploadImage(req.file.buffer);
 //6-update Image Field In The Db
 const updatedCourse=await Course.findByIdAndUpdate(req.params.id,{
    $set:{
        image:{
            url:result.secure_url,
            publicId:result.public_id,
        }
    }
 },{new:true});
 //7-send Response To Client 
 res.status(200).json(updatedCourse);
});
/**
 * @Desc Toggle Like on Course
 * @Route /api/courses/like/:id
 * @Method PUT
 * @Access Private (Only Logged-in User)
 */
module.exports.toggleLikeCourseCtrl = asyncHandler(async (req, res) => {
    const loggedInUserId = req.user.id;
    const { id: courseId } = req.params;

    // التحقق من وجود الكورس
    let course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ message: "Course Not Found" });
    }

    // التحقق مما إذا كان المستخدم قد أعجب بالكورس من قبل
    const isAlreadyLiked = course.likes.includes(loggedInUserId);

    if (isAlreadyLiked) {
        // إذا أعجب من قبل، قم بإلغاء الإعجاب
        course = await Course.findByIdAndUpdate(
            courseId,
            { $pull: { likes: loggedInUserId } },
            { new: true }
        );
    } else {
        // إذا لم يعجب من قبل، قم بالإضافة
        course = await Course.findByIdAndUpdate(
            courseId,
            { $push: { likes: loggedInUserId } },
            { new: true }
        );
    }

    res.status(200).json(course);
});

/**
 * @Desc Delete Course
 * @Route /api/courses/:id
 * @method DELETE
 * @Accsess Private (Only Admin Or Owner The Course)
 */
module.exports.deleteCourseCtrl = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course Not Found" });
    }
  
    // التأكد من صلاحية المستخدم (مدير أو صاحب الكورس)
    if (req.user.isAdmin || req.user.id == course.user.toString()) {
      
      // العثور على جميع الفيديوهات التابعة للكورس
      const videos = await Video.find({ course: course._id });
      const videoIds = videos?.map(video => video._id);
  
      // حذف جميع التعليقات على الفيديوهات
      await Comment.deleteMany({ video: { $in: videoIds } });
  
      // حذف صور الفيديوهات والفيديوهات نفسها من Cloudinary
      for (const video of videos) {
        // حذف الصورة الخاصة بالفيديو إن وُجدت
        if (video.image && video.image.publicId) {
          await cloudinaryRemoveImage(video.image.publicId);
        }
        // حذف الفيديو نفسه من Cloudinary
        if (video.publicId) {
          await cloudinaryRemoveVideo(video.publicId);
        }
      }
  
      // حذف جميع الفيديوهات من قاعدة البيانات
      await Video.deleteMany({ course: course._id });
  
      // حذف صورة الكورس من Cloudinary إن وُجدت
      if (course.image && course.image.publicId) {
        await cloudinaryRemoveImage(course.image.publicId);
      }
  
      // حذف الكورس نفسه من قاعدة البيانات
      await Course.findByIdAndDelete(req.params.id);
      
      res.status(200).json({ message: "Course has been deleted successfully", courseId: course._id });
    } else {
      res.status(403).json({ message: "Access Denied, Forbidden" });
    }
  });