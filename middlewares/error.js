// Not Found Middleware
const notFound = (req, res, next)=>{
    const error= new Error(`not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}

// Error Handler Moíddleware
const errorHandler= (err, req, res, next)=>{
    const statusCode= res.statusCode === 200 ? 500 :res.statusCode;
    res.status(statusCode).json({
        message:err.message,
        stack:process.env.NODE_ENV === "Production" ?null: err.stack,
    })
};

module.exports={
    errorHandler,
    notFound
};