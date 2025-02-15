import mongoose from "mongoose";
import { Comment } from "../routes/comment.routes.js";
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 1 } = req.query;
});
const addComment = asyncHandler(async (req, res) => {});
const updateComment = asyncHandler(async (req, res) => {});
const deleteComment = asyncHandler(async (req, res) => {});


export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}