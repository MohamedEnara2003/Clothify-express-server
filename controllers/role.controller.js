const usersSchema = require('../models/users.Schema');
const rolesSchema = require('../models/roles.Schema');
const hash  = require('../utils/hash');




exports.getAllRoles = async (req, res, next) => {
try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const roles = await rolesSchema.find().skip(skip).limit(limit);

    if (!roles.length) {
    return res.status(200).json({ message: "No roles found" });
    }

    const total = await rolesSchema.countDocuments();

    const allRoles = roles.map((role) => {
        return {
            id: role._id,
            email: role.email,
            password : role.password,
            role: role.role,
            createdAt: role.createdAt
        };
    });

    res.status(200).json({
        data: { roles: allRoles, currentPage: +page, totalPages: Math.ceil(total / limit), total },
        message: "Fetched successfully",
    });
}
catch (err) {
next(err);
}
}

exports.createRole = async (req , res , next) => {
try {
    const {email, password , role} = req.body;

    if (!email || !password || !role) {
    return res.status(400).json({message: "All fields are required"});
    }
    
    const existingUser = await usersSchema.findOne({email} , 'role');
    const existingRole = await rolesSchema.findOne({email} , 'role');

    if (existingRole || existingUser) {
    return res.status(400).json({message: "Email already exists"});
    }

    // hash password & ip
    const hashedPassword = await hash.hashPassword(password);
    
    const roleData  = new rolesSchema({
    email,
    password: hashedPassword,
    role,
    });

    await roleData.save();

    res.status(201).json({
        message: "Created successfully",
        role: {
        id: roleData._id,
        email: roleData.email,
        role: roleData.role
        }
    });

} catch (err) {
    next(err);
}
}

exports.deleteRole = async (req, res, next) => {
    try {

    const roleIds = req.body;

    if (!Array.isArray(roleIds) || roleIds.length === 0) {
    return res.status(400).json({ message: "Role IDs are required" });
    }

    const roles = await rolesSchema.find({ _id: { $in: roleIds } });

    if (roles.length === 0) {
        return res.status(400).json({ message: "No roles found to delete" });
    }

    await rolesSchema.deleteMany({ _id: { $in: roleIds } });

    res.status(200).json({ message: "Roles deleted successfully" });
    } catch (err) {
    next(err);
    }
  };
  



