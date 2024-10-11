const express = require("express");
const router = express.Router();

const {
    login,
    signUp,
    sendOtp,
    changePassword
} = require("../controllers/Auth");

const {
    auth
} = require("../middlewares/auth");

const {
    resetPassword,
    resetPasswordToken
} = require("../controllers/ResetPassword");

// Authentication
router.post("/login",login);
router.post("/signup",signUp);
router.post("/sendotp",sendOtp);
router.post("/changepassword",auth,changePassword);


// Reset Passwords
router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword)

module.exports = router;