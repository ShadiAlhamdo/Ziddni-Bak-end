const asyncHandler = require("express-async-handler");
const {Category,validateCreateCategory,validateUpdateCategory} = require("../models/category")


/**
 * @Desc Create New Category
 * @Route /api/categories
 * @Method POST
 * @Access private (Only Admin)
 */
module.exports.createCategoryCtrl=asyncHandler (async(req,res)=>{
  
    const {error}=validateCreateCategory(req.body);
    if(error){
      return  res.status(400).json({message:error.details[0].message});
    }
    const existingcategory=await Category.findOne({title:req.body.title});
    if(existingcategory){
        res.status(400).json({message:"You´r Already Have Category The Same Name"})
    }
     else{
      const  category=await Category.create({
            title:req.body.title,
            user:req.user.id,
        });
        res.status(201).json({category});
     }
    
});
/**
 * @Desc Get All Categories
 * @Route /api/categories
 * @Method GET
 * @Access Public 
 */
module.exports.getAllCategoriesCtrl=asyncHandler (async(req,res)=>{
    const categories=await Category.find();
    return res.status(200).json(categories)
    
});
/**
 * @Desc Delete  Category
 * @Route /api/categories/:id
 * @Method DELETE
 * @Access Private (Only Admin) 
 */
module.exports.deleteCategoryCtrl=asyncHandler (async(req,res)=>{
    const category=await Category.findById(req.params.id);
    if(!category){
      return  res.status(404).json({message:"Category Not Found"})
    }
    await Category.findByIdAndDelete(req.params.id);
    return  res.status(200).json({message:"Category Has Been Deleted Successfully",categoryId:category._id})
    
});