import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: req.user._id
            }
        },
        {
            $group: {
                _id: null,
                subscribersCount: {
                    $sum: 1
                }
            }
        }
    ]);

    const video = await Video.aggregate([
        {
            $match: {
                likedBy: req.user._id
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $project: {
                totalLikes: {
                    $size: "$likes"
                },
                totalViews: "$views",
                totalVideos: 1
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {
                    $sum: "$totalLikes"
                },
                totalViews: {
                    $sum: "$totalViews"
                },
                totalVideos: {
                    $sum: 1
                }
            }
        }
    ]);


    const stats = {
        totalSubscribers: subscribers[0]?.subscribersCount || 0,
        totalLikes: video[0]?.totalLikes || 0,
        totalViews: video[0]?.totalViews || 0,
        totalVideos: video[0]?.totalVideos || 0
    };

    return res.status(200).json(new ApiResponse(200, stats, 'Channel stats fetched successfully'));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortType = -1 } = req.query;

    const sortStage = sortType == "asc" ? 1 : -1;

    const videos = await Video.aggregate([
        {
            $match: {
                owner: req.user._id
            }
        },
        {
            $skip: (Number(page) - 1) * Number(limit)
        },
        {
            $limit: Number(limit)
        },
        {
            $sort: {
                [sortBy]: sortStage 
            }
        },
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                createdAt: 1,
                duration: 1,
                views: 1,
                videoFile: 1
            }
        }
    ]);

    if(!videos) {
        throw new ApiError(500, "Something went wrong while fetching the videos");
    };

    return res.
    status(200)
    .json(
        new ApiResponse(
            200, 
            videos, 
            "Videos fetched successfully"
        )
    );
});


export {
    getChannelStats,
    getChannelVideos
}