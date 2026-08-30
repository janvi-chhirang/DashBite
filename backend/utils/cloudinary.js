import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnClodinary = async (filePath) => {
  try {
    if (!filePath) return null;
    
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder: "dashbite_shops"
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return result;
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.log("CLOUDINARY CORE ERROR:", error);
    return null; 
  }
};

export default uploadOnClodinary;
