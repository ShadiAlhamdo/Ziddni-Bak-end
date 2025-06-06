const express=require("express");
const {  sendResetPasswordLinkCtrl, getResetPasswordLinkCtrl, resetPasswordCtrl } = require("../controllers/passwordController");
const router= express.Router();


// /api/password/reset-password-link
router.post("/reset-password-link",sendResetPasswordLinkCtrl);

// /api/password/reset-password/:userId/:token
router.route("/reset-password/:userId/:token")
        .get(getResetPasswordLinkCtrl)
        .post(resetPasswordCtrl);










module.exports=router