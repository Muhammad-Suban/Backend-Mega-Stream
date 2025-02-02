import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/likes.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const user = req.user;

  if (!videoId) {
    throw new apiError(400, "Video ID is required");
  }
  if (!user) {
    throw new apiError(401, "User not authenticated");
  }

  const alreadyLikeVideo = await Like.findOne({
    video: videoId,
    likedBy: user._id,
  });
  if (alreadyLikeVideo) {
    await Like.findByIdAndDelete(alreadyLikeVideo._id);
    //  await alreadyLikeVideo.deleteOne()
    return res
      .status(200)
      .json(new apiResponse(200, "Like removed successfully"));
  }
  if (!alreadyLikeVideo) {
    const likeVideo = await Like.create({
      video: videoId,
      likedBy: user._id,
    });
    return res
      .status(201)
      .json(new apiResponse(201, likeVideo, "Like toggled successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const user = req.user;
  if (!commentId) {
    throw new apiError(400, "Comment ID is required");
  }
  if (!user) {
    throw new apiError(401, "User not authenticated");
  }
  const alreadyLikeComment =await Like.findOne({
    comment: commentId,
    likedBy: user._id,
  });
  console.log(alreadyLikeComment)
  
  if (alreadyLikeComment) {
    await alreadyLikeComment.deleteOne();
    return res
      .status(200)
      .json(new apiResponse(200, "Like removed successfully"));
  }
  if (!alreadyLikeComment) {
    const likeComment = await Like.create({
      comment: commentId,
      likedBy: user._id,
    });
    return res
      .status(201)
      .json(
        new apiResponse(201, likeComment, "user like the comment successfully")
      );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const user = req.user;
  if (!tweetId) {
    throw new apiError(400, "Tweet ID is required");
  }
  if (!user) {
    throw new apiError(401, "User not authenticated");
  }
  const alreadyLikeTweet = await Like.findOne({
    tweet: tweetId,
    likedBy: user._id,
  });
  if (alreadyLikeTweet) {
    await alreadyLikeTweet.deleteOne();
    return res
      .status(200)
      .json(new apiResponse(200, "Like removed successfully"));
  }
  if (!alreadyLikeTweet) {
    const likeTweet = await Like.create({
      tweet: tweetId,
      likedBy: user._id,
    });
    return res
      .status(201)
      .json(
        new apiResponse(201, likeTweet, "user like the tweet successfully")
      );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new apiError(401, "User not authenticated");
  }
  const likeAllVideos = await Like.find({
    likedBy: userId,
    video: { $exists: true },
  });
  if (!likeAllVideos) {
    throw new apiError(404, "No likes found");
  }
  return res
    .status(201)
    .json(
      new apiResponse(
        200,
        likeAllVideos,
        "succussfully fetched All Like Videos"
      )
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
