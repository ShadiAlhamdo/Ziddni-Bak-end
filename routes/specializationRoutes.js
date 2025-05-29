const express = require("express");
const {   AddNewSpecialization, deleteSpecializationCtrl, getSpecializationsCtrl, getSpecializationByIdCtrl, updateSpecializationPhotoAndTitle, getTopSpecializationsWithMostTeachers } = require("../controllers/specializationController");
const { verifyTokenAndAdmin, verifyToken }=require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");
const { photoUpload } = require("../middlewares/photoUpload");
const router = express.Router();

// /api/specialization
router.post("/",verifyTokenAndAdmin, AddNewSpecialization); // إضافة تخصص (Admin Only)
router.get("/", getSpecializationsCtrl); // جلب جميع التخصصات

// /api/specialization/top-specializations
router.get('/top-specializations', getTopSpecializationsWithMostTeachers);

// /api/specialization/:id
router.get("/:id",validateObjectId,verifyToken,getSpecializationByIdCtrl);
router.delete("/:id",validateObjectId, verifyTokenAndAdmin,deleteSpecializationCtrl); // حذف تخصص (Admin Only)

router.put(
    "/:id",
    validateObjectId,
    verifyTokenAndAdmin,
    photoUpload.single("image"), // multer middleware لتحميل صورة واحدة، اسم الحقل "photo"
    updateSpecializationPhotoAndTitle
  );


module.exports = router;