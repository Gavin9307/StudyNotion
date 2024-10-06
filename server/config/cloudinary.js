require("dotenv").config();

const cloudinaryConnect = require("cloudinary").v2;

exports.cloudinary = () => {
    try {
        cloudinaryConnect.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }
    catch(error){
        console.log(error);
    }
}