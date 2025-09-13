const jwt = require('../utils/jwt');
const { compareIP } = require('../utils/hash');
const usersSchema = require('../models/users.Schema');

const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,      
  sameSite: isProduction ?  'None'  : 'Lax',             
  path: '/',                 
};

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;
    const userIP = req.headers['x-forwarded-for'] || req.ip || req.socket?.remoteAddress;
    
    // مفيش أي توكن → unauthorized
    if (!token && !refreshToken) {
      return res.status(401).json({data : {token , refreshToken} , message: "Unauthorized: No token provided" });
    }

    // Access token صالح
    try {
      const decoded = jwt.verifyAccessToken(token);
      req.user = decoded;
      return next();
    } catch (err) {
      // Access token انتهت → نجددها
      if (!refreshToken) {
        res.clearCookie('token', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);
        return res.status(401).json({ message: "Access token expired" });
      }

      let decodedRefresh;
      try {
        decodedRefresh = jwt.verifyRefreshToken(refreshToken);
      } catch (err) {
        // Refresh token غير صالح → logout
        res.clearCookie('token', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const user = await usersSchema.findById(decodedRefresh.id);
      if (!user || user.refreshToken !== refreshToken) {
        res.clearCookie('token', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const isIPValid = isProduction ? true : await compareIP(userIP, user.ip);
      if (!isIPValid) {
        return res.status(401).json({ message: "Unauthorized IP address" });
      }

      // إنشاء access token جديد
      const payload = {
        id: decodedRefresh.id,
        fullName: decodedRefresh.fullName,
        email: decodedRefresh.email,
        role: decodedRefresh.role,
      };
      const newAccessToken = jwt.createAccessToken(payload);
      res.cookie('token', newAccessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });

      // إنشاء refresh token جديد
      const newRefreshToken = jwt.createRefreshToken(payload);
      res.cookie('refreshToken', newRefreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      await usersSchema.findByIdAndUpdate(user.id, { refreshToken: newRefreshToken });

      req.user = payload;
      return next();
    }
  } catch (err) {
    next(err);
  }
};

module.exports = isAuth;
