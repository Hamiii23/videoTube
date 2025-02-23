import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if(!name && !description) {
        throw new ApiError(400, "Name and Description are required");
    };

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    });

    if(!playlist) {
        throw new ApiError(500, "Something went wrong while creating the playlist");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if(!userId) {
        throw new ApiError(400, "Invalid user ID");
    };

    const userPlaylists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
              name: 1,
              description: 1,
              video: 1,
              createdAt: 1,
              updatedAt: 1
            }
        }
    ]);

    if(!userPlaylists) {
        throw new ApiError(500, "Something went wrong while searching for the playlists");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, userPlaylists, "Playlists found successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if(!playlistId) {
        throw new ApiError("Invalid playlist ID");
    };

    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(500, "Something went wrong while looking for the playlist");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist with the ID is found")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;


    const existingVideo = await Playlist.findOne(
        {
            video: {
                $in: [videoId]
            }
        }
    );

    if(existingVideo) {
        throw new ApiError(400, "Video already exists in the playlist");
    };


    if(!playlistId && !videoId) {
        throw new ApiError("Invalid playlist and video ID");
    };
    
    const addedVideo = await Playlist.updateOne(
        {
            _id: playlistId
        },
        {
            $push: {
                video: videoId
            }
        }
    );
    
    
    if(!addedVideo) {
        throw new ApiError(400, "Something went wrong while adding the video to the playlist");
    };
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Video added to the playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params; 
    
    if(!playlistId && !videoId) {
        throw new ApiError("Invalid playlist and video ID");
    };

    const existingVideo = await Playlist.findOne(
        {
            video: {
                $in: [videoId]
            }
        }
    );

    if(!existingVideo) {
        throw new ApiError(400, "Video doesn't exists in the playlist");
    };


    const addedVideo = await Playlist.updateOne(
        {
            _id: playlistId
        },
        {
            $pull: {
                video: videoId
            }
        }
    );

    if(!addedVideo) {
        throw new ApiError(400, "Something went wrong while adding the video to the playlist");
    };
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Video removed to the playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if(!playlistId) {
        throw new ApiError(400, "Invalid playlist ID");
    };

    const deletedPlaylist = await Playlist.deleteOne({
        _id: playlistId
    });
    
    if(!deletedPlaylist) {
        throw new ApiError(500, "Something went wrong while deleting the playlist");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if(!playlistId) {
        throw new ApiError(400, "Invalid playlist ID");
    };
    
    if(!name || !description) {
        throw new ApiError(400, "Name or Description is required");
    };

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        }, 
        {
            new: true
        }
    );

    if(!updatedPlaylist) {
        throw new ApiError(500, "Something went wrong while updating the playlist");
    };

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}