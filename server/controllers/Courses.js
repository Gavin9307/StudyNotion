const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createCourse = async (req, res) => {
  try {
    const { courseName, courseDescription, whatYouWillLearn, price, category } =
      req.body;
    const thumbnail = req.files.thumbnailImage;

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category ||
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

    const categoryDetails = await User.findById(category);
    console.log("Instructor Details = ", categoryDetails);

    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message: "Category Details not found",
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
      category: categoryDetails._id,
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

    await Category.findByIdAndUpdate(
      { _id: Category._id },
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
