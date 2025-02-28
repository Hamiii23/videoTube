import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    if(!userId) {
        throw new ApiError(400, "Invalid User ID");
    };

    const sortStage = sortType == "ascending" ? 1 : -1;
    const pageNum = Number(page) - 1;

    const userVideos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $limit: Number(limit)
        },
        {
            $skip: (Number(page) - 1) * Number(limit) 
        },
        {
            $sort: {
                [sortBy]: sortStage
            } 
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                createdAt: 1,
                title: 1,
                description: 1,
                views: 1,
                duration: 1,
                isPublished: 1
            }
        }
    ]);

    if (!userVideos) {
        throw new ApiError(500, "Something went wrong while looking for user videos");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, userVideos, "User videos found successfully")
    );
});

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body;

    if(!title && !description) {
        throw new ApiError(400, "Video title and description is required");
    };

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    
    if(!videoFileLocalPath && !thumbnailLocalPath) {
        throw new ApiError(400, "Video file and thumbnail file is missing");
    };
    
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    
    const owner = req.user;
    
    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: owner._id
    });
    
    if(!video) {
        throw new ApiError(500, "Something went wrong while uploading the video");
    };
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video uploaded successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!videoId) {
        throw new ApiError(400, "Invalid video ID");
    };

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(500, "Something went wrong while looking for the video");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, video,"Video found successfully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if(!videoId) {
        throw new ApiError(400, "Video ID is missing");
    };

    const video = await Video.findById(videoId);
    
    const {title, description} = req.body;
    
    if(title) {
        video.title = title;
        // await video.save({validateBeforeSave: false});
    };

    if(description) {
        video.description = description;
        // await video.save({validateBeforeSave: false});
    };
    
    const thumbnailLocalPath = req.file?.path;

    
    if(thumbnailLocalPath) {
        const thumbnailLink = video.thumbnail;
        
        await deleteFromCloudinary(thumbnailLink, "image");

        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        video.thumbnail = thumbnail.url
        // await video.save({ validateBeforeSave: false });
    };
    
    await video.save({ validateBeforeSave: false });

    

    const updatedVideo = await Video.findById(videoId);

    if(!updatedVideo) {
        throw new ApiError(500, "Something went wrong while updating the video");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!videoId) {
        throw new ApiError(400, "Invalid video ID");
    };

    const video = await Video.findById(videoId);
    const videoLink = video.videoFile;
    const thumbnailLink = video.thumbnail;
    
    await deleteFromCloudinary(videoLink, "video");
    await deleteFromCloudinary(thumbnailLink, "image");


    const deleteVideo = await Video.deleteOne({
        _id: videoId
    });

    if(!deleteVideo) {
        throw new ApiError(500, "Something went wrong while deleting the video")
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!videoId) {
        throw new ApiError(400, "Invalid video ID");
    };

    const video = await Video.findById(videoId);
    
    if (!video) {
        throw new ApiError(500, "Error while looking for the video");
    };
    const changeState = (prevState) => !prevState
    video.isPublished = changeState(video.isPublished);
    await video.save({ validateBeforeSave:false });

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video status changed successfully")
    );
});


export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}