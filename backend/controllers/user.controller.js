import User from "../models/user.model.js";

const getCurrUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({
        message: "userId doesn't found",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        message: "userId doesn't found",
      });
    }
    return res.status(200).json({
      message: "User Found Successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Get current user error",
      error,
    });
  }
};

const updateUserLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { location: { type: "Point", coordinates: [Number(longitude), Number(latitude)] } },
      { returnDocument: 'after' },
    );
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.status(200).json({
      message: "User location updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Update user location error",
      error,
    });
  }
};



export { getCurrUser, updateUserLocation };
