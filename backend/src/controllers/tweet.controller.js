import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const user = req.user;
    
    if (!content) {
        throw new ApiError(400, "Tweet body is required");
    };
    
    const tweet = await Tweet.create({
        content,
        owner: user._id
    });
    
    
    if(!tweet) {
        throw new ApiError(500, "Something went wrong while posting the tweet");
    };
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet created successfully")
    );
});

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    const validUserId = isValidObjectId(userId);

    if(!validUserId) {
        throw new ApiError(400, "Invalid User Id");
    };

    const userTweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ]);

    if(!userTweets) {
        throw new ApiError(500, "Something went wrong while looking for user tweets");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, userTweets, "User tweets fetched successfully")
    );
});

const updateTweets = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    

    const validTweetId = isValidObjectId(tweetId);
    
    if(!validTweetId) {
        throw new ApiError(400, "Invalid tweet Id");
    };
    
    if(!content) {
        throw new ApiError(400, "Tweet body is required");
    };
    
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    );
    
    if (!updatedTweet) {
        throw new ApiError(500, "Something went wrong while updating the tweet")
    };
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    );
});

const deleteTweets = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    
    const validTweetId = isValidObjectId(tweetId);

    if(!validTweetId) {
        throw new ApiError(400, "Invalid tweet Id");
    };

    const deleteTweet = await Tweet.deleteOne({
        _id: tweetId
    });

    if(!deleteTweet) {
        throw new ApiError(500, "An error occurred while fetching the tweet");
    };

    return res
    .status(200)
    .json(new ApiResponse(
        200, {}, "Tweet deleted successfully")
    );
});

export {
    createTweet,
    getUserTweets,
    updateTweets,
    deleteTweets
}