const User = require("../models/User");
const Otp = require("../models/Otp");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mailSender = require("../utils/mailSender");

exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email is not registered",
      });
    }
    const token = crypto.randomUUID();
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token,
        resetPasswordExpires: Date.now + 5 * 60 * 1000,
      },
      {
        new: true,
      }
    );

    const url = `http://localhost:3000/update-password/${token}`;

    await mailSender(
      email,
      "Password Reset Link | StudyNotion",
      `Password Reset Link = ${url}`
    );

    return res.status(200).json({
      success: true,
      message: "Password Reset Link sent",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: true,
      message: "Cannot Send Password Reset Email",
      errorMessage: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match",
      });
    }
    const userDetails = await User.findOne({ token: token });
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Token is invalid",
      });
    }

    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token is Expired",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Reset Password Success",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error Reseting Password",
      errorMessage: error.message,
    });
  }
};
