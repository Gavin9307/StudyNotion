const Course = require("../models/Course");
const Tag = require("../models/Tag");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createCourse = async (req, res) => {
  try {
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;
    const thumbnail = req.files.thumbnailImage;

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor Details = ", instructorDetails);

    if (!instructorDetails) {
      return res.status(400).json({
        success: false,
        message: "Instructor Details not found",
      });
    }

    const tagDetails = await User.findById(tag);
    console.log("Instructor Details = ", tagDetails);

    if (!tagDetails) {
      return res.status(400).json({
        success: false,
        message: "Tag Details not found",
      });
    }

    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      Instructor: instructorDetails._id,
      tag: tagDetails._id,
      price,
      whatYouWillLearn,
      thumbnail: thumbnailImage.secure_url,
    });

    // Add new course to instructor document
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    await Tag.findByIdAndUpdate(
      { _id: Tag._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Course Created Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Couldnt create course",
      errorMessage: error.message,
    });
  }
};

exports.showAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate("instructor");
    return res.status(200).json({
      courses: courses,
      success: true,
      message: "Courses fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Couldnt fetch all Courses",
      errorMessage: error.message,
    });
  }
};
