const {Specialization, validateAddSpecialization} = require("../models/specialization");
const asyncHandler=require("express-async-handler");
const { handleImageUpload } = require("../utils/cloudinary");
const { User } = require("../models/user");

/**
 * @Desc Gat All The specializations
 * @Route /api/specialization/
 * @Method GET
 * @Accsess public
 */
module.exports.getSpecializationsCtrl = asyncHandler(async (req, res) => {
    const specializations = await Specialization.find();
    res.status(200).json(specializations);

});


/**
 * @Desc Gat Top Specializations With Most Teachers
 * @Route /api/specialization/
 * @Method GET
 * @Accsess public
 */
module.exports.getTopSpecializationsWithMostTeachers = asyncHandler(async (req, res) => {
    const result = await User.aggregate([
        {
            $match: { role: "teacher", specialization: { $ne: null } }
        },
        {
            $group: {
                _id: "$specialization",
                numberOfTeachers: { $sum: 1 }
            }
        },
        {
            $sort: { numberOfTeachers: -1 }
        },
        {
            $limit: 4
        },
        {
            $lookup: {
                from: "specializations", // اسم التجميعة كما هي في MongoDB
                localField: "_id",
                foreignField: "_id",
                as: "specialization"
            }
        },
        {
            $unwind: "$specialization"
        },
        {
            $project: {
                _id: 0,
                specializationId: "$specialization._id",
                specializationName: "$specialization.specializationName",
                specializationPhoto: "$specialization.specializationPhoto",
                numberOfTeachers: 1
            }
        }
    ]);

    res.status(200).json(result);
});


/**
 * @Desc Gat The specialization By Id
 * @Route /api/specialization/:id
 * @Method GET
 * @Accsess Only Users Has Login
 */
module.exports.getSpecializationByIdCtrl = asyncHandler(async (req, res) => {
    const specialization = await Specialization.findById(req.params.id);
    if(specialization)
    {
      return  res.status(200).json(specialization);
    }
    else
    {
      return res.status(404).json({message:"Specialization is Not Found"});
    }

});

/**
 * @Desc Add New specialization
 * @Route /api/specialization
 * @Method Post
 * @Access Private (Only Admin)
 */
module.exports. AddNewSpecialization = asyncHandler(async (req,res)=>{
    const {error}=validateAddSpecialization(req.body);
    if(error)
    {
        return   res.status(400).json({message:error.details[1].message});
    }
    let specialization=await Specialization.findOne({specializationName:req.body.specializationName});
    if(specialization){
        return res.status(400).json({message:"This specialization is Already Exist"})
    }
    specialization=new Specialization({
        specializationName:req.body.specializationName,
    });
    await specialization.save()
    res.status(201).json({message:"Specialization Ctreated Successfully"})
});

/**
 * @desc Update Specialization Photo & Title
 * @route /api/specialization/:id
 * @method PUT
 * @access Private (Only Admin)
 */
module.exports.updateSpecializationPhotoAndTitle = asyncHandler(async (req, res) => {
    const { specializationName } = req.body;

    // التحقق من وجود الملف
    if (!req.file && !specializationName) {
        return res.status(400).json({ message: "No data provided to update" });
    }

    // العثور على التخصص في قاعدة البيانات
    const specialization = await Specialization.findById(req.params.id);
    if (!specialization) {
        return res.status(404).json({ message: "Specialization not found" });
    }

    // تحديث الاسم إن وجد
    if (specializationName) {
        specialization.specializationName = specializationName;
    }

    // تحديث الصورة إن وجدت
    if (req.file) {
        const fileBuffer = req.file.buffer;
        const imageInfo = await handleImageUpload(fileBuffer);

        // حذف الصورة القديمة إن وُجدت
        if (specialization.specializationPhoto.publicId) {
            await cloudinaryRemoveImage(specialization.specializationPhoto.publicId);
        }

        // تحديث بيانات الصورة
        specialization.specializationPhoto = {
            url: imageInfo.secure_url,
            publicId: imageInfo.public_id,
        };
    }

    // حفظ التعديلات
    await specialization.save();

    res.status(200).json({
        message: "Specialization updated successfully",
        specialization,
    });
});



/**
 * @Desc Delete Specialization 
 * @Route /api/specialization/:id
 * @method DELETE
 * @Access Private (Only Admin)
 */
module.exports.deleteSpecializationCtrl = async (req, res) => {
    const specialization= await Specialization.findById(req.params.id);
    if(specialization)
    {   
        await Specialization.findByIdAndDelete(req.params.id);

        return res.status(200).json({message:"Specialization Is Deleted",specializationId:specialization._id});
    }
    else
    {
      return  res.status(404).json({message:"Specialization is Not Found"});
    }
};