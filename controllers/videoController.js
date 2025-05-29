const asyncHandler = require("express-async-handler");
const { Video, ValidateCreateVideo } = require("../models/video");
const { Course } = require("../models/course");
const {  cloudinaryRemoveImage, cloudinaryUploadVideo, cloudinaryRemoveVideo, cloudinaryUploadImage } = require("../utils/cloudinary");

/**
 * @Desc Create New Video
 * @Route /api/videos/:id
 * @method POST
 * @Access Private (Only Course Owner)
 */
module.exports.createVideoCtrl = asyncHandler(async (req, res) => {
    const {id: courseId } = req.params;
     //  Vlaidation
     if(!req.file){
        return  res.status(400).json({message:"No Video Provided"});
    }
    // 1- التأكد من صحة بيانات الفيديو
    const { error } = ValidateCreateVideo(req.body);
    if (error) {
        
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2- التأكد من أن الدورة موجودة
    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ message: "Course Not Found" });
    }
    

    // 3- التأكد من أن المستخدم هو مالك الدورة
    if (req.user.id !== course.user.toString()) {
        return res.status(403).json({ message: "Access Denied, You Are Not Allowed" });
    }
     //  التأكد من عدم وجود فيديو بنفس العنوان داخل نفس الدورة
     const existingVideo = await Video.findOne({ title: req.body.title, course: courseId });
     if (existingVideo) {
         return res.status(400).json({ message: "A video with the same title already exists in this course." });
     }

    // 4- رفع الفيديو إلى Cloudinary
    const videoFile = req.file.buffer;
    const videoInfo = await cloudinaryUploadVideo(videoFile);

    // 5- إنشاء الفيديو وإضافته إلى الدورة
    const video = new Video({
        title: req.body.title,
        url: videoInfo.secure_url,
        publicId: videoInfo.public_id,
        course: courseId,
    });

    await video.save();

    // 6- إضافة الفيديو إلى مصفوفة `videos` في الدورة
    course.videos.push(video._id);
    await course.save();

    res.status(201).json({ message: "Video has been added successfully",videoid:video._id });
});
/**
 * @Desc Get All Videos (Admin Only)
 * @Route /api/videos
 * @method GET
 * @Access Private (Only Admin)
 */
module.exports.getAllVideosCtrl = asyncHandler(async (req, res) => {
    // جلب كل الفيديوهات مع اسم الكورس المرتبط بها
    const videos = await Video.find({})
        .select("title url publicId image createdAt")
        .populate({
            path: "course",
            select: "title", // فقط اسم الكورس
        });

    res.status(200).json(videos);
});

/**
 * @Desc Get ALl Videos for Specific Course
 * @Route /api/videos/course/courseId
 * @method GET
 * @Access Private (Only Logged In User)
 */
module.exports.getAllVideosInCourseCtrl = asyncHandler(async (req, res) => {
    const { id:courseId } = req.params;

    // التأكد من أن الدورة موجودة
    const course = await Course.findById(courseId).populate({
        path: "videos",
        select: "title url publicId image createdAt", // تحديد الحقول المطلوبة
    });

    if (!course) {
        return res.status(404).json({ message: "Course Not Found" });
    }

    // إرجاع قائمة الفيديوهات للـ Client
    res.status(200).json(course.videos);
});
/**
 * @Desc Get Single Video By ID
 * @Route /api/videos/:id
 * @method GET
 * @Access Private (Only Logged In User)
 */
module.exports.getSingleVideoCtrl = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // البحث عن الفيديو باستخدام الـ ID فقط
    const video = await Video.findById(id);
    
    if (!video) {
        return res.status(404).json({ message: "Video Not Found" });
    }

    res.status(200).json(video);
});

/**
 * @Desc Update Video File
 * @Route /api/videos/:id
 * @method PUT
 * @Access Private (Only Course Owner)
 */
