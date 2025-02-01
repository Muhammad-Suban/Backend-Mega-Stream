import { Comment } from "../models/comment.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {

  // Algo
  // --> comment table have three feilds (user_id,vide0_id,content)
  // 1) get video _id(params)
  // 2) find comment by video id & used populate or aggregation

  const { videoId } = req.params;
  // const {page = 1, limit = 10} = req.query
  if (!videoId) {
    throw new apiError(400, "Video ID is required");
  }
  const getComments = await Comment.findById({videoId})
    .populate("video", videoTitle)
    .populate("owner", "userName");

  if (!getComments) {
    throw new apiError(404, "Comments not found for this video");
  }

  // const comments = await Comment.aggregate([
  //     {
  //         $match:{
  //             _id:new mongoose.Types.ObjectId(videoId),
  //         }
  //     },
  //     {
  //         $lookup:{
  //             from:"videos",
  //             localField:"video",
  //             foreignField:"_id",
  //             as:"videoDetails"
  //         }
  //     },
  //         {
  //             $lookup:{
  //                 from:"users",
  //                 localField:"owner",
  //                 foreignField:"_id",
  //                 as:"ownerDetails"
  //             }
  //         },
  //         {
  //             $project:{
  //                 _id:1,
  //                 "ownerDetails.ownerName":1,
  //                 "videoDetails.title":1,
  //                 content:1,
  //                 createdAt:1,
  //             }
  //         }
  // ])

  return res
    .status(200)
    .json(new apiResponse(200, getComments, "Comments successfully fetched"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { userComment } = req.body;
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!videoId) {
    throw new apiError(400, "Video ID is required");
  }
  if (!userComment) {
    throw new apiError(400, "Comment is required");
  }
  if (!userId) {
    throw new apiError(401, "User not authenticated");
  }

  const newComment = await Comment.create({
    content: userComment,
    owner: userId,
    video: videoId,
  });
  if (!newComment) {
    throw new apiError(500, "Failed to add comment");
  }

  return res
    .status(201)
    .json(new apiResponse(201, newComment, "Comment successfully added"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { newComment } = req.body;
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!commentId) {
    throw new apiError(400, "Comment ID is required");
  }
  if (!newComment) {
    throw new apiError(400, "New comment is required");
  }
  if (!userId) {
    throw new apiError(401, "User not authenticated");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content: newComment },
    { new: true }
  );
  if (!updatedComment) {
    throw new apiError(404, "Comment not found");
  }
  return res
   .status(200)
   .json(new apiResponse(200, updatedComment, "Comment successfully updated"));

});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
 
  const {commentId} = req.params
  if(!commentId){
    throw new apiError(400, "Comment ID is required")
  }
  await Comment.findByIdAndDelete(commentId)
  
  return res
  .status(201)
  .json(new apiResponse(201, "Comment successfully deleted"));

});

export { getVideoComments, addComment, updateComment, deleteComment };
