const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

exports.capturePayment = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;
  if (!courseId) {
    return res.status(400).json({
      success: false,
      message: "Please Provide valid course ID",
    });
  }

  let course;
  try {
    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Couldnt find the course",
      });
    }

    const uid = new mongoose.Types.ObjectId(userId);
    if (!course.studentsEnrolled.includes(uid)) {
      return res.status(400).json({
        success: false,
        message: "Student already enrolled",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      errorMessage: error.message,
    });
  }

  const amount = course.price;
  const currency = "INR";
  const options = {
    amount: amount * 100,
    currency,
    receipt: Math.random(Date.now()).toString(),
    notes: {
      courseId: courseId,
      userId,
    },
  };

  try {
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
      message: "Order Initiated Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      errorMessage: error.message,
      message: "couldnt initiate order",
    });
  }
};

exports.verifySignature = async (req, res) => {
  const webHookSecret = process.env.WEB_HOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"]; //encrypted so convert above webhooksecret to hashed format
  const shasum = crypto.createHMAC("sha256", webHookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");
  if (signature === digest) {
    console.log("Payment is authorised");
    const { courseId, userId } = req.body.payload.payment.entity.notes;
    try {
      const enrolledCourse = await Course.findByIdAndUpdate(
        courseId,
        {
          $push: {
            studentsEnrolled: userId,
          },
        },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "Course not found",
        });
      }
      console.log(enrolledCourse);

      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
          },
        },
        { new: true }
      );

      //mail send
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulations from StudyNotion",
        "Congratulation, you are onboarded into new StudyNotion Course"
      );
      console.log(emailResponse);
      return res.status(200).json({
        success: true,
        message: "Course enrollment successfull",
      });
    } catch (error) {
      return res.status(500).json({
        success: true,
        error: error.message,
        message: "Course enrollment unsuccessful",
      });
    }
  } else {
    return res.status(400).json({
        success: true,
        message: "Signature doesnt match digest",
      });
  }
};
