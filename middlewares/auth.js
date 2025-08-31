
const jwt = require('../utils/jwt');
const {compareIP} = require('../utils/hash');
const usersSchema = require('../models/users.Schema');

const isAuth = async  (req , res , next) => {
    try {
        const token = req.cookies.token ;
        const refreshToken = req.cookies.refreshToken;
        const userIP = req.ip || req.connection.remoteAddress;

        
    if (!token && !refreshToken) {
        return res.status(401).json({message: "Unauthorized: No token provided"});
    }
        

    if (!token && refreshToken) {
    const decodedRefresh = jwt.verifyRefreshToken(refreshToken);

    const payload = {
        id: decodedRefresh.id, 
        role: decodedRefresh.role, 
        email: decodedRefresh.email, 
        fullName: decodedRefresh.fullName,
    };

    const user = await usersSchema.findById(payload.id);

    if (!user || user.refreshToken !== refreshToken) {
    return res.status(401).json({ message: "Invalid refresh token" });
    }

    const isIPValid = await compareIP(userIP, user.ip);
    if (!isIPValid) {
    return res.status(401).json({ message: "Unauthorized IP address" });
    }

    const accessToken = await jwt.createAccessToken(payload);

    res.cookie('token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 15 * 60 * 1000
    });

    req.user = decodedRefresh;
    return next();
}

    const decoded = jwt.verifyAccessToken(token);
    req.user = decoded;
    next();
    } catch (error) {
    console.log(error);
    next(error)
    }

}

module.exports = isAuth ;

