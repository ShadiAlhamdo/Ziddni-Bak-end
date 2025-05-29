const cloudinary = require('cloudinary').v2;
const stream = require('stream');

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Upload Image
const cloudinaryUploadImage = async (fileBuffer) => {
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB

    if (fileBuffer.length > maxSizeInBytes) {
        throw new Error("Image size exceeds 2MB limit");
    }

    return new Promise((resolve, reject) => {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileBuffer);

        bufferStream.pipe(cloudinary.uploader.upload_stream({
            resource_type: "image"
        }, (error, result) => {
            if (error) {
                return reject(new Error("Internal Server Error (Cloudinary)"));
            }
            resolve(result);
        }));
    });
};

// Cloudinary Remove Image
const cloudinaryRemoveImage = async (ImagePublicId)=>{
    try {
        const result = await cloudinary.uploader.destroy(ImagePublicId);

        return result
    } catch (error) {
       throw new Error("Intenal Server Error (Cloudinary)") 
     }
};

// Cloudinary Upload Video
const cloudinaryUploadVideo = async (fileBuffer) => {
    const maxSizeInBytes = 1024 * 1024 * 1024; // 1GB

    if (fileBuffer.length > maxSizeInBytes) {
        throw new Error("Video size exceeds 1GB limit");
    }

    return new Promise((resolve, reject) => {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileBuffer);

        bufferStream.pipe(cloudinary.uploader.upload_stream({
            resource_type: "video"
        }, (error, result) => {
            if (error) {
                return reject(new Error("Internal Server Error (Cloudinary)"));
            }
            resolve(result);
        }));
    });
};

// Cloudinary Remove Video
const cloudinaryRemoveVideo = async (videoPublicId) => {
    try {
        const result = await cloudinary.uploader.destroy(videoPublicId, { resource_type: "video" });
        return result;
    } catch (error) {
        throw new Error("Intenal Server Error (Cloudinary)") 
    }
};

//  استخدام الدالة لرفع الصور
const handleImageUpload = async (fileBuffer) => {
    try {
        const result = await cloudinaryUploadImage(fileBuffer);
        return result; // يمكنك إرجاع النتيجة هنا
    } catch (error) {
        throw new Error("Intenal Server Error (Cloudinary)") 
       // يمكنك إلقاء الخطأ هنا
    }
};
// استخدام الدالة لرفع الفيديوهات
const handleVideoUpload = async (fileBuffer) => {
    try {
        const result = await cloudinaryUploadVideo(fileBuffer);
        return result;
    } catch (error) {
        throw new Error("Intenal Server Error (Cloudinary)") 
    }
};



module.exports = {
    cloudinaryUploadImage,
    cloudinaryRemoveImage,
    cloudinaryUploadVideo,
    cloudinaryRemoveVideo,
    handleImageUpload,
    handleVideoUpload,
};