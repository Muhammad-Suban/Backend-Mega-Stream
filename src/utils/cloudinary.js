import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    // uploadfile in clodinary
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
    });

    console.log('file is uploaded in cloudinary', response.url);
    return response;
    
  } catch (error) {
    fs.unlinkSync(filePath); // file delete from localserver if file not proper store in cloudinary it cause bugs
    console.log(error);
    return null;
  }
};

export { uploadOnCloudinary };
