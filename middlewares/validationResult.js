const { validationResult } = require('express-validator');

const handleValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map(err => err.msg).join(', ');
    return res.status(400).json({
    status: 400,
    message: errorMsg
    });
  }
  next();
};

module.exports = handleValidationResult;