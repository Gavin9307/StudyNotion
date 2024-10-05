const mongoose = require("mongoose");
require("dotenv").config();

async function connect(){
    try {
        mongoose.connect(process.env.MONGODB_URL)  
        .then(console.log("DB Connection Successful"));
    }
    catch(error) {
        console.log("DB Connection Failed")
        console.error(error);
        process.exit(1);
    }
}

module.exports = connect;
