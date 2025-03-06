import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {

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