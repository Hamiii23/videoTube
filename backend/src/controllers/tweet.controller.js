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
    
    // const createdTweet = await Tweet.findById(tweet._id);
    
    if(!tweet) {
        throw new ApiError(500, "Something went wrong while posting the tweet");
    };
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet created successfully")
    );
});

const getUserTweets = asyncHandler(async (req, res) => {});

const updateTweets = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    
    if(!tweetId) {
        throw new ApiError(400, "Invalid tweet Id");
    };
    
    if(!content) {
        throw new ApiError(400, "Tweet body is required");
    };

    const updatedTweet = await Tweet.findByIdAndUpdate(
        {
            _id: tweetId
        },
        {
            content
        }
    );

    if (!updatedTweet) {
        throw new ApiError(500, "Something went wrong while updating the tweet")
    };

    const tweet = await Tweet.findById(tweetId);

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    );
});

const deleteTweets = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if(!tweetId) {
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