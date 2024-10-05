const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorisation").replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token found",
      });
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      req.user = decode;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Error verifying token",
      });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: "Validation error",
    });
  }
};

exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for students",
      });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error checking user role",
    });
  }
};

exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Instructor",
      });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error checking user role",
    });
  }
};

exports.isAdmin = async (req, res, next) => {
    try {
      if (req.user.accountType !== "Admin") {
        return res.status(401).json({
          success: false,
          message: "This is a protected route for Admin",
        });
      }
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Error checking user role",
      });
    }
  };