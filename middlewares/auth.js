const jwt = require('../utils/jwt');
const { compareIP } = require('../utils/hash');
const usersSchema = require('../models/users.Schema');

const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: true, 
  sameSite: isProduction ? 'Lax' : 'Strict',
  path : '/'
};


const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;
    const userIP = req.headers['x-forwarded-for'] || req.ip || req.socket?.remoteAddress;

    // مفيش أي توكن → unauthorized
    if (!token && !refreshToken) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
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

      req.user = payload;
      return next();
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = isAuth;
