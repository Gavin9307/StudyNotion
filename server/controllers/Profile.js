const Profile = require("../models/Profile");
const User = require("../models/User");
const uploadImageToCloudinary = require("../utils/imageUploader");

exports.updateProfile = async (req, res) => {
  try {
    const { dateOfBirth = "", about = "", contactNumber } = req.body;
    const id = req.user.id;

    if (!contactNumber || !id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await User.findById(id);
    const profileId = user.additionalDetails;
    const profile = await Profile.findById(profileId);

    if(dateOfBirth){
      const [day,month,year] = dateOfBirth.split(".");
      profile.dateOfBirth = new Date(`${year}-${month}-${day}`);
    }

    profile.about = about;
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

    const user = await User.findById({ _id: id });
    if (!user) {
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
    if (!user) {
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


exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;
    console.log("User ID:", userId); // Log the userId to see if it's valid

    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(userId ,
      { image: image.secure_url },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    const userDetails = await User.findOne({
      _id: userId,
    })
      .populate("courses")
      .exec()
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};