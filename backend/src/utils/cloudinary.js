import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async function (localFilePath) {
    try {
        if (!localFilePath) return null;
        //upload to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        //file has been uploaded successfully
        // console.log('File is uploaded on cloudinary ', response.url);
        fs.unlinkSync(localFilePath); //remove the locally saved temp file after the upload operation succeeds
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath); //remove the locally saved temp file as the upload operation failed
        return null;
    };
};


const deleteFromCloudinary = async function (link, type) {
    try {
            const publicId = link.split("/").pop().split(".")[0];

            console.log(publicId);
            
            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type: type
            });

            // console.log(result);
    } catch (error) {
        console.log(error);
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };