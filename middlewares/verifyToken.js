const jwt=require("jsonwebtoken");

// Verify Token
 function verifyToken(req,res,next){
    const authToken=req.headers.authorization;
    if(authToken){
        const token=authToken.split(" ")[1];
        try {
            const decodedPayload=jwt.verify(token,process.env.SECRET_KEY);
            req.user=decodedPayload;
            next();

        } catch (error) {
            return res.status(401).json({message:"Invaled Token , Access Denid"})
        }
    }else{
        return res.status(401).json({message:"No Token Provided , Access Denid"})
    }
 };

// Verify Token & Admin
 function verifyTokenAndAdmin(req,res,next){
   verifyToken(req,res,()=>{
    if(req.user.isAdmin){
        next();
    }
    else{
        return res.status(403).json({message:"Not Allow Only Admin"});
    }
   })
 };

// Verify Token & Teacher
 function verifyTokenAndTeacher(req,res,next){
    verifyToken(req,res,()=>{
     if(req.user.role === "teacher"){
         next();
     }
     else{
         return res.status(403).json({message:"Not Allow Only Teacher"});
     }
    })
  };
// Verify Token & Student
function verifyTokenAndStudent(req,res,next){
verifyToken(req,res,()=>{
    if(req.user.role === "student"){
        next();
    }
    else{
        return res.status(403).json({message:"Not Allow Only Student"});
    }
})
};

// Verify Token & Only User Himself
 function verifyTokenAndOnlyUser(req,res,next){
    verifyToken(req,res,()=>{
     if(req.user.id == req.params.id){
         next();
     }
     else{
         return res.status(403).json({message:"Not Allow Only User Himself"});
     }
    });
  };
// Verify Token & Authorization
function verifyTokenAndAuthorization(req,res,next){
    verifyToken(req,res,()=>{
     if(req.user.id == req.params.id || req.user.isAdmin ){
         next();
     }
     else{
         return res.status(403).json({message:"Not Allow Only User Himself,Or Admin"});
     }
    });
  };



 module.exports={
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndOnlyUser,
    verifyTokenAndTeacher,
    verifyTokenAndStudent,
    verifyTokenAndAuthorization,
 }