const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

exports.createRating = async (req, res) => {
  try {
    const { userId } = req.user;
    const { rating, review, courseId } = req.body;

    if (!rating || !courseId) {
      return res.status(400).json({
        success: false,
        message: "rating and courseId are mandatory",
      });
    }

    const courseDetails = await Course.findOne({
      _id: courseId,
      studentEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in the course",
      });
    }

    const alreadyReviewed = await RatingAndReview.find({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Already Reviewed",
      });
    }

    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });

    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );
    console.log(updatedCourseDetails);
    res.status(200).json({
      success: true,
      ratingReview,
      message: "Rating and Review created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create rating",
      error: error.message,
    });
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    const courseId = req.body.courseId;
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]);
    if (result.length > 0) {
      res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
        message: "Average rating fetched successfully",
      });
    } else {
      res.status(200).json({
        success: true,
        averageRating: 0,
        message: "Average rating fetched successfully",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch average rating",
      error: error.message,
    });
  }
};

exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find()
      .sort({
        rating: "desc",
      })
      .populate({
        path: "User",
        select: "firstName lastName email image",
      })
      .populate({
        path: "Course",
        select: "courseName",
      })
      .exec();

    res.status(200).json({
      success: true,
      allRatings: allReviews,
      message: "All ratings fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all ratings",
      error: error.message,
    });
  }
};