module.exports.updateVideoCtrl = asyncHandler(async (req, res) => {
    const { id:videoId } = req.params;
    
     // 1- Vlaidation
     if(!req.file){
        return  res.status(400).json({message:"No Video File Provided"});
    }
    // 2- التأكد من أن الفيديو موجود
    let video = await Video.findById(videoId).populate("course");
    if (!video) {
        return res.status(404).json({ message: "Video Not Found" });
    }

    // 3- التأكد من أن المستخدم هو مالك الدورة
    if (req.user.id !== video.course.user.toString()) {
        return res.status(403).json({ message: "Access Denied, You Are Not Allowed" });
    }
    if(req.file){
            //  Delete The Old Video
            await cloudinaryRemoveVideo(video.publicId);
            //  Ulpload New Video
            const result=await cloudinaryUploadVideo(req.file.buffer);
            //6-update Video Field In The Db
            video=await Video.findByIdAndUpdate(req.params.id,{
            $set:{
            url:result.secure_url,
            publicId:result.public_id,
            }
            },{new:true});
    }

    // 4- تحديث البيانات
    video.title = req.body.title || video.title;
    await video.save();

    res.status(200).json({ message: "Video Updated Successfully", video });
});
/**
 * @Desc Update Video Image + Title
 * @Route /api/videos/upload-image/:id
 * @method PUT
 * @Accsess Private (Only Owner Of The Post)
 */
module.exports.updateVideoImageCtrl = asyncHandler(async (req, res) => {
    const { id: videoId } = req.params;

    // التحقق من صحة البيانات (العنوان فقط في حال تم إرساله)
    const { error } = ValidateCreateVideo(req.body);
    if (error && !req.file) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // الحصول على الفيديو من قاعدة البيانات
    const video = await Video.findById(videoId).populate("course");
    if (!video) {
        return res.status(404).json({ message: "Video Not Found" });
    }

    // التأكد من أن المستخدم هو صاحب الكورس
    if (req.user.id !== video.course.user.toString()) {
        return res.status(403).json({ message: "Access Denied, You Are Not Allowed" });
    }

    const updateData = {};

    // إذا تم رفع صورة جديدة
    if (req.file) {
        // حذف الصورة القديمة
        if (video.image.publicId) {
            await cloudinaryRemoveImage(video.image.publicId);
        }

        // رفع الصورة الجديدة
        const result = await cloudinaryUploadImage(req.file.buffer);

        // تحديث بيانات الصورة
        updateData.image = {
            url: result.secure_url,
            publicId: result.public_id,
        };
    }

    // إذا تم إرسال عنوان جديد
    if (req.body.title) {
        updateData.title = req.body.title;
    }

    // التحديث في قاعدة البيانات
    const updatedVideo = await Video.findByIdAndUpdate(videoId, {
        $set: updateData
    }, { new: true });

    res.status(200).json(updatedVideo);
});


/**
 * @Desc Delete Video
 * @Route /api/videos/:id
 * @method DELETE
 * @Access Private (Only Course Owner && Admin)
 */
module.exports.deleteVideoCtrl = asyncHandler(async (req, res) => {
    const { id:videoId } = req.params;
    
    // 1- التأكد من أن الفيديو موجود
    const video = await Video.findById(videoId).populate("course");
    if (!video) {
        return res.status(404).json({ message: "Video Not Found" });
    }

    // 2- التأكد من أن المستخدم هو مالك الدورة
    if (req.user.isAdmin || req.user.id === video.course.user.toString()) {
        // 3- حذف الفيديو من Cloudinary
    // حذف صورة الفيديو من Cloudinary إن وُجدت
    if (video.image && video.image.publicId) {
        await cloudinaryRemoveImage(video.image.publicId);
    }
    await cloudinaryRemoveVideo(video.publicId);

    // 4- إزالة الفيديو من قائمة `videos` الخاصة بالدورة
    await Course.findByIdAndUpdate(video.course._id, { $pull: { videos: video._id } });

    // 5- حذف الفيديو من قاعدة البيانات
    await Video.findByIdAndDelete(videoId);

    res.status(200).json({ message: "Video Deleted Successfully" ,videoId});
    }
    else{
         return res.status(403).json({ message: "Access Denied, You Are Not Allowed" });
    }
   
});

/**
 * @Desc Get Total Count of All Videos
 * @Route /api/videos/count
 * @method GET
 * @Access Private (Admin Only)
 */
module.exports.getVideosCountCtrl = asyncHandler(async (req, res) => {
    const count = await Video.countDocuments();
    res.status(200).json( count );
});