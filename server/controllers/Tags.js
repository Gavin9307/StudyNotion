const Tag = require("../models/Tag");

exports.createTag = async (req,res) => {
    try {
        const {name,description} = req.body;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        const findTag = await Tag.findOne({name:name});
        if(findTag){
            return res.status(403).json({
                success:false,
                message:"Tag already exists"
            })
        }

        const tagDetails = await Tag.create({
            name:name,
            description:description,
        })
        console.log(tagDetails);

        return res.status(200).json({
            success:true,
            message:"Tag Created Successfully"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Couldnt create tag",
            errorMessage:error.message
        })
    }
};

exports.showAllTags = async (req,res) => {
    try {
        const tags = await Tag.find({},{name:true,description:true});
        return res.status(200).json({
            tags:tags,
            success:true,
            message:"tags fetched successfully"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Couldnt fetch all tags",
            errorMessage:error.message
        })
    }
};