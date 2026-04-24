// utils/ApiResponse.js
export const ApiResponse = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };