const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  try {
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
    const id = req.user.id;

    if (!contactNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await User.findById(id);
    const profileId = user.additionalDetails;
    const profile = await Profile.findById(profileId);

    profile.dateOfBirth = dateOfBirth;
    profile.about = about;
    profile.gender = gender;
    profile.contactNumber = contactNumber;

    await profile.save();

    return res.status(200).json({
      success: true,
      profile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldnt update profile",
      errorMessage: error.message,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findById(id);
    if(!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
          });
    }
    const profileId = user.additionalDetails;
    await Profile.findByIdAndDelete(profileId);
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      profile,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldnt delete profile",
      errorMessage: error.message,
    });
  }
};


exports.showAllUserDetails = async (req, res) => {
    try {
      const id = req.user.id;
  
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }
  
      const user = await User.findById(id).populate("additionalDetails").exec();
      if(!user) {
          return res.status(404).json({
              success: false,
              message: "User not found",
            });
      }
  
      return res.status(200).json({
        user,
        success: true,
        message: "User details fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Couldnt fetch user details",
        errorMessage: error.message,
      });
    }
  };