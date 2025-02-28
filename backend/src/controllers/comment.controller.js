import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 1 } = req.query;

    if(!videoId) {
        throw new ApiError(400, "Invalid video ID");
    };

    const videoComments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $skip: (Number(page) - 1) * Number(limit) 
        },
        {
            $limit: Number(limit)
        },
        {
            $project: {
                owner: 1,
                content: 1,
                createdAt: 1
            }
        }
    ]);

    if(!videoComments) {
        throw new ApiError(500, "Something went wrong while fetching the comments");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, videoComments, "Comments for the video found successfully")
    );
});

const getUserComments = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 1 } = req.query;

    const userComments = await Comment.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $skip: (Number(page) - 1) * Number(limit)
        },
        {
            $limit: Number(limit)
        },
        {
            $project: {
                video: 1,
                content: 1,
                createdAt: 1
            }
        }
    ]);

    if(!userComments) {
        throw new ApiError(500, "Something went wrong while fetching the comments");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, userComments, "Comments of the user found successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { videoId } = req.params;

    if(!videoId) {
        throw new ApiError(400, "Video ID is invalid");
    };

    if(!content) {
        throw new ApiError(400, "Comment is empty or not provided");
    };

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    });

    if(!comment) {
        throw new ApiError(500, "something went wrong while posting the comment");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment posted successfully")
    );
});


const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { commentId } = req.params;

    if(!commentId) {
        throw new ApiError(400, "Invalid comment ID");
    };

    if(!content) {
        throw new ApiError(400, "Comment is empty or not provided");
    };

    const findComment = await Comment.findById(commentId);

    if(!findComment) {
        throw new ApiError(400, "The comment you're trying to update doesn't exist or the comment ID is wrong");
    };


    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    );

    if(!updatedComment) {
        throw new ApiError(500, "Something went wrong while updating the comment");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    );
});


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if(!commentId) {
        throw new ApiError(400, "Invalid comment ID");
    };

    const findComment = await Comment.findById(commentId);

    if(!findComment) {
        throw new ApiError(400, "The comment you're trying to delete doesn't exist or the comment ID is wrong");
    };

    const deletedComment = await Comment.deleteOne(
        {
            _id: commentId
        }
    );

    if(!deletedComment) {
        throw new ApiError(500, "Something went wrong while deleting the comment");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    );
});


export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
    getUserComments
}