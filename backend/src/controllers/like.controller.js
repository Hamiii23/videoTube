import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!videoId) {
        throw new ApiError(400, "Invalid Video ID");
    };

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    let likeVideo;
    let unlikeVideo;

    if(existingLike) {
        unlikeVideo = await Like.deleteOne({
            _id: existingLike._id
        });
    } else {
        likeVideo = await Like.create({
            video: videoId,
            likedBy: req.user._id
        });        
    };
    
    if(!likeVideo && !unlikeVideo) {
        throw new ApiError(500, "Something went wrong while toggling the video like");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, likeVideo || unlikeVideo, "Video liked toggled successfully")
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if(!commentId) {
        throw new ApiError(400, "Invalid Comment ID");
    };
    
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    let likeComment;
    let unlikeComment;

    if(existingLike) {
        unlikeComment = await Like.deleteOne({
            _id: existingLike._id
        });
    } else {
        likeComment = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        });        
    };

    if(!likeComment && !unlikeComment) {
        throw new ApiError(500, "Something went wrong while toggling the comment like");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, likeComment || unlikeComment, "Comment like toggled successfully")
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if(!tweetId) {
        throw new ApiError(400, "Invalid Tweet ID");
    };

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    let likeTweet;
    let unlikeTweet;

    if(existingLike) {
        unlikeTweet = await Like.deleteOne({
            _id: existingLike._id
        });
    } else {
        likeTweet = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        });        
    };


    if(!likeTweet && !unlikeTweet) {
        throw new ApiError(500, "Something went wrong while toggling the tweet like");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, likeTweet || unlikeTweet, "Tweet like toggled successfully")
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const user = req.user;

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: user._id
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideos"
            }
        },
        {
            $unwind: "$likedVideos"
        },
        {
            $project: {
                likedVideos: 1
            }
        }
    ]);
    
    if(!likedVideos) {
        throw new ApiError(500, "Something went wrong while fetching the liked videos");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200,likedVideos, "Liked videos fetched successfully")
    );
});


const getLikedComments = asyncHandler(async (req, res) => {
    const user = req.user;

    const likedComments = await Like.aggregate([
        {
            $match: {
                likedBy: user._id
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "comment",
                foreignField: "_id",
                as: "likedComments"
            }
        },
        {
            $unwind: "$likedComments"
        },
        {
            $project: {
                likedComments: 1
            }
        }
    ]);
    
    if(!likedComments) {
        throw new ApiError(500, "Something went wrong while fetching the liked comments");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, likedComments, "Liked comments fetched successfully")
    );
});

const getLikedTweets = asyncHandler(async (req, res) => {
    const user = req.user;

    const likedTweets = await Like.aggregate([
        {
            $match: {
                likedBy: user._id
            }
        },
        {
            $lookup: {
                from: "tweets",
                localField: "tweet",
                foreignField: "_id",
                as: "likedTweets"
            }
        },
        {
            $unwind: "$likedTweets"
        },
        {
            $project: {
                likedTweets: 1
            }
        }
    ]);
    
    if(!likedTweets) {
        throw new ApiError(500, "Something went wrong while fetching the liked tweets");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, likedTweets, "Liked tweets fetched successfully")
    );
});




export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    getLikedComments,
    getLikedTweets
}