const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const uploadImageToCoudinary = require("../utils/imageUploader");
require("dotenv").config();

const createSubSection = async (req, res) => {
  try {
    const { timeDuration, description, title, sectionId } = req.body;
    const video = req.files.videoFile;

    if (!timeDuration || !description || !title || !sectionId || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const uploadDetails = await uploadImageToCoudinary(
      video,
      process.env.FOLDER_NAME
    );

    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: {
          subSection: subSectionDetails._id,
        },
      },
      { new: true }
    ).populate("subSection");

    return res.status(200).json({
      success: true,
      updatedSection,
      message: "Sub Section Created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldnt create sub section",
      errorMessage: error.message,
    });
  }
};
