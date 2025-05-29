const express = require("express");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const { createCategoryCtrl, getAllCategoriesCtrl, deleteCategoryCtrl } = require("../controllers/categoriesController");
const validateObjectId = require("../middlewares/validateObjectId");
const router= express.Router();

// /api/categories
router.route("/")
      .post(verifyTokenAndAdmin,createCategoryCtrl)
      .get(getAllCategoriesCtrl)


// /api/categories/:id
router.route("/:id")
      .delete(validateObjectId,verifyTokenAndAdmin,deleteCategoryCtrl)


module.exports= router