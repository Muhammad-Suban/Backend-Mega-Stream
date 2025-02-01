import mongoose ,{isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getChannelStatus = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId} = req.params
    if(!channelId){
        throw new apiError(400, "Channel ID is required");
    }
    const channelDetails = await Video.aggregate([
        {
            $match:{
                ownerName:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group:{
                _id:new mongoose.Types.ObjectId(channelId),
                totalVideos:{$sum:1},
                totalViews:{$sum:"$views"},
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscriberCount"
            },
            $addFields:{
                totalSubscriber:{
                    $size:"$subscriberCount"
                }
            },
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"totalLikes"
            },
            $addFields:{
                totalLikes:{
                    $sum:{$size:"$totalLikes"}
                }
            },
        },
        {
            $project:{
                totalVideos:1,
                totalViews:1,
                totalLikes:1,
                totalSubscriber:1,

            }
        },
    ])
    if(!channelDetails || channelDetails.length === 0){
        throw new apiError(404, "Channel not found or no data avalible");
    }

    return res
   .status(200)
   .json(new apiResponse(200, channelDetails[0],"Channel status successfully fetched"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId}= req.params
    if(!channelId || !isValidObjectId(channelId)){
        throw new apiError(400, "Channel ID is required");
    }
    const channelVideos = await Video.aggregate([
        {
            $match: {
                channel:new mongoose.Types.ObjectId(channelId)
            },
        },
        {
            $lookup:{
                from:"users",
                localField:"ownerName",
                foreignField:"_id",
                as:"ownerDetails"
            }
        },
        {
            $unwind:"$ownerDetails"
        },
        {
            $project:{
                title:1,
                description:1,
                createdAt:1,
                updatedAt:1,
                views:1,
                likes:1,
                "ownerDetails.ownerName":1,
               " ownerDetails.fullName":1,
                "ownerDetails.avator":1,
                
            }
        }
    ])
    if(channelVideos.length==0){
        throw new apiError(404, "No videos found for this channel");
    }
    return res
     .status(200)
     .json(
        new apiResponse(200, channelVideos, "Channel videos successfully fetched")
    );
})

export {
    getChannelStatus, 
    getChannelVideos
    }