const Course = require("../models/Course");
const Section = require("../models/Section");

exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newSection = await Section.create({
      sectionName: sectionName,
    });

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    ).populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    });
    return res.status(200).json({
      success: true,
      updatedCourse: updatedCourse,
      message: "Section Created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldnt create section",
      errorMessage: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId } = req.body;
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const section = await Section.findByIdAndUpdate(
      sectionId,
      {
        sectionName,
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      updatedSection: section,
      message: "Section Updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldnt update section",
      errorMessage: error.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const sectionId = req.body.sectionId;
    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const course = await Course.findOne({ courseContent: sectionId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found while deleting section",
      });
    }

    await Course.findByIdAndUpdate(course._id, {
      $pull: { courseContent: sectionId },
    });

    await Section.findByIdAndDelete(sectionId);

    return res.status(200).json({
      success: true,
      message: "Section Deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldnt delete section",
      errorMessage: error.message,
    });
  }
};
