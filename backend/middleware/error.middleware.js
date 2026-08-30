function errorHandler(err, req, res, next) {
    console.error('Central Error Handler:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error occurred';

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
}

module.exports = errorHandler;
