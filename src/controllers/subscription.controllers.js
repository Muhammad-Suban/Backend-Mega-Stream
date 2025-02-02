import mongoose, { isValidObjectId, mongo } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId.trim()) {
    throw new apiError(400, "Channel ID is required");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new apiError(404, "Channel not found");
  }
  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user?._id,
  });
  if (existingSubscription) {
    // it means user subscive the channel
    await Subscription.deleteOne({
      channel: channelId,
      subscriber: req.user._id,
    });
    return res
      .status(200)
      .json(new apiResponse(200, "Subscription removed successfully"));
  } else {
    // it means user not subscribe the channel
    await Subscription.create({
      channel: channelId,
      subscriber: req.user._id,
    });
    return res
      .status(201)
      .json(new apiResponse(201, "Subscription created successfully"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  // TODO: get subscriber list of a channel
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberInfo",
      },
    },
    {
      $unwind: "$subscriberInfo",
      preserveNullAndEmptyArrays: true,
    },
    {
      $project: {
        "channelInfo.userName": 1,

        "subscriberInfo.fullName": 1,
        "subscriberInfo.avator": 1,
      },
    },
  ]);
  if (!subscribers.length) {
    throw new apiError(404, "No subscribers found for this channel");
  }
  console.log(subscribers)
  console.log(subscribers[0])
  return res
    .status(200)
    .json(200, "Subscriber fetched successfully",subscribers[0]);
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new apiError(400, "Subscriber ID is required");
  }

  const userSubscribedChannelList = await Subscription.aggregate([
    {
      $match: { subscriber:new mongoose.Types.ObjectId(channelId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelInfo",
      },
    },
    {
      $unwind: "$channelInfo",
    },
    {
      $project: {
        "channelInfo.userName": 1,
        "channelInfo.fullName": 1,
        "channelInfo.avator": 1,
      },
    },
  ]);
  if (!userSubscribedChannelList.length) {
    throw new apiError(404, "No subscribed channels found for this user");
  }
  return res
    .status(200)
    .json(
      200,
      userSubscribedChannelList[0],
      "Subscribed Channels fetched successfully"
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
