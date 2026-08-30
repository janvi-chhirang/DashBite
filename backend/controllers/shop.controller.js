import Shop from "../models/shop.model.js";
import uploadOnClodinary from "../utils/cloudinary.js";

// Create or Edit Shop Controller
const createEditShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;

    let shop = await Shop.findOne({ Owner: req.userId });

    let imageUrl = null;
    if (req.file) {
      const cloudinaryResponse = await uploadOnClodinary(req.file.path);

      if (cloudinaryResponse) {
        imageUrl =
          cloudinaryResponse.secure_url ||
          cloudinaryResponse.url ||
          cloudinaryResponse;
      } else {
        return res.status(500).json({
          message:
            "Failed to upload shop image to cloud storage. Check backend credentials.",
        });
      }
    } else if (shop) {
      imageUrl = shop.image;
    }

    if (!imageUrl && !shop) {
      return res
        .status(400)
        .json({ message: "An initial shop image asset is required." });
    }

    if (!shop) {
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        image: imageUrl,
        Owner: req.userId,
      });
    } else {
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          city,
          state,
          address,
          image: imageUrl,
          Owner: req.userId,
        },
        { returnDocument: 'after' },
      );
    }

    await shop.populate("Owner");

    return res.status(201).json({
      message: "Shop processed successfully",
      shop,
    });
  } catch (error) {
    console.error("Error in createEditShop controller:", error);
    return res.status(500).json({
      message: "Error in processing Shop request",
      error: error.message || error,
    });
  }
};

// get Shop Controller
const getShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ Owner: req.userId }).populate([
      { path: "Owner" },
      { path: "item", strictPopulate: false, options: { sort: { updatedAt: -1 } } },
    ]);

    if (!shop) {
      return res
        .status(404)
        .json({ message: "Can't get your shop configuration." });
    }

    return res.status(200).json({
      message: "Shop fetched successfully",
      shop,
    });
  } catch (error) {
    console.error("Error in getShop controller:", error);
    return res.status(500).json({
      message: "Error in getting Shop details",
      error: error.message || error,
    });
  }
};

const getShopByCity = async (req, res) => { 
  try {
    const { city } = req.params;

    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") }
    }).populate('item');

    if (!shops || shops.length === 0) { 
      return res.status(404).json({ 
        message: "Shops not found",
      });
    }

    return res.status(200).json(shops);
  } catch (error) {
    console.error("Error in getShopByCity controller:", error);
    return res.status(500).json({
      message: "Error in getting Shop details using city",
      error: error.message || error,
    });
  }
};

export { createEditShop, getShop, getShopByCity };
