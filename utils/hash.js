const bcrypt = require('bcrypt');


exports.hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
}

exports.hashIpAddress= async (ip) => {
    return await bcrypt.hash(ip, 10);
}

exports.comparePassword = async (plainPassword, hashedPassword ) =>  {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.compareIP = async (plainIP, hashedIP ) =>  {
    return await bcrypt.compare(plainIP, hashedIP);
}