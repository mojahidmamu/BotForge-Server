const mongoose = require('mongoose');

const connectDB = async () => {
    // console.log(process.env.MONGODB_URI);  // 

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    // console.log("Host:", conn.connection.host);
    // console.log("Database:", conn.connection.name);
    // console.log("Collections:", await conn.connection.db.listCollections().toArray());
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;