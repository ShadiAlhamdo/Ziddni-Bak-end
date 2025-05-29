const asyncHandler = require("express-async-handler");
const { Course } = require("../models/course");

/**
 * @Desc Toggle Subscribe to Course
 * @Route /api/courses/subscribe/:id
 * @Method PUT
 * @Access Private
 */
exports.toggleSubscribeCourseCtrl = asyncHandler(async (req, res) => {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    const isSubscribed = course.subscribers.includes(req.user.id);

    if (isSubscribed) {
        // إلغاء الاشتراك
        course.subscribers.pull(req.user.id);
        await course.save();

    res.status(200).json({message:"Cansel Subscribe 0_0",course});
    } else {
        // الاشتراك
        course.subscribers.push(req.user.id);
        await course.save();

    res.status(200).json({message:"Subscribe Successfully",course});
    }

    
});



/**
 * @Desc Toggle Favorite Course
 * @Route /api/courses/favorite/:id
 * @Method PUT
 * @Access Private
 */
exports.toggleFavoriteCourseCtrl = asyncHandler(async (req, res) => {
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    const isFavorited = course.favorites.includes(req.user.id);

    if (isFavorited) {
        // إزالة من المفضلة
        course.favorites.pull(req.user.id);
        await course.save();

    res.status(200).json({course , message :"Delete From Favorite Successfully"});
        
    } else {
        // إضافة إلى المفضلة
        course.favorites.push(req.user.id);
         await course.save();

    res.status(200).json({course , message :"Add To Favorite Successfully"});
    }

   
});





/**
 * @Desc Get All Courses Subscribed by a Specific User
 * @Route  /api/courses/my-subscribed/:id
 * @Method GET
 * @Access Public or Private (حسب رغبتك)
 */
exports.getUserSubscribedCoursesCtrl = asyncHandler(async (req, res) => {
    const { id } = req.user; // أخذ ID من الرابط
    const courses = await Course.find({ subscribers: id });
    res.status(200).json({ courses });
});

/**
 * @Desc Get All Courses Favorited by a Specific User
 * @Route  /api/courses/my-favorites/:id
 * @Method GET
 * @Access Public or Private (حسب رغبتك)
 */
exports.getUserFavoriteCoursesCtrl = asyncHandler(async (req, res) => {
    const { id } = req.user; // أخذ ID من الرابط
    const courses = await Course.find({ favorites: id });
    res.status(200).json({ courses });
});

