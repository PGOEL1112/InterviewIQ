import User from "../models/userModel.js";


// GET USER PROFILE
export const getUserProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile"
    });

  }
};



// UPDATE USER PROFILE
export const updateUserProfile = async (req, res) => {
  try {
    const {
      name, bio, phone, location,
      skills, github, linkedin,
      portfolio, image, resume
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ safe updates
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;

    if (skills) {
      user.skills = Array.isArray(skills)
        ? skills
        : skills.split(",").map(s => s.trim());
    }

    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (portfolio !== undefined) user.portfolio = portfolio;
    if (image !== undefined) user.image = image;
    if (resume !== undefined) user.resume = resume;

    await user.save();

    const safeUser = await User.findById(user._id).select("-password");

    res.json({
      success: true,
      user: safeUser
    });

  } catch (err) {
    console.log("PROFILE UPDATE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
};


// GET USER CREDITS
export const getUserCredits = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      credits: user.credits
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch credits"
    });

  }
};