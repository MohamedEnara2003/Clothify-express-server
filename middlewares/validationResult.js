const {validationResult} = require('express-validator');

const handleValidationResult = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMsg = errors.array().map(obj => obj.msg).join(', ');
        const error = new Error();
        error.message = errorMsg;
        error.status = 400;
        return error;
    }
    return null;
};

module.exports = handleValidationResult;