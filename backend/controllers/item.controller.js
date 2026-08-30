import uploadOnClodinary from "./../utils/cloudinary.js";
import Shop from "./../models/shop.model.js";
import Item from "../models/item.model.js";
import Order from "../models/order.model.js";

// Add Item Controller
const addItem = async (req, res) => {
  try {
    const { name, category, foodType, price } = req.body;

    const shop = await Shop.findOne({ Owner: req.userId });
    if (!shop) {
      return res
        .status(404)
        .json({ message: "Shop not found for this logged-in user" });
    }

    let imageUrl = "";
    if (req.file) {
      const cloudinaryResponse = await uploadOnClodinary(req.file.path);
      if (cloudinaryResponse) {
        imageUrl = cloudinaryResponse.secure_url || cloudinaryResponse.url;
      }
    }

    const item = await Item.create({
      name,
      category,
      foodType,
      price: Number(price),
      image: imageUrl,
      shop: shop._id,
    });

    if (!shop.item) {
      shop.item = [];
    }

    shop.item.push(item._id);
    await shop.save();

    await shop.populate([
      { path: "Owner" },
      { path: "item", options: { sort: { createdAt: -1 } } },
    ]);

    return res.status(201).json({
      message: "Item Added Successfully",
      shop,
    });
  } catch (error) {
    console.error("Error in addItem controller:", error);
    return res.status(500).json({
      message: "Error while adding item",
      error: error.message || error,
    });
  }
};

// Edit Item Controller
const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { name, category, foodType, price } = req.body;

    let currentItem = await Item.findById(itemId);
    if (!currentItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    let imageUrl = currentItem.image;
    if (req.file) {
      const cloudinaryResponse = await uploadOnClodinary(req.file.path);
      if (cloudinaryResponse) {
        imageUrl = cloudinaryResponse.secure_url || cloudinaryResponse.url;
      }
    }

    const item = await Item.findByIdAndUpdate(
      itemId,
      { name, category, foodType, price: Number(price), image: imageUrl },
      { returnDocument: "after" }
    );

    const shop = await Shop.findOne({ Owner: req.userId }).populate({
      path: "item",
      options: { sort: { updatedAt: -1 } },
    });
    if (!shop) {
      return res
        .status(404)
        .json({ message: "Shop not found for this logged-in user" });
    }

    return res.status(200).json({
      message: "Item updated Successfully",
      shop,
    });
  } catch (error) {
    console.error("Error in editItem controller:", error);
    return res.status(500).json({
      message: "Error while updating item",
      error: error.message || error,
    });
  }
};

// Get Item By ID
const getItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.status(200).json({
      message: "Item fetched successfully",
      item,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while fetching item",
      error: error.message || error,
    });
  }
};

// Delete Item
const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    const shop = await Shop.findOne({ Owner: req.userId });
    if (!shop) {
      return res
        .status(404)
        .json({ message: "Shop not found for this logged-in user" });
    }
    shop.item = shop.item.filter((id) => id.toString() !== itemId);
    await shop.save();
    await shop.populate({ path: "item", options: { sort: { updatedAt: -1 } } });
    return res.status(200).json({
      message: "Item deleted successfully",
      shop,
    });
  } catch (error) {
    console.error("Error in deleteItem controller:", error);
    return res.status(500).json({
      message: "Error while deleting item",
      error: error.message || error,
    });
  }
};

// Get Items by City
const getItemByCity = async (req, res) => {
  try {
    const { city } = req.params;
    if (!city) {
      return res.status(400).json({ message: "City is required" });
    }

    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    });

    if (!shops || shops.length === 0) {
      return res.status(404).json({
        message: "Shops not found in this city",
      });
    }

    const shopIds = shops.map((shop) => shop._id);
    const items = await Item.find({ shop: { $in: shopIds } }).populate("shop");
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({
      message: "Error while getting items by city",
      error: error.message || error,
    });
  }
};

// Get Items by Shop
const getItemByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const shop = await Shop.findById(shopId).populate("item");
    if (!shop) {
      return res.status(400).json({ message: "Shop not found" });
    }
    return res.status(200).json({
      message: "shop-items fetched successfully",
      shop,
      item: shop.item,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Error in getting Items of the shop",
      error,
    });
  }
};

// Search Items
const searchItems = async (req, res) => {
  try {
    const { query, city } = req.query;

    if (!query || !city) {
      return res.status(400).json({ message: "Query and City are required" });
    }

    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    });

    if (!shops || shops.length === 0) {
      return res
        .status(404)
        .json({ message: "No shops found in this city", items: [] });
    }

    const shopIds = shops.map((i) => i._id);

    const items = await Item.find({
      shop: { $in: shopIds },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    }).populate("shop", "name image");

    return res.status(200).json({
      message: "Fetched successfully",
      items,
    });
  } catch (error) {
    console.error("Backend search error:", error);
    return res.status(500).json({
      message: "Error in getting Searched Item",
      error: error.message,
    });
  }
};

// Rating Controller
// Rating Controller
const rating = async (req, res) => {
  try {
    const { itemId, rating: incomingRating, orderId } = req.body;

    if (!itemId || incomingRating === undefined || incomingRating === null) {
      return res.status(400).json({
        message: "Item Id and Rating are required",
      });
    }

    const ratingVal = Number(incomingRating);

    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // 1. Validate Order & Lock Repeat Ratings
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      let matchedItem = null;

      order.shopOrders?.forEach((so) => {
        so.shopOrderItems?.forEach((soi) => {
          const currentItemId =
            soi.item?._id?.toString() ||
            soi.item?.toString() ||
            soi.itemId?.toString();

          if (currentItemId === itemId.toString()) {
            matchedItem = soi;
          }
        });
      });

      if (!matchedItem) {
        return res.status(404).json({ message: "Item not found in this order" });
      }

      if (matchedItem.isRated) {
        return res.status(400).json({
          message: "You have already rated this item for this order.",
        });
      }

      // Mark as rated directly on the order document
      matchedItem.isRated = true;
      matchedItem.userRating = ratingVal;
      await order.save();
    }

    // 2. Update Item Rating Average
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    const currentCount = item.rating?.count || 0;
    const currentAverage = item.rating?.average || 0;

    const newCount = currentCount + 1;
    const newAverage = (currentAverage * currentCount + ratingVal) / newCount;

    item.rating = {
      count: newCount,
      average: Number(newAverage.toFixed(1)),
    };

    await item.save();

    return res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      rating: item.rating,
      userRating: ratingVal,
    });
  } catch (error) {
    console.error("Backend rating error:", error);
    return res.status(500).json({
      message: "Error in setting rating of the item",
      error: error.message,
    });
  }
};

export {
  addItem,
  editItem,
  getItemById,
  deleteItem,
  getItemByCity,
  getItemByShop,
  searchItems,
  rating,
};
