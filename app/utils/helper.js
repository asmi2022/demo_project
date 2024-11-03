const bcrypt = require("bcrypt");

exports.generateHash = async(password)=>{
    try {
        return await bcrypt.hashSync(password, 9);
    } catch (error) {
        throw error;
    }
}

exports.comparePassword = async(password, storedPassword)=>{
    try {
        return await bcrypt.compareSync(password, storedPassword);
    } catch (error) {
        throw error;
    }
}