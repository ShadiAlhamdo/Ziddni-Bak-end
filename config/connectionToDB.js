const mongoose=require('mongoose');

module.exports=async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_CLOUD_URI);
        console.log("Connected To MongoDB 0_0")
    } catch (error) {
        console.log("Connection Faild To MongoDB",error);
    }
}