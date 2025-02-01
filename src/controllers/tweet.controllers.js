import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { tweet } = req.body;
  const user = req.user;
  if (!tweet) {
    throw new apiError(400, "Tweet is empty");
  }
  const CreateTweet = await Tweet.create({
    content: tweet,
    owner: user?._id,
  });
  if (!CreateTweet) {
    throw new apiError(500, "Failed to create tweet");
  }
  return res
    .status(201)
    .json(new apiResponse(201, CreateTweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId || !isValidObjectId(userId)) {
    throw new apiError(400, "User ID is required");
  }
  const validate = await User.findById(user_id);
  if (!validate) {
    throw new apiError(404, "User not found");
  }
  const userTweets = await Tweet.find({ owner: userId })
    .populate("owner", "userName avatar")
    .sort({ createdAt: -1 });

  if (!userTweets) {
    throw new apiError(404, "User's tweets not found");
  }
  return res
    .status(200)
    .json(
      new apiResponse(200, userTweets, "User's tweets retrieved successfully")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { newContent } = req.body;
  const userId = req.user?._id;
  if (!tweetId) {
    throw new apiError(400, "Tweet ID is required");
  }
  if (!newContent) {
    throw new apiError(400, "New content is required");
  }
  const updateTweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: userId },
    { content: newContent },
    { new: true }
  );
  if (!updateTweet) {
    throw new apiError(404, "Tweet not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, updateTweet, "Tweet successfully updated"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.body;
  const userId = req.user;
  if (!tweetId) {
    throw new apiError(400, "Tweet ID is required");
  }
  const tweet = await Tweet.findOneAndDelete({
    owner: userId,
    tweetId,
  });
  return res
    .status(200)
    .json(new apiResponse(200, "Tweet successfully deleted"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
