const express=require("express");
const connectTodb=require("./config/connectionToDB");
const { errorHandler, notFound } = require("./middlewares/error");
const cors=require("cors");
const xss = require("xss-clean");
const rateLimiting = require("express-rate-limit");
const hpp = require("hpp");
const helmet = require ("helmet");
require("dotenv").config();

// Connection To Db
connectTodb();


// Init App
const app=express();

// Middelware
app.use(express.json());

// Security Headers (Helmet)
app.use(helmet());

// Prevent http Param Pollution
app.use(hpp());

// Prevent Xss (Cross Site Scripting) Attacks
app.use(xss());

// Rate Limiting
app.use(rateLimiting({
    windowMs: 10 * 60 * 1000 ,//10 Minutes
    max:200 
}))

// Cors Policy
app.use(cors({
  origin: "https://ziddni-front-end.vercel.app", // رابط الفرونت من Vercel
  credentials: true
}));

// Enable preflight (OPTIONS) requests
app.options('*', cors());

// Routes
// مسار للاختبار
app.get('/api/test', (req, res) => {
  res.send('✅ الباك إند يعمل على Vercel!');
});
app.use("/api/auth",require("./routes/authRoutes"));
app.use("/api/users",require("./routes/userRoute"));
app.use("/api/courses",require("./routes/courseRoute"));
app.use("/api/videos",require("./routes/videoRoute"));
app.use("/api/comments",require("./routes/commentRoute"));
app.use("/api/community", require("./routes/communityRoutes"));
app.use("/api/categories",require("./routes/categoryRoute"))
app.use("/api/specialization",require("./routes/specializationRoutes"));
app.use("/api/password",require("./routes/passwordRoute"));

// NOt Found Handler MiddleWare
app.use(notFound);
// Error Handler MiddleWare
app.use(errorHandler);

// Running The Server
const PORT=process.env.PORT || 8000
app.listen(PORT,()=>{
    console.log(`Server Is Running In ${process.env.NODE_ENV}  mode on Port ${PORT}`)
})