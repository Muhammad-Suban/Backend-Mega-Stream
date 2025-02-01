import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  page = Number(page);
  limit = Number(limit);

  // Build the filter object
  const filter = {};
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    filter.ownerName = userId; // Assuming ownerName stores the channel/user ID
  }

  // Count documents that match the filter
  const totalVideos = await Video.countDocuments(filter);
  const totalPages = Math.ceil(totalVideos / limit);

  // Build the sorting object
  const sortOptions = {};
  sortOptions[sortBy] = sortType.toLowerCase() === "asc" ? 1 : -1;

  // Fetch videos with filtering, sorting, and pagination
  const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { totalVideos, totalPages, currentPage: page, videos },
        "Videos fetched successfully"
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { userId } = req.user?._id;

  if (
    !title ||
    !description ||
    !req.files?.videoFile ||
    !req.files?.thumbnailFile
  ) {
    throw new apiError(
      400,
      "All fields are required, including video and thumbnail files."
    );
  }

  const videoPath = req.files.videoFile[0]?.path; // Video file path
  const thumbnailPath = req.files.thumbnailFile[0]?.path; // Thumbnail file path

  const videoResponse = await uploadOnCloudinary(videoPath); // Upload video
  const thumbnailResponse = await uploadOnCloudinary(thumbnailPath); // Upload thumbnail

  if (!videoResponse?.url || !thumbnailResponse?.url) {
    throw new apiError(400, "Error while uploading files to Cloudinary");
  }

  const createdVideo = await Video.create({
    title,
    description,
    videoFile: videoResponse.url,
    thumbnail: thumbnailResponse.url,
    duration: videoResponse.duration,
    ownerName: userId,
    isPublished: true,
  });

  return res
    .status(201)
    .json(new apiResponse(201, createdVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!video) {
    throw new apiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, video, "Video successfully retrieved"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  const { title, description } = req.body;
  if (!title && !description) {
    throw new apiError(402, "atleast Title or Description is required");
  }
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "empty or Invalid format of video");
  }

  // i thought user will Not allowed to update video only update it details
  // const updatedVideoPath = req.files?.Video[0]?.path
  // if(!updatedVideoPath){

  //     throw new apiError(400, "Video file is required")
  // }
  // const cloudinaryVideo = await uploadOnCloudinary(updatedVideoPath)
  // const updatedThumbnailPath = req.files?.Thumbnail[0]?.path

  if (videoId) {
    const owner = Video.findById(videoId);
    if (owner.ownerName.toString() !== userId.toString()) {
      throw new apiError(403, "You are not allowed to update this video");
    }
  }

  let updatedThumbnail;
  if (req.file?.path) {
    const updatedThumbnailPath = req.file?.path;
    const cloudinarThumbnail = await uploadOnCloudinary(updatedThumbnailPath);
    if (!cloudinarThumbnail || !cloudinarThumbnail.thumbnailUrl) {
      throw new apiError(400, "Error while uploading to cloudinary");
    }
    updatedThumbnail = cloudinarThumbnail.thumbnailUrl;
  }
  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        ...(title && { title }),
        ...(description && { description }),
        ...(updatedThumbnail && { thumbnail: updatedThumbnail }),
      },
    },
    {
      new: true,
    }
  );
  if (!updateVideo) {
    throw new apiError(404, "Video details not be updated");
  }
  return res
    .status(200)
    .json(
      new apiResponse(200, updateVideo, "Video details successfully updated")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new apiError(400, "Video ID is required or incorrect format");
  }
  const videoOwner = await Video.findById(videoId);
  if (!videoOwner.ownerName.toString() !== userId.toString()) {
    throw new apiError(403, "You are not allowed to delete this video");
  }

  const videoDeleted = await Video.findByIdAndDelete(videoId);
  if (!videoDeleted) {
    throw new apiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, "Video successfully deleted"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  if (!videoId || !isValidObjectId(videoId)) {
    throw new apiError(400, "Video ID is required or incorrect format");
  }
  const videoOwner = await Video.findById(videoId);
  if (!videoOwner.ownerName.toString() !== userId.toString()) {
    throw new apiError(
      403,
      "You are not allowed to toggle publish status of this video"
    );
  }

  //   if(videoOwner.isPublished){
  //     !videoOwner.isPublished
  //   }
  //   if(!videoOwner.isPublished){
  //     videoOwner.isPublished

  // SORTEST VERSION OF THE LOGIC
  videoOwner.isPublished = !videoOwner.isPublished;
  const updateStatus = await videoOwner.save();
  if (!updateStatus) {
    throw new apiError(400, "Failed to toggle publish status");
  }
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        updateStatus,
        "Video publish status successfully toggled"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
