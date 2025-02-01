import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { user } = req.user;

  if (![name, description, user].every((item) => item && item.trim() !== "")) {
    throw new apiError(400, "All fields are required");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: user._id,
  });

  return res
    .status(201)
    .json(new apiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId || !isValidObjectId(userId)) {
    throw new apiError(400, "User ID is required");
  }
  const getUserPlaylists = await Playlist.find({
    owner: userId,
  });
  if (!getUserPlaylists) {
    throw new apiError(404, "User's playlists not found");
  }
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        getUserPlaylists,
        "User's playlists successfully retrieved"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const userId = req.user?._id;
  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new apiError(400, "Playlist ID is required");
  }
  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: userId,
  });
  if (!playlist) {
    throw new apiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, playlist, "Playlist successfully retrieved"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId || !isValidObjectId(videoId)) {
    throw new apiError(400, "Playlist ID or video id  is required");
  }
  const videoAddedToPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: { videos: videoId },
    },
    {
      new: true,
    }
  );
  if (!videoAddedToPlaylist) {
    throw new apiError(
      404,
      "Playlist not found or video not Added successfully"
    );
  }
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        videoAddedToPlaylist,
        "Video added to playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId || !isValidObjectId(videoId)) {
    throw new apiError(400, "Playlist ID or video id  is required");
  }
  // for better optimization
  const playlist = await playlist.findbyId(playlistId);
  if (!playlist) {
    throw new apiError(404, "Playlist not found");
  }
  if (!playlist.videos.includes(videoId)) {
    throw new apiError(400, "Video is not in the playlist"); // for better user experience and security
  }
  const videoRemovedFromPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    {
      new: true,
    }
  );
  if (!videoRemovedFromPlaylist) {
    throw new apiError(
      404,
      "Playlist not found or video not removed successfully"
    );
  }
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        videoRemovedFromPlaylist,
        "Video removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {

  const { playlistId } = req.params;
  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new apiError(400, "Playlist ID is required");
  }
  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new apiResponse(200, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId || !name || !description || !isValidObjectId(playlistId)) {
    throw new apiError(400, "All field are required playlist,name description");
  }
  const updatePlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    {
      new: true,
    }
  );
  if (!updatePlaylist) {
    throw new apiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new apiResponse(200, updatePlaylist, "Playlist successfully updated")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
