import mongoose from "mongoose";
import { Video } from "../routes/video.routes.js";
import { Subscription } from "../routes/subscription.routes.js";
import { Like } from "../routes/like.routes.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {});
const getChannelVideos = asyncHandler(async (req, res) => {});


export {
    getChannelStats,
    getChannelVideos
}