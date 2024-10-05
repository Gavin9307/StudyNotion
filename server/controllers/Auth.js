const User = require("../models/User");
const Otp = require("../models/Otp");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mailSender = require("../utils/mailSender");

exports.sendOtp = async function (req, res) {
  try {
    const { email } = req.body;
    const findUser = await User.findOne({ email });
    if (findUser) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    } else {
      var otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      console.log("Generated OTP = " + otp);
      const result = await Otp.findOne({ otp: otp });
      while (result) {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
        result = await Otp.findOne({ otp: otp });
      }

      const otpPayload = { email, otp };
      const otpBody = await Otp.create(otpPayload);
      console.log(otpBody);
      res.status(200).json({
        success: true,
        message: "OTP created successfully",
        otp: otp,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create OTP",
      errorMessage: error.message,
    });
  }
};

exports.signUp = async function (req, res) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
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

    const findUser = await User.findOne({ email });
    if (findUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const recentOtp = await Otp.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log("Recent OTP = " + recentOtp);

    if (recentOtp.length == 0) {
      return res.status(400).json({
        success: false,
        message: "Otp not found",
      });
    } else if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid Otp",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profile = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profile._id,
      image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    res.status(200).json({
      success: true,
      message: "Sign Up Successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to sign up",
      errorMessage: error.message,
    });
  }
};

exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    const findUser = await User.findOne({ email })
      .populate("additionalDetails")
      .lean();
    if (!findUser) {
      return res.status(400).json({
        success: false,
        message: "User doesnt exist",
      });
    }

    if (await bcrypt.compare(password, findUser.password)) {
      const payload = {
        email: findUser.email,
        id: findUser.id,
        accountType: findUser.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      findUser.token = token;
      findUser.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        findUser,
        message: "Login Successful",
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Passwords do not match",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to Login",
      errorMessage: error.message,
    });
  }
};

exports.changePassword = async function (req, res) {
  try {
    const { password, confirmPassword } = req.body;
    const { id } = req.params;
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
    const findUser = await User.findOne({ _id: id });
    if (!findUser) {
      return res.status(400).json({
        success: false,
        message: "User doesnt exist",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    findUser.password = hashedPassword;
    await findUser.save();

    try {
      const mailResponse = await mailSender(
        findUser.email,
        "Password Changed Successfully",
        "Your password was changed successfully"
      );
      console.log("Email sent Successfully ", mailResponse);
    } catch (error) {
      console.log("Error occured while sending mail");
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      errorMessage: error.message,
    });
  }
};
