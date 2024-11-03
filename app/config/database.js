const mongoose = require("mongoose");
const uri = process.env.DATABASE_URI;

module.exports = async()=>{
    try {
        await mongoose.connect(uri);
        console.log("Database is connected");
        return true;
    } catch (error) {
        throw error;
    }
}