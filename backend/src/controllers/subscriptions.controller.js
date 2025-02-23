import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { channel } from "diagnostics_channel";


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if(!channelId) {
      throw new ApiError(400, "Invalid Channel ID");
    };

    if(channelId == req.user._id) {
      throw new ApiError(400, "You cannot subscribe to your own channel");
    };

    let subscribedUser;
    let unsubscribedUser;

    const existingSubscription = await Subscription.findOne({
      subscriber: req.user._id,
      channel: channelId
    });

    if(!existingSubscription) {
      subscribedUser = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
      });

      if(!subscribedUser) {
        throw new ApiError(500, "Something went wrong while subscribing to the channel");
      };
    } else {
      unsubscribedUser = await Subscription.deleteOne({
        subscriber: req.user._id,
        channel: channelId
      });

      if(!unsubscribedUser) {
        throw new ApiError(500, "Something went wrong while unsubscribing to the channel");
      };
    };

    return res
    .status(200)
    .json(
      new ApiResponse(200, subscribedUser || unsubscribedUser, "Subscription toggled successfully")
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    
    const validId = isValidObjectId(channelId);

    if (!validId) {
      throw new ApiError(400, "Invalid Channel ID");
    };

    const subscribers = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(channelId)
        }
      },
      {
        $project: {
          subscriber: 1
        }
      }
    ]);

    if(!subscribers) {
      throw new ApiError(500, "Something went wrong while searching for subscribers");
    };

    return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Channel subscribers fetched successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    const validId = isValidObjectId(subscriberId);

    if(!validId) {
      throw new ApiError(400, "Invalid Subscriber ID");
    };

    const subscribedUsers = await Subscription.aggregate([
      {
        $match: {
          subscriber: new mongoose.Types.ObjectId(subscriberId)
        }
      },
      {
        $project: {
          channel: 1
        }
      }
    ]);

    if(!subscribedUsers) {
      throw new ApiError(400, "something went wrong while searching for subscribed channels");
    };

    return res
    .status(200)
    .json(
      new ApiResponse(200, subscribedUsers, "Subscribed channels found successfully")
    );
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
