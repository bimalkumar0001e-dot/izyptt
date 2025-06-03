exports.successResponse = (res, message, data = {}) => {
  return res.status(200).json({
    success: true,
    message,
    data
  });
};

exports.errorResponse = (res, message, status = 400, data = {}) => {
  return res.status(status).json({
    success: false,
    message,
    data
  });
};