const jwt = require('jsonwebtoken');


exports.createAccessToken  = (user) => {
    const accessToken = jwt.sign(user,process.env.JWT_SECRET,{expiresIn: "15m" });
    return accessToken
}

exports.createRefreshToken  = (user) => {
    const refreshToken = jwt.sign(user,process.env.REFRESH_SECRET,{expiresIn: "7d" });
    return refreshToken
}

exports.verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}
exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.REFRESH_SECRET);
}