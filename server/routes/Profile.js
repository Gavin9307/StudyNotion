const express = require("express");
const router = express.Router();

const {auth} = require("../middlewares/auth");

const {
    deleteAccount,
    updateProfile,
    showAllUserDetails,
    getEnrolledCourses,
    updateDisplayPicture

} = require("../controllers/Profile");

router.delete("/deleteProfile",auth,deleteAccount);
router.put("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, showAllUserDetails);
router.get("/getEnrolledCourses", auth, getEnrolledCourses);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);
module.exports = router;