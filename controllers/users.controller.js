const usersSchema = require('../models/users.Schema');
const rolesSchema = require('../models/roles.Schema');
const jwt = require('../utils/jwt');
const hash  =  require('../utils/hash');


exports.getAllUsers= async (req , res , next) => {
    try {

    const page = parseInt(req.query.page) || 1;
    const limit =  parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const users = await usersSchema.find().skip(skip).limit(limit);

    if(!users.length === 0) return res.status(404).json({message: "Not user found"});

    total = await usersSchema.countDocuments();

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
    data : {users : allUsers ,currentPage : +page , totalPages: Math.ceil(total / limit) , total},
    message: "Fetched successfully",
    });
    }catch (err) {
    next(err);
    }
}

exports.getUserProfile= async (req , res , next) => {
    try {
    
    const user = await usersSchema.findById({_id: req.user.id}, '-password -refreshToken -ip');

    if(!user) {
    return res.status(200).json({message: "User not found"});
    }

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
    const ipAddress = req.ip  || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const {fullName , email, password} = req.body;

    if (!fullName || !email || !password) {
    return res.status(400).json({message: "All fields are required"});
    }
 
    // hash password & ip
    const hashedPassword = await hash.hashPassword(password);
    const hashedIpAddress = await hash.hashIpAddress(ipAddress);


    let userRole = "User";

    const isSuperAdmin = password === process.env.SUPER_ADMIN_PASSWORD;
    if (isSuperAdmin) {
      userRole = "SuperAdmin";
    } else {
      const existingRole = await rolesSchema.findOne({email});
      if (existingRole) {
        const isMatch = await hash.comparePassword(password, existingRole.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Password is incorrect for assigned role" });
        }
        await rolesSchema.findByIdAndDelete({_id : existingRole._id})
        userRole = existingRole.role;
      }
    }
    const user = new usersSchema({
    fullName,
    email,
    password: hashedPassword,
    ip: hashedIpAddress,
    role: userRole,
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
    next(err);
  }
}

exports.login = async(req , res , next) => {
    try{
  
    const {email , password} = req.body;
    const user = await usersSchema.findOne({email});
    
    if(!user) res.status(404).json({ message: "Invalid Email"});
  
    const isMatch = await hash.comparePassword(password , user.password);

    if(!isMatch) res.status(401).json({ message: "Invalid password"});
    
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

  res.status(200).json({message: "User logged out successfully"});
  }catch(err){
    console.log(err);
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
  const userIds = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: "Users IDs are required" });
  }

  const users = await usersSchema.find({ _id: { $in: userIds } }, 'role');
  
  if (users.length === 0)  {
  return res.status(400).json({ message: "User not found" });
  }

  const isSuperAdmin = users.some(({role}) => role === req.user.role)
  
  if (isSuperAdmin)  {
  return res.status(400).json({ message: "A Super Admin is not allowed to delete another Super Admin." });
  }
  
  await usersSchema.deleteMany({ _id: { $in: userIds } });
  res.status(200).json({message: "User deleted successfully" });
  }
  catch (err) {
    next(err);
  }
}



