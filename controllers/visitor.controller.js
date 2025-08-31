const visitorsSchema = require('../models/visitors.Schema');


const getVisitors = async (req , res ,next) => {
try {
    const visitorsCount =  await visitorsSchema.countDocuments();
    res.status(200).json({ data: visitorsCount , message: "Fetched successfully"});
} catch (error) {
    next(error)
}
}

const createVisitor = async (req , res ,next) => {
try {
    const ip = req.ip  || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    const existingVisitorsIp =  await visitorsSchema.findOne({ip})

    if(existingVisitorsIp){
    return  res.status(200).json({message : 'Visitor already recorded!'})
    }

    const visitors = new visitorsSchema({ip})
    await visitors.save()
    res.status(201).json({data : visitors ,  message : 'Created succeessfuly'})
} 
catch (error) {
next(error)
}
}

module.exports = {
getVisitors,
createVisitor
}