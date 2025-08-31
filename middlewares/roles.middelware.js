



const isModerator = (req , res , next) => {
    if(req.user.role !== "Moderator"){
    return res.status(403).json({error : "Access denied: moderator only"})
    }
    next()
}

const isAdmin = (req , res , next) => {
    if(req.user.role !== "Admin"){
    return res.status(403).json({error : "Access denied: admin only"})
    }
    next()
}
const isSuperAdmin = (req , res , next) => {
    console.log(req.user);
    
    if(req.user.role !== "SuperAdmin"){
    return res.status(403).json({error : "Access denied: superAdmin only"})
    }
    next()
}

const isAdminAndSuperAdmin = (req, res, next) => {
    if (req.user.role !== "SuperAdmin" && req.user.role !== "Admin") {
    return res.status(403).json({ error: "Access denied: superAdmin or admin only" });
    }
    next();
}

const isFullyAuthorized = (req, res, next) => {
    if (req.user.role !== "SuperAdmin" && req.user.role !== "Admin" && req.user.role !== "Moderator") {
    return res.status(403).json({ error: "Access denied: superAdmin, admin or moderator only" });
    }
    next();
}

module.exports = {
    isModerator,
    isAdmin ,
    isSuperAdmin,
    isAdminAndSuperAdmin,
    isFullyAuthorized
} ;