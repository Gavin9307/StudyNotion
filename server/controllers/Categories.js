const Category = require("../models/Category");

exports.createCategory = async (req,res) => {
    try {
        const {name,description} = req.body;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        const findCategory = await Category.findOne({name:name});
        if(findCategory){
            return res.status(403).json({
                success:false,
                message:"Category already exists"
            })
        }

        const categoryDetails = await Category.create({
            name:name,
            description:description,
        })
        console.log(categoryDetails);

        return res.status(200).json({
            success:true,
            message:"category Created Successfully"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Couldnt create category",
            errorMessage:error.message
        })
    }
};

exports.showAllCategories = async (req,res) => {
    try {
        const categories = await Category.find({},{name:true,description:true});
        return res.status(200).json({
            categories:categories,
            success:true,
            message:"categories fetched successfully"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Couldnt fetch all categories",
            errorMessage:error.message
        })
    }
};