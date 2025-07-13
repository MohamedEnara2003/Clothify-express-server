const usersSchema = require('../models/users.Schema')
const validationResult = require('../middlewares/validationResult')
const jwt = require('../utils/jwt');
const hash  =  require('../utils/hash');




exports.getAllUsers= async (req , res , next) => {
    try {
    const users = await usersSchema.find();

    if(!users.length === 0) res.status(404).json({message: "Not user found"});

    const allUsers = users.map((user) => {
    return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    isActive: user.refreshToken ? true : false
    };
    })

    res.status(200).json({  
        message: "Fetched successfully",
        users : allUsers
    });
    }catch (err) {
    next(err);
    }
}

exports.getUserProfile= async (req , res , next) => {
    try {
    const user = await usersSchema.findById(req.user.id);

    if(!user) res.status(404).json({message: "Not user found"});

    const userData =  {id: user.id, fullName: user.fullName, email: user.email, role: user.role};

    res.status(200).json({
    message: "User profile successfully",
    user : userData ,
    });

    }catch (err) {
    next(err);
    }
}

exports.register = async (req , res , next) => {
  try {
    const errors = validationResult(req);
    if (errors) throw errors;

    const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress;

    const { fullName, email, password } = req.body;

    // hash password & ip
    const hashedPassword = await hash.hashPassword(password);
    const hashedIpAddress = await hash.hashIpAddress(ipAddress);

    const isAdmin = password === process.env.ADMIN_PASSWORD;

    const user = new usersSchema({
    fullName,
    email,
    password: hashedPassword,
    ip: hashedIpAddress,
    role: isAdmin ? 'Admin' : 'User',
    });

    const userData = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    ip: user.ip,
    };

    const accessToken = jwt.createAccessToken(userData);
    const refreshToken = jwt.createRefreshToken(userData);

    
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('token', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 15 * 60 * 1000, 
    });

    res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(201).json({
      message: 'User registered successfully',
      token: accessToken,
      user: userData,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

exports.login = async(req , res , next) => {
    try{
    
    const errors = validationResult(req);
    if(errors) throw errors;

    const {email , password} = req.body;
    const user = await usersSchema.findOne({email});
    
    if(!user){
    return res.status(404).json({ message: "Invalid Email"});
    }

    const isMatch = await hash.comparePassword(password , user.password);

    if(!isMatch){
    return res.status(401).json({ message: "Invalid password"});
    }

    const userData =  {id: user.id, fullName: user.fullName, email: user.email, role: user.role , ip: user.ip};

    const accessToken =  await jwt.createAccessToken(userData);
    const refreshToken = await jwt.createRefreshToken(userData);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('token' , accessToken , {
    httpOnly : true,
    secure : true,
    sameSite: 'Strict', 
    maxAge: 15 * 60 * 1000  
    })

    res.cookie('refreshToken' , refreshToken , {
    httpOnly : true,
    secure : true,
    sameSite: 'Strict', 
    maxAge: 7 * 24 * 60 * 60 * 1000  
    })
    
    res.status(200).json({
    message: "User login successfully",
    token : accessToken,
    user: userData
    });

    }
    catch(err) {
    next(err)
    }
};

exports.logout = async(req , res , next) => {
  try{
    
    const user = await usersSchema.findById(req.user.id);
    if(!user) return res.status(404).json({message: "User not found"});
    user.refreshToken = null;
    await user.save();

  res.clearCookie('token');
  res.clearCookie('refreshToken');

  res.status(200).json({message: "User logged out successfully"});
  }catch(err){
    console.log(err);
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
  const {userId} = req.params;

  const user = await usersSchema.findById(userId);
  
  if (!user)  res.status(404).json({ message: "User not found" });
  if (user.role === 'Admin')  res.status(403).json({ message: "Cannot delete an admin user" });
  
  await usersSchema.findByIdAndDelete(userId);
  res.status(200).json({message: "User deleted successfully" });
  }
  catch (err) {
    next(err);
  }
}



