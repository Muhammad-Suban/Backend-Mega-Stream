import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();
cloudinary.config({
  cloud_name: "mss-cloud",
  api_key: "748661539366767",
  api_secret: "tkeNDGb-1i6CmExcCanQG1pK_u4",
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) {
      console.error("Error: No file path provided.");
      return null;
    }

    // Check if the file exists at the given path
    if (!fs.existsSync(filePath)) {
      console.error(
        "Error: File does not exist at the specified path:",
        filePath
      );
      return null;
    }

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });


    // console.log('File uploaded successfully to Cloudinary:', response.url);
    fs.unlinkSync(filePath);
    // return response;


    // chat gpt ediionz
    // For Video and Thumbnail pload
    if (response.resource_type === "video") {
      return {
        videoUrl: response.url,
        thumbnailUrl: response.thumbnail_url,
      };
    } else {
      // for only image upload like user resiftraion avatoe
      return {
        url: response.url, // For images or other file types
      };
    }


  } catch (error) {
    // Delete the file from the local server if it wasn't uploaded successfully
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("File removed from local server after failed upload.");
    }

    return null;
  }
};

export { uploadOnCloudinary };

// const uploadOnCloudinary = async (filePath) => {
//   try {
//     if (!filePath) {
//       console.error('Error: No file path provided.');
//       return null;
//     }

//     // Check if the file exists at the given path
//     if (!fs.existsSync(filePath)) {
//       console.error('Error: File does not exist at the specified path:', filePath);
//       return null;
//     }

//     // Upload file to Cloudinary
//     const response = await cloudinary.uploader.upload(filePath, {
//       resource_type: 'auto',
//     });

//     // console.log('File uploaded successfully to Cloudinary:', response.url);
//     fs.unlinkSync(filePath)
//     return response;

//   } catch (error) {

//     // Delete the file from the local server if it wasn't uploaded successfully
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//       console.log('File removed from local server after failed upload.');
//     }

//     return null;
//   }
// };

// export { uploadOnCloudinary };
