import { Router } from 'express';
import { registerUser, loginUser, logOutUser, refreshAccessToken, changeCurrentPassword, updateAccountDetails, updateAvatar, updateCoverImage } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }   
    ]),
    registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT,logOutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").put(verifyJWT, changeCurrentPassword);

router.route("/update-details").put(verifyJWT, updateAccountDetails);

router.route("/update-avatar").put(
    verifyJWT, 
    upload.fields(
        {
            name: "avatar",
            maxCount: 1
        }
    ), updateAvatar
);

router.route("/update-cover").put(
    verifyJWT, 
    upload.fields(
        {
            name: "coverImage",
            maxCount: 1
        }
    ), updateCoverImage
);



export default router;